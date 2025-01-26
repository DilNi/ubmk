import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './SessionList.css';

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [groupedByType, setGroupedByType] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [filters, setFilters] = useState({ date: '', sessionChair: '' });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/sessions/list');
        const data = response.data;

        // Eğer oturum yoksa grup boş olmalı
        if (data.length === 0) {
          setGroupedByType({});
        } else {
          // Türlere göre gruplama
          const grouped = data.reduce((acc, session) => {
            acc[session.type] = acc[session.type] || [];
            acc[session.type].push(session);
            return acc;
          }, {});
          setGroupedByType(grouped);
        }

        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  const handleDownloadPDF = async (sessionTitle) => {
    try {
      const response = await api.get(`/sessions/pdf/${sessionTitle}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sessionTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF indirilemedi:', error);
      alert('PDF indirilemedi. Sunucuya bağlanılamıyor.');
    }
  };

  const filteredSessions = selectedType
    ? groupedByType[selectedType]?.filter((session) => {
        const isDateMatch = filters.date
          ? new Date(session.date).toISOString().split('T')[0] === filters.date
          : true;

        const isSessionChairMatch = filters.sessionChair
          ? session.sessionChair.toLowerCase().includes(filters.sessionChair.toLowerCase())
          : true;

        return isDateMatch && isSessionChairMatch;
      }) || []
    : [];

    return (
      <div className="session-list-container">
        <h1>Uluslararası Bilgi​sayar Bilimleri ve Mühendisliği ​Konferansı (UBMK 2024)</h1>
    
        {sessions.length === 0 ? ( // Eğer oturum yoksa
          <div className="empty-message">
            <p>Henüz herhangi bir oturum bulunmamaktadır.</p>
          </div>
        ) : !selectedType ? (
          <div className="group-cards">
            {Object.keys(groupedByType).map((type) => (
              <div
                key={type}
                className="group-card"
                onClick={() => {
                  setSelectedType(type);
                  setFilters({ date: '', sessionChair: '' });
                }}
              >
                <h2>{type}</h2>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setSelectedType(null);
                setFilters({ date: '', sessionChair: '' });
              }}
              className="back-button"
            >
              Geri
            </button>
    
            <h2>{selectedType} Oturumları</h2>
    
            <div className="filter-container">
              <label>
                Tarih:
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFilters({ ...filters, [name]: value });
                  }}
                />
              </label>
              <label>
                Oturum Başkanı:
                <input
                  type="text"
                  name="sessionChair"
                  value={filters.sessionChair}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFilters({ ...filters, [name]: value });
                  }}
                  placeholder="Oturum Başkanı Girin"
                />
              </label>
            </div>
    
            <div className="session-cards">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <div key={session._id} className="session-card">
                    <h3>{session.title}</h3>
                    <p>
                      <strong>Tarih:</strong> {new Date(session.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Konu:</strong> {session.code}: {session.description}
                    </p>
                    <p>
                      <strong>Konuşmacı:</strong> {session.speaker}
                    </p>
                    <p>
                      <strong>Zaman:</strong> {session.startTime} - {session.endTime}
                    </p>
                    <p>
                      <strong>Yer:</strong> {session.location}
                    </p>
                    <p>
                      <strong>Oturum Başkanı:</strong> {session.sessionChair}
                    </p>
                    {session.pdf ? (
                      <button onClick={() => handleDownloadPDF(session.title)}>
                        PDF İndir
                      </button>
                    ) : (
                      <p>Bu oturum için PDF bulunmamaktadır.</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-message">Bu türde gösterilecek oturum bulunmamaktadır.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
    
}

export default SessionList;
