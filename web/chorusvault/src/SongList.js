// SongList.js
import React from 'react';

function SongList({ songs, handlePlaySong }) {
  return (
    <div className="song-list-section">
      <h2>Your Songs</h2>
      {songs.length === 0 && <p>No songs uploaded yet.</p>}
      <ul>
        {songs.map((song) => (
          <li
            key={song.song_id.S}
            onClick={() => handlePlaySong(song.song_id.S)}
            style={{ cursor: 'pointer', marginBottom: '0.5rem', color: 'blue' }}
          >
            {song.song_name.S} ({song.version.S})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SongList;
