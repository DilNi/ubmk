import React from 'react';

const SelectedSessions = ({ selectedSessions }) => {
  return (
    <div>
      <h3>Seçilen Oturumlar</h3>
      <ul>
        {selectedSessions.map((session) => (
          <li key={session._id}>
            {session.title} - {session.date} {session.time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectedSessions;
