// src/App.js
import React, { useState } from 'react';
import { loginUser } from './aws-service';  // Import the function from aws-service.js
import axios from 'axios';

function App() {
  // State for handling username, password, and login status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // To capture any login errors
  const [loading, setLoading] = useState(false); // For loading state

  // State for song upload
  const [songFile, setSongFile] = useState(null);  // The file to be uploaded
  const [isUploading, setIsUploading] = useState(false); // For tracking upload state
  const [uploadError, setUploadError] = useState(null);  // For upload error messages
  const [uploadSuccess, setUploadSuccess] = useState(false); // For upload success

  // Handle login when the user clicks the button
  const handleLogin = async () => {
    setLoading(true);
    setError(null); // Reset previous error

    try {
      const result = await loginUser(username, password);
      console.log('Login successful', result);
      // Redirect or update state as needed after login
    } catch (err) {
      console.error('Login failed', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
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
      const response = await axios.post('https://2gv0bqmref.execute-api.eu-central-1.amazonaws.com/chorusvault_stage/upload_song', {
        song_id: '2',  // Hardcoded song_id for now (you can make this dynamic if needed)
        version: 'v1',
        timestamp: Date.now(),
      });
      return response.data.presigned_url;
    } catch (error) {
      console.error('Error fetching presigned URL:', error);
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
      // Step 1: Get the presigned URL from your Lambda backend
      const presignedUrl = await getPresignedUrl();

      // Step 2: Upload the song to S3 using the presigned URL
      const uploadResponse = await axios.put(presignedUrl, songFile, {
        headers: {
          'Content-Type': songFile.type,  // Ensure the correct content type
        },
      });

      console.log('Song uploaded successfully:', uploadResponse);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error uploading song:', error);
      setUploadError('Error uploading song. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="App">
      <h1>Login to My App</h1>

      {/* Login Form */}
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

      {/* Display login error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Song Upload Section */}
      <div>
        <h2>Upload Song</h2>
        {/* File Input */}
        <input type="file" onChange={handleFileChange} />
        
        {/* Upload Button */}
        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Song'}
        </button>

        {/* Display upload status */}
        {uploadSuccess && <p style={{ color: 'green' }}>Song uploaded successfully!</p>}
        {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
      </div>
    </div>
  );
}

export default App;
