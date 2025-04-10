import './App.css';
import React, { useState } from 'react';
import { loginUser } from './aws-service';  // Import the function from aws-service.js
import axios from 'axios';
import {
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';

function App() {
  // State for handling username, password, and login status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // To capture any login errors
  const [loading, setLoading] = useState(false); // For loading state

  // State for setting a new password
  const [newPassword, setNewPassword] = useState('');
  const [showNewPasswordField, setShowNewPasswordField] = useState(false);
  const [authChallengeSession, setAuthChallengeSession] = useState(null);
  // JWT
  const [accessToken, setAccessToken] = useState(null); // Add this state
  // State for song upload
  const [songs, setSongs] = useState([]); // All song metadata from DynamoDB
  const [songName, setSongName] = useState('');
  const [version, setVersion] = useState('');
  const [songFile, setSongFile] = useState(null);  // The file to be uploaded
  const [isUploading, setIsUploading] = useState(false); // For tracking upload state
  const [uploadError, setUploadError] = useState(null);  // For upload error messages
  const [uploadSuccess, setUploadSuccess] = useState(false); // For upload success
  const [songUrl, setSongUrl] = useState(null); // State to store the song URL for playback

  const fetchSongs = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/fetch_song_metadata`, {
        headers: { Authorization: token }
      });
      console.log(response)
      setSongs(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  const handlePlaySong = async (songId) => {
    try {
      const url = await getPresignedUrlForGet(songId);
      setSongUrl(url);
    } catch (error) {
      setError('Unable to play song.');
    }
  };
  
  // Handle login when the user clicks the button
  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Perform the login
      const result = await loginUser(username, password);
      console.log('Login result', result);

      // Check if the result indicates a NEW_PASSWORD_REQUIRED challenge
      if (result?.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        setShowNewPasswordField(true);  // Show the new password field for the user to reset their password
        setAuthChallengeSession(result.Session);  // Save the session for the password reset request
        setError('You must set a new password to continue.');
        return;
      }

      // Normal login flow
      console.log('Logged in successfully');

      // If the login was successful, extract the JWT token
      const accessToken = result?.AuthenticationResult?.AccessToken;

      if (accessToken) {
        setAccessToken(accessToken);  // Store the token in state or your preferred storage
        setError(null); // Clear any errors
        await fetchSongs(accessToken);
      } else {
        setError('Failed to retrieve access token.');
      }

    } catch (err) {
      console.error('Login failed', err);
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
    console.log(songId)
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

const handleTogglePlay = () => {
  const audioElement = document.getElementById('audio-player');
  if (audioElement.paused) {
    audioElement.play().catch((error) => {
      console.error('Error starting playback:', error);
    });
  } else {
    audioElement.pause();
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
      console.log(uploadResponse)
      // After the song is uploaded, get the presigned URL for GET and set the song URL
      const songId = uploadResponse.data.song_id; // Assuming the response contains a song_id
      const songUrl = await getPresignedUrlForGet(songId);
      setSongUrl(songUrl);  // Set the song URL for playback
    } catch (error) {
      console.error('Error uploading song:', error);
      setUploadError('Error uploading song. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="App">
      {/* User login status display */}
      {accessToken && (
        <div className="user-info-container">
          <span className="user-info">@{username}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {/* Login Form */}
      {!accessToken && (
        <div className="login-container">
          <h1>Welcome</h1>
          <p>Login to ChorusVault</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* NEW PASSWORD REQUIRED FLOW */}
          {showNewPasswordField && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'orange' }}>
                A new password is required. Please set your new password below:
              </p>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={handleNewPassword}>
                Submit New Password
              </button>
            </div>
          )}
        </div>
      )}

      {/* Song Upload Section (only visible after login) */}
      {accessToken && (
        <div className="upload-section">
          <h2>Upload Song</h2>
          <input
            type="text"
            placeholder="Song Name"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Version (e.g. v1)"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Song'}
          </button>

          {uploadSuccess && <p style={{ color: 'green' }}>Song uploaded successfully!</p>}
          {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}

          <div className="song-list-section">
            <h2>Your Songs</h2>
            {songs.length === 0 && <p>No songs uploaded yet.</p>}
            <ul>
              {songs.map((song) => {
                const songName = song.song_name?.S || "Unknown Song";
                const version = song.version?.S || "No version";
                const songId = song.song_id?.S || "No ID";

                return (
                  <li
                    key={songId}
                    onClick={() => handlePlaySong(songId)}
                    style={{ cursor: 'pointer', marginBottom: '0.5rem', color: 'blue' }}
                  >
                    {songName} ({version})
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

{/* Audio Player */}
{songUrl && (
  <div className="audio-player">
    <h3>Now Playing</h3>
    <audio id="audio-player" controls key={songUrl}>
      <source src={songUrl} type="audio/mp3" />
      Your browser does not support the audio element.
    </audio>
    <button onClick={handleTogglePlay}>
      {document.getElementById('audio-player')?.paused ? 'Play' : 'Pause'}
    </button>
  </div>
)}
    </div>
  );
}

export default App;
