import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './SessionList.css';
import { useNavigate } from 'react-router-dom';

function AdminSessionList() {
  const [sessions, setSessions] = useState([]);
  const [groupedByType, setGroupedByType] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sessionToUpdate, setSessionToUpdate] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/sessions/list');
        const data = response.data;

        // Türlere göre gruplama
        const grouped = data.reduce((acc, session) => {
          acc[session.type] = acc[session.type] || [];
          acc[session.type].push(session);
          return acc;
        }, {});
        setGroupedByType(grouped);
        setSessions(data);
      } catch (error) {
        console.error('Oturumlar alınırken hata oluştu:', error);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/sessions/${id}`);
      const updatedSessions = sessions.filter((s) => s._id !== id);
      setSessions(updatedSessions);

      const grouped = updatedSessions.reduce((acc, session) => {
        acc[session.type] = acc[session.type] || [];
        acc[session.type].push(session);
        return acc;
      }, {});
      setGroupedByType(grouped);

      if (!grouped[selectedType] || grouped[selectedType].length === 0) {
        alert(`"${selectedType}" türünde oturum kalmadı, tür seçim ekranına yönlendiriliyorsunuz.`);
        setSelectedType(null);
      } else {
        alert('Oturum başarıyla silindi!');
      }
    } catch (error) {
      console.error('Oturum silme sırasında hata oluştu:', error);
      alert('Oturum silinirken bir hata oluştu.');
    }
  };

  const openModal = (session) => {
    setSessionToUpdate(session);
    setShowModal(true);
  };

  const closeModal = () => {
    setSessionToUpdate(null);
    setShowModal(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(sessionToUpdate).forEach((key) => {
      formData.append(key, sessionToUpdate[key]);
    });
    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }

    try {
      const response = await api.put(`/sessions/${sessionToUpdate._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        alert('Oturum başarıyla güncellendi!');
        const updatedSessions = await api.get('/sessions/list');
        setSessions(updatedSessions.data);

        const grouped = updatedSessions.data.reduce((acc, session) => {
          acc[session.type] = acc[session.type] || [];
          acc[session.type].push(session);
          return acc;
        }, {});
        setGroupedByType(grouped);
        closeModal();
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında bir hata oluştu.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSessionToUpdate({ ...sessionToUpdate, [name]: value });
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  return (
    <div className="session-list-container">
      <h1>Admin Oturum Yönetimi</h1>
      {!selectedType && (
        <button onClick={() => navigate('/admin/panel')} className="back-button">
          Geri
        </button>
      )}

      {sessions.length === 0 ? ( // Eğer oturum yoksa
        <div className="empty-message">
          <p>Kayıtlı oturum bulunmamaktadır.</p>
        </div>
      ) : !selectedType ? (
        <div className="group-cards">
          {Object.keys(groupedByType).map((type) => (
            <div
              key={type}
              className="group-card"
              onClick={() => setSelectedType(type)}
            >
              <h2>{type}</h2>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedType(null)}
            className="back-button"
          >
            Geri
          </button>

          <h2>{selectedType} Oturumları</h2>

          <div className="session-cards">
            {groupedByType[selectedType] && groupedByType[selectedType].length > 0 ? (
              groupedByType[selectedType].map((session) => (
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
                  {session.pdf && (
                    <p>
                      <strong>PDF:</strong> {session.pdf}
                    </p>
                  )}

                  <div className="crud-buttons">
                    <button onClick={() => openModal(session)}>Güncelle</button>
                    <button onClick={() => handleDelete(session._id)} className="delete-button">
                      Sil
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Bu türde gösterilecek oturum bulunmamaktadır.</p>
            )}
          </div>
        </div>
      )}

      {showModal && sessionToUpdate && (
        <div className="modal">
          <div className="modal-content">
            <h2>Oturumu Güncelle</h2>
            <form onSubmit={handleUpdateSubmit}>
              <input
                type="text"
                name="title"
                value={sessionToUpdate.title || ''}
                onChange={handleInputChange}
                placeholder="Başlık"
              />
              <input
                type="date"
                name="date"
                value={sessionToUpdate.date || ''}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="type"
                value={sessionToUpdate.type || ''}
                onChange={handleInputChange}
                placeholder="Tür"
              />
              <input
                type="text"
                name="speaker"
                value={sessionToUpdate.speaker || ''}
                onChange={handleInputChange}
                placeholder="Konuşmacı"
              />
              <textarea
                name="description"
                value={sessionToUpdate.description || ''}
                onChange={handleInputChange}
                placeholder="Açıklama"
              ></textarea>
              <input
                type="text"
                name="code"
                value={sessionToUpdate.code || ''}
                onChange={handleInputChange}
                placeholder="Kod"
              />
              <input
                type="time"
                name="startTime"
                value={sessionToUpdate.startTime || ''}
                onChange={handleInputChange}
              />
              <input
                type="time"
                name="endTime"
                value={sessionToUpdate.endTime || ''}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="location"
                value={sessionToUpdate.location || ''}
                onChange={handleInputChange}
                placeholder="Yer"
              />
              <input
                type="text"
                name="sessionChair"
                value={sessionToUpdate.sessionChair || ''}
                onChange={handleInputChange}
                placeholder="Oturum Başkanı"
              />

              <div className="modal-buttons">
                <button type="submit">Kaydet</button>
                <button type="button" onClick={closeModal}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSessionList;
