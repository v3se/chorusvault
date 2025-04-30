// UploadForm.js
import React from 'react';

function UploadForm({
  songName,
  setSongName,
  version,
  setVersion,
  handleFileChange,
  handleUpload,
  isUploading,
  uploadSuccess,
  uploadError
}) {
  return (
    <div className="upload-section">
      <h2>Upload Song</h2>
      <input type="text" placeholder="Song Name" value={songName} onChange={(e) => setSongName(e.target.value)} />
      <input type="text" placeholder="Version (e.g. v1)" value={version} onChange={(e) => setVersion(e.target.value)} />
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Song'}
      </button>

      {uploadSuccess && <p style={{ color: 'green' }}>Song uploaded successfully!</p>}
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    </div>
  );
}

export default UploadForm;
