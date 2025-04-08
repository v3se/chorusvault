import React from 'react';

const SongPlayer = ({ songUrl }) => {
  return (
    <div>
      <audio controls>
        <source src={songUrl} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default SongPlayer;
