import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [session, setSession] = useState({
    title: '',
    date: '',
    type: '',
    speaker: '',
    description: '',
    code: '',
    startTime: '',
    endTime: '',
    location: '',
    sessionChair: '',
  });
  const [pdfFile, setPdfFile] = useState(null);

  // Oturumları API'den çek
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/sessions/list');
        setSessions(response.data);
      } catch (error) {
        console.error('Oturumlar alınırken hata oluştu:', error);
      }
    };

    fetchSessions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSession({ ...session, [name]: value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Backend'e gönderilecek oturum verilerini hazırlayın
      const response = await api.post('/sessions/add', session, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 201) {
        alert('Oturum başarıyla eklendi!');
        // Formu temizle
        setSession({
          title: '',
          date: '',
          type: '',
          speaker: '',
          description: '',
          code: '',
          startTime: '',
          endTime: '',
          location: '',
          sessionChair: '',
        });
  
        // Yeni oturumu listeye ekleyin
        setSessions([...sessions, response.data.session]);
      }
    } catch (error) {
      console.error('Oturum eklenirken hata oluştu:', error);
      alert('Oturum eklenirken bir hata oluştu.');
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(sessions.filter((s) => s._id !== id));
      alert('Oturum başarıyla silindi!');
    } catch (error) {
      console.error('Oturum silme sırasında hata oluştu:', error);
    }
  };

  const handleUpdate = (id) => {
    const sessionToUpdate = sessions.find((s) => s._id === id);
    setSession(sessionToUpdate);
    setShowSessions(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="admin-panel-container">
      <div className="header">
        <button onClick={handleLogout} className="logout-button">Çıkış Yap</button>
      </div>

      <div className="form-container">
        <h1>Oturum Ekle</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Oturum Başlığı</label>
            <input
              type="text"
              id="title"
              name="title"
              value={session.title}
              onChange={handleChange}
              placeholder="Başlık Girin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Tarih</label>
            <input
              type="date"
              id="date"
              name="date"
              value={session.date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Tür</label>
            <input
              type="text"
              id="type"
              name="type"
              value={session.type}
              onChange={handleChange}
              placeholder="Tür Girin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="speaker">Konuşmacı</label>
            <input
              type="text"
              id="speaker"
              name="speaker"
              value={session.speaker}
              onChange={handleChange}
              placeholder="Konuşmacı Adı Girin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              name="description"
              value={session.description}
              onChange={handleChange}
              placeholder="Açıklama Girin"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="code">Oturum Kodu</label>
            <input
              type="text"
              id="code"
              name="code"
              value={session.code}
              onChange={handleChange}
              placeholder="Oturum Kodu Girin"
            />
          </div>
          <div className="time-group">
            <div>
              <label htmlFor="startTime">Başlama Saati</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={session.startTime}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="endTime">Bitiş Saati</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={session.endTime}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="location">Yer</label>
            <input
              type="text"
              id="location"
              name="location"
              value={session.location}
              onChange={handleChange}
              placeholder="Yer Girin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="sessionChair">Oturum Başkanı</label>
            <input
              type="text"
              id="sessionChair"
              name="sessionChair"
              value={session.sessionChair}
              onChange={handleChange}
              placeholder="Oturum Başkanı Girin"
            />
          </div>
          <button type="submit" className="submit-button">Oturumu Kaydet</button>
        </form>

        <button
          onClick={() => navigate('/admin/sessions')}
          className="view-sessions-button"
        >
          Oturumları Görüntüle
        </button>
      </div>

      {showSessions && (
        <div className="session-list">
          <h2>Mevcut Oturumlar</h2>
          {sessions.map((session) => (
            <div key={session._id} className="session-item">
              <h3>{session.title}</h3>
              <button onClick={() => handleUpdate(session._id)} className="update-button">Güncelle</button>
              <button onClick={() => handleDelete(session._id)} className="delete-button">Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
