import React, { useState } from 'react';
import axios from 'axios';

const SongUpload = () => {
  const [songFile, setSongFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setSongFile(e.target.files[0]);
  };

  const getPresignedUrl = async () => {
    try {
      // Request the presigned URL from your API (Lambda function via API Gateway)
      const response = await axios.post('https://2gv0bqmref.execute-api.eu-central-1.amazonaws.com/chorusvault_stage/upload_song', {
        song_id: '1',  // For now, you can hardcode this, later it could be dynamic
        version: 'v1',
        timestamp: Date.now(),
      });
      return response.data.presigned_url;
    } catch (error) {
      console.error('Error fetching presigned URL:', error);
      throw new Error('Unable to get presigned URL.');
    }
  };

  const handleUpload = async () => {
    if (!songFile) {
      alert('Please select a song to upload!');
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Get the presigned URL from your API
      const presignedUrl = await getPresignedUrl();

      // Step 2: Upload the song directly to S3 using the presigned URL
      const formData = new FormData();
      formData.append('file', songFile);

      const uploadResponse = await axios.put(presignedUrl, songFile, {
        headers: {
          'Content-Type': songFile.type,  // Ensure the file type is correctly set
        },
      });

      console.log('Song uploaded successfully:', uploadResponse);
      alert('Song uploaded successfully!');
    } catch (error) {
      console.error('Error uploading song:', error);
      alert('Error uploading song. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Song'}
      </button>
    </div>
  );
};

export default SongUpload;
