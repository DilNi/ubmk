import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import SessionList from './components/SessionList';
import AdminPanel from './components/AdminPanel';
import AdminSessionList from './components/AdminSessionList';
function App() {
  const AdminButton = () => {
    const location = useLocation();

    if (location.pathname !== "/") {
      return null;
    }
    return (
      <div className="admin-login-container">
        <Link to="/admin/login" className="admin-login-button">
          Admin Girişi
        </Link>
      </div>
    );
  };

  return (
    <Router>
      <div className="app-container">

        <AdminButton />
        <Routes>
          <Route path="/" element={<SessionList />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin" element={<Navigate to="/admin/login" />} />
          <Route path="/admin/sessions" element={<AdminSessionList />} />
          <Route path="*" element={<h1>404 - Sayfa Bulunamadı</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
