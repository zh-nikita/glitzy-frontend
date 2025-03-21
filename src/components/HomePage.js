import React, { useEffect, useState } from 'react';
import './HomePage.css';
import mainVideo from '../assets/main.mp4';
import coinImage from '../assets/coin.png';
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : "Ready!"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [coins, setCoins] = useState([]);
  useEffect(() => {
    const generatedCoins = [...Array(20)].map(() => ({
      randomX: Math.random(),
      randomY: Math.random(),
      randomDuration: 4 + Math.random() * 4,
    }));
    setCoins(generatedCoins);
  }, []);
  
  return (
    <div className="home-container">
      <video autoPlay loop muted className="background-video">
        <source src={mainVideo} type="video/mp4" />
      </video>
      
      <div className="content">
        <h1 className="floating-text">{t("home_welcome")}</h1>

        <div className="countdown-container">
          <p className="countdown-text">{t("next_event")}: <span>{countdown}</span> {t("seconds")}</p>
        </div>

        <a href="/mines" className="play-button">{t("play_now")}</a>
        <p className="description">{t("home_description")}</p>
      </div>

      <div className="particle-container">
        {coins.map((coin, i) => (
          <img
            key={i}
            src={coinImage}
            alt={t("coin")}
            className="coin-particle"
            style={{
              left: `${coin.randomX * 100}%`,
              top: `${coin.randomY * 100}%`,
              animationDuration: `${coin.randomDuration}s`,
              animationDelay: `0.5s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;