import React, { useState } from 'react';

const SessionFilter = ({ onFilterChange }) => {
  const [date, setDate] = useState('');

  const handleDateChange = (e) => {
    setDate(e.target.value);
    onFilterChange(e.target.value);
  };

  return (
    <div>
      <h3>Tarih ile Filtrele</h3>
      <input
        type="date"
        value={date}
        onChange={handleDateChange}
      />
    </div>
  );
};

export default SessionFilter;
