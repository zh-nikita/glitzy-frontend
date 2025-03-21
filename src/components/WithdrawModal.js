import React, { useState, useEffect } from "react";
import "./WithdrawModal.css";
import { useTranslation } from "react-i18next";

const WithdrawModal = ({ isOpen, onClose, user }) => {
  const [amount, setAmount] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const { t } = useTranslation();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setMessage(t("error.enter_valid_amount"));
      return;
    }
    if (!username) {
      setMessage(t("error.enter_username"));
      return;
    }

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount), username }),
      });

      const data = await res.json();
      setMessage(data.message || t("success.withdraw_request_sent"));

      if (res.ok) {
        setAmount("");
        setUsername("");
        setTimeout(() => onClose(), 3000);
      }
    } catch (err) {
      setMessage(t("error.withdraw_processing"));
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="withdraw-modal-overlay">
      <div className="withdraw-modal">
        <button className="modal-close" onClick={() => onClose()}>×</button>
        <h2 className="modal-title">{t("withdraw_section.title")}</h2>

        <div className="withdraw-info">
          <h3>📌 {t("withdraw_section.instructions")}</h3>
          <table className="withdraw-table">
            <tbody>
              <tr>
                <td>1️⃣</td>
                <td>{t("withdraw_section.step1")}</td>
              </tr>
              <tr>
                <td>2️⃣</td>
                <td>{t("withdraw_section.step2")}</td>
              </tr>
              <tr>
                <td>3️⃣</td>
                <td>{t("withdraw_section.step3")}</td>
              </tr>
              <tr>
                <td>4️⃣</td>
                <td>{t("withdraw_section.step4")}</td>
              </tr>
              <tr>
                <td>5️⃣</td>
                <td>{t("withdraw_section.step5")}</td>
              </tr>
            </tbody>
          </table>

          <h4>⚠️ {t("withdraw_section.important_notes")}</h4>
          <ul>
            <li>{t("withdraw_section.note1")}</li>
            <li>{t("withdraw_section.note2")}</li>
            <li>{t("withdraw_section.note3")}</li>
          </ul>
          <a href="https://t.me/glitzy1withdraw_bot" target="_blank" className="telegram-link">
            👉 {t("withdraw_section.telegram_link")}
          </a>
        </div>

        <form onSubmit={handleWithdraw}>
          <div className="form-group">
            <label>{t("withdraw_section.enter_amount")}</label>
            <div className="input-container">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <button type="button" className="max-btn" onClick={() => setAmount(user?.balance || 0)}>
                {t("withdraw_section.max_button")}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t("withdraw_section.enter_username")}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button className="submit-btn" type="submit">{t("withdraw_section.request_button")}</button>
        </form>

        <p className="modal-message">{message}</p>
      </div>
    </div>
  );
};

export default WithdrawModal;