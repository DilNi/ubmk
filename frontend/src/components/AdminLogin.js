import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();


    if (username === 'admin' && password === 'password') {
      console.log('Giriş başarılı');
      navigate('/admin/panel');
    } else {
      console.log('Giriş başarısız');
      alert('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div className="admin-login-container1">
      <div className="login-box">
        <h1>Admin Girişi</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı Adı"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
            />
          </div>
          <button type="submit" className="login-button">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
