import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import WithdrawModal from './WithdrawModal';
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Header = ({ user, onOpenDeposit, onOpenLogin }) => {
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="logo">GLITZY</h1>
          <nav className="nav">
            <ul>
              <li><Link to="/">{t("header.home")}</Link></li>
              <li><Link to="/mines">{t("header.mines")}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="language-switcher">
          <button onClick={() => i18n.changeLanguage("en")}>🇬🇧 {t("English")}</button>
          <button onClick={() => i18n.changeLanguage("ru")}>🇷🇺 {t("Russian")}</button>
        </div>
        <div className="header-actions">
          <span className="balance">{t("header.balance")}: ${user?.balance?.toFixed(2) || "0.00"}</span>
          <button className="deposit-btn" onClick={onOpenDeposit}>{t("header.deposit")}</button>
          <button className="withdraw-btn" onClick={() => setWithdrawOpen(true)}>
            {t("header.withdraw")}
          </button>
          {!user && <button className="login-btn" onClick={onOpenLogin}>{t("header.login")}</button>}
        </div>
      </header>

      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setWithdrawOpen(false)} user={user} />
    </>
  );
};

export default Header;