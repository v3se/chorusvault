import './App.css';
import WaveSurfer from 'wavesurfer.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CognitoIdentityProviderClient, RespondToAuthChallengeCommand } from '@aws-sdk/client-cognito-identity-provider';

import LoginForm from './LoginForm';
import UploadForm from './UploadForm';
import SongList from './SongList';
import AudioPlayer from './AudioPlayer';
import { loginUser } from './aws-service';


function App() {
  // State management as before
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPasswordField, setShowNewPasswordField] = useState(false);
  const [authChallengeSession, setAuthChallengeSession] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [songs, setSongs] = useState([]);
  const [songName, setSongName] = useState('');
  const [version, setVersion] = useState('');
  const [songFile, setSongFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [songUrl, setSongUrl] = useState(null);

  // New ref for WaveSurfer instance
  const wavesurferRef = useRef(null);
  const currentSongUrlRef = useRef(null);


  useEffect(() => {
    if (!songUrl) return;
  
    // Make sure the DOM element exists
    const waveformEl = document.getElementById('waveform');
    if (!waveformEl) {
      console.warn('Waveform container not found. Delaying init.');
      return;
    }
  
    // Load the waveform
    initializeWaveSurfer(songUrl);
  }, [songUrl]);
  
  
  

  // Fetch song data
  const fetchSongs = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/fetch_song_metadata`, {
        headers: { Authorization: token }
      });
      setSongs(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  // Setup WaveSurfer.js for audio visualization
  const initializeWaveSurfer = (url) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('Invalid or missing URL in initializeWaveSurfer:', url);
      return;
    }
  
    const container = document.getElementById('waveform');
    if (!container) {
      console.warn('Waveform container does not exist.');
      return;
    }
  
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
  
    const waveSurferInstance = WaveSurfer.create({
      container,
      waveColor: 'violet',
      progressColor: 'purple',
      height: 120,
      barWidth: 5,
      barRadius: 10,
      plugins: [
        Hover.create({
          lineColor: '#ff0000',
          lineWidth: 2,
          labelBackground: '#555',
          labelColor: '#fff',
          labelSize: '11px',
        }),
      ],
    });
  
    waveSurferInstance.on('interaction', () => {
      waveSurferInstance.playPause();
    });
  
    waveSurferInstance.load(url);
    wavesurferRef.current = waveSurferInstance;
  };
  

  const handlePlaySong = async (songId) => {
    try {
      const url = await getPresignedUrlForGet(songId);
      
      if (url === currentSongUrlRef.current) {
        console.log('Same song clicked, not reloading.');
        return; // Don’t reinitialize if it’s the same URL
      }
  
      setSongUrl(url);
      currentSongUrlRef.current = url;
      initializeWaveSurfer(url);
    } catch (error) {
      setError('Unable to play song.');
    }
  };
  

  // Login and authentication logic (as before)
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginUser(username, password);
      if (result?.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        setShowNewPasswordField(true);
        setAuthChallengeSession(result.Session);
        setError('You must set a new password to continue.');
        return;
      }

      const accessToken = result?.AuthenticationResult?.AccessToken;
      if (accessToken) {
        setAccessToken(accessToken);
        setError(null);
        await fetchSongs(accessToken);
      } else {
        setError('Failed to retrieve access token.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear the access token and reset the relevant states
    setAccessToken(null);
    setUsername('');
    setPassword('');
    setError(null);
    setShowNewPasswordField(false);
    setNewPassword('');
    alert('You have been logged out.');
  };

  // Handle new password submission
  const handleNewPassword = async () => {
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    try {
      const client = new CognitoIdentityProviderClient({ region: process.env.REACT_APP_AWS_REGION });
      const command = new RespondToAuthChallengeCommand({
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
        Session: authChallengeSession,
        ChallengeResponses: {
          USERNAME: username,
          NEW_PASSWORD: newPassword,
        },
      });

      const response = await client.send(command);
      console.log('Password reset successful:', response);

      setShowNewPasswordField(false);
      setNewPassword('');
      setError(null);
      alert('Password updated successfully. Please log in again.');
    } catch (err) {
      console.error('Failed to update password:', err);
      setError('Failed to update password. Please try again.');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSongFile(e.target.files[0]);
    setUploadError(null);  // Reset any previous errors
    setUploadSuccess(false);  // Reset previous success state
  };

  // Get Presigned URL from the backend (Lambda function via API Gateway)
  const getPresignedUrl = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/upload_song`, {
        version,
        timestamp: Date.now(),
        song_name: songName
      }, 
      {
        headers: { Authorization: accessToken }
      });
      return response.data.presigned_url;
    } catch (error) {
      console.error('Error fetching presigned URL:', error);
      throw new Error('Unable to get presigned URL.');
    }
  };

  // Function to get presigned URL for GET request (retrieve song from S3)
  const getPresignedUrlForGet = async (songId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/download_song`, {
        song_id: songId,
      },
      {
        headers: { Authorization: accessToken }
      });
      const { presigned_url } = response.data;

      return presigned_url;  // The presigned URL to be used in the audio player
    } catch (error) {
      console.error('Error fetching presigned URL for GET', error);
      throw new Error('Unable to get presigned URL.');
    }
  };

  // Handle song upload to S3
  const handleUpload = async () => {
    if (!songFile) {
      alert('Please select a song to upload!');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const presignedUrl = await getPresignedUrl();
      const uploadResponse = await axios.put(presignedUrl, songFile, {
        headers: { 'Content-Type': songFile.type }
      });

      console.log('Song uploaded successfully:', uploadResponse);
      setUploadSuccess(true);
      // After the song is uploaded, get the presigned URL for GET and set the song URL
      const songId = uploadResponse.data.song_id; // Assuming the response contains a song_id
      initializeWaveSurfer(songUrl);  // Initialize the waveform for the uploaded song
    } catch (error) {
      console.error('Error uploading song:', error);
      setUploadError('Error uploading song. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="App">
      {accessToken && (
        <div className="user-info-container">
          <span className="user-info">@{username}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {!accessToken && (
        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          loading={loading}
          error={error}
          showNewPasswordField={showNewPasswordField}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          handleNewPassword={handleNewPassword}
        />
      )}

      {accessToken && (
        <>
          <UploadForm
            songName={songName}
            setSongName={setSongName}
            version={version}
            setVersion={setVersion}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            isUploading={isUploading}
            uploadSuccess={uploadSuccess}
            uploadError={uploadError}
          />
          <SongList songs={songs} handlePlaySong={handlePlaySong} />
        </>
      )}

      {songUrl && <AudioPlayer />}
    </div>
  );
}

export default App;
