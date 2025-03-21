// src/components/DepositModal.js
import React, { useState, useEffect } from 'react';

import './DepositModal.css';
import { useTranslation } from "react-i18next";

const DepositModal = ({ onClose, username }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [pendingDeposits, setPendingDeposits] = useState([]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://t.me/send?start=IVuZxsJkK6r1");
    setMessage(t("deposit.link_copied"));
  };
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await fetch('/api/deposit/pending', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setPendingDeposits(data.filter(dep => dep.status === 'PENDING'));
      } catch (error) {
        console.error('Error fetching pending deposits:', error);
      }
    };
  
    fetchPending();
  }, []);
  

  return (
    <div className="deposit-modal-overlay">
      <div className="deposit-modal">
        <button className="modal-close" onClick={onClose}>×</button>

        {username ? (
          <>
            <h2>{t("deposit.title")}</h2>
            <p className="instructions">📌 {t("deposit.instructions")}</p>
            <ol>
              <li>{t("deposit.step1")}</li>
              <li>{t("deposit.step2")}</li>
              <li>{t("deposit.step3")}</li>
              <li>{t("deposit.step4")}</li>
              <li>{t("deposit.step5")}</li>
            </ol>
            <p>{t("deposit.support_info")}: <strong>glitzysupp0rt24.7@gmail.com</strong></p>
            <a className="deposit-link" href="https://t.me/send?start=IVuZxsJkK6r1" target="_blank" rel="noopener noreferrer">🚀 {t("deposit.open_link")}</a>
            <button className="copy-btn" onClick={handleCopyLink}>📋 {t("deposit.copy_link")}</button>
          </>
        ) : (
          <div className="login-required">
            <h2 className="modal-message">⚠️ {t("deposit.login_required")}</h2>
          </div>
        )}

        <p className="modal-message">{message}</p>
      </div>
    </div>
  );
};

export default DepositModal;