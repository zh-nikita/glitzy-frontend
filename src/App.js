// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import MinesGame from './components/MinesGame';
import LoginModal from './components/LoginModal';
import DepositModal from './components/DepositModal';
import './App.css';
import { useTranslation } from "react-i18next";
import "./i18n"; // ✅ This ensures i18n is initialized globally

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const fetchUser = async () => {
      try {
          const res = await fetch('/api/auth/user', { credentials: 'include' });
          const data = await res.json();
          if (data.username) {
              setUser(data);
          }
      } catch (error) {
          console.error('User fetch error:', error);
          setTimeout(fetchUser, 5000); // Retry after 5 seconds
      }
  };
    fetchUser();
  }, []);

  const handleOpenLogin = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);
  const handleOpenDeposit = () => setShowDeposit(true);
  const handleCloseDeposit = () => setShowDeposit(false);

  const handleDepositComplete = (depositAmount) => {
    if (user) {
      const updatedUser = { ...user, balance: (user.balance || 0) + depositAmount };
      setUser(updatedUser);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Header user={user} onOpenDeposit={handleOpenDeposit} onOpenLogin={handleOpenLogin} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mines" element={<MinesGame />} />
          </Routes>
        </main>

        {showLogin && <LoginModal onClose={handleCloseLogin} onLoginSuccess={setUser} onRegisterSuccess={setUser} />}
        {showDeposit && <DepositModal username={user ? user.username : ''} onClose={handleCloseDeposit} onDepositComplete={handleDepositComplete} />}
      </div>
    </Router>
  );
}

export default App;
