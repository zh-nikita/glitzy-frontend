// src/components/LoginModal.js
import React, { useState } from 'react';
import './LoginModal.css';
import { useTranslation } from "react-i18next";

const LoginModal = ({ onClose, onLoginSuccess, onRegisterSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.error) {
        setMessage(data.error);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (error) {
      setMessage(t("error.login_failed"));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await response.json();

      if (data.error) {
        setMessage(data.error);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onRegisterSuccess(data.user);
        onClose();
      }
    } catch (error) {
      setMessage(t("error.registration_failed"));
    }
  };

  return (
  <div className="login-modal-overlay">
    <div className="login-modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <h2>{isRegister ? t("login.title_register") : (localStorage.getItem('token') ? t("login.account") : t("login.title_login"))}</h2>
      
      {!localStorage.getItem('token') ? (
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <div className="form-group">
            <label>{t("login.email")}:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          {isRegister && (
            <div className="form-group">
              <label>{t("login.username")}:</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          )}
          <div className="form-group">
            <label>{t("login.password")}:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button className="submit-btn" type="submit">
            {isRegister ? t("login.register_button") : t("login.login_button")}
          </button>
        </form>
      ) : (
        <div className="account-info">
          <p>{t("login.logged_in_as")} <strong>{JSON.parse(localStorage.getItem('user'))?.username}</strong></p>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
          }}>{t("login.logout_button")}</button>
        </div>
      )}

      <p className="modal-message">{message}</p>

      {!localStorage.getItem('token') && (
        <button className="switch-btn" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? t("login.switch_to_login") : t("login.switch_to_register")}
        </button>
      )}
    </div>
  </div>
  );
};

export default LoginModal;