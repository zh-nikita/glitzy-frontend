// src/components/MinesGame.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MinesGame.css'; // Updated CSS file
import mineIcon from '../assets/bomb.png';
import gemIcon from '../assets/coin.png';
import treasureIcon from '../assets/coin.png'; // Add your treasure PNG
import bombIcon from '../assets/bomb.png'; // Add your bomb PNG
import clickSound from '../assets/click.mp3';
import bombSound from '../assets/bomb.mp3';
import gemSound from '../assets/gem.mp3';
import winSound from '../assets//win.mp3';
import loseSound from '../assets/lose.mp3';
import startSound from '../assets/start.mp3';
import { useTranslation } from "react-i18next";

const MinesGame = ({ user }) => {
  const { t } = useTranslation();
  const [grid, setGrid] = useState(Array(5).fill().map(() => Array(5).fill('HIDDEN')));
  const [gameState, setGameState] = useState('NOT_STARTED'); // NOT_STARTED, IN_PROGRESS, WON, LOST
  const [winnings, setWinnings] = useState(0);
  const [minesCount, setMinesCount] = useState(3); // Default number of mines
  const [minesLeft, setMinesLeft] = useState(minesCount);
  const [betAmount, setBetAmount] = useState(1); // Default bet amount
  const [showBetOptions, setShowBetOptions] = useState(false);
  const [showMinesOptions, setShowMinesOptions] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0); // Current multiplier
  const [soundOn, setSoundOn] = useState(true);  // Sound effects toggle
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(true);
  // Predefined bet amounts
  const betAmounts = [0.1, 0.5, 0.75, 1, 2, 3, 5, 8, 10, 15, 25, 50, 100, 200, 500, 1000];

  // Refs to track dropdowns and buttons
  const betDropdownRef = useRef(null);
  const minesDropdownRef = useRef(null);
  const betButtonRef = useRef(null);
  const minesButtonRef = useRef(null);
  const clickAudio = useRef(new Audio(clickSound));
  const bombAudio = useRef(new Audio(bombSound));
  const gemAudio = useRef(new Audio(gemSound));
  const winAudio = useRef(new Audio(winSound));
  const loseAudio = useRef(new Audio(loseSound));
  const startAudio = useRef(new Audio(startSound));

  const playSound = (audioRef) => {
    if (soundOn) {
        audioRef.current.currentTime = 0; // Reset sound to start
        audioRef.current.play();
    }
  };

    // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        betDropdownRef.current &&
        !betDropdownRef.current.contains(event.target) &&
        !betButtonRef.current.contains(event.target)
      ) {
        setShowBetOptions(false);
      }
      if (
        minesDropdownRef.current &&
        !minesDropdownRef.current.contains(event.target) &&
        !minesButtonRef.current.contains(event.target)
      ) {
        setShowMinesOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ensure only one dropdown is open at a time
  useEffect(() => {
    if (showBetOptions) {
      setShowMinesOptions(false);
    }
  }, [showBetOptions]);

  useEffect(() => {
    if (showMinesOptions) {
      setShowBetOptions(false);
    }
  }, [showMinesOptions]);
  
  useEffect(() => {
    const fetchGame = async () => {
        try {
            const response = await axios.get('/api/mines/game', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            const data = response.data;

            if (data.game) {
                setGrid(JSON.parse(data.game.grid));
                setMinesCount(data.game.mines_count);
                setGameState(data.game.game_state);
                setWinnings(data.game.winnings);
            }
        } catch (error) {
            console.error("Failed to load game:", error);
        } finally {
          setLoading(false);
        }
    };

    fetchGame();
}, []);

  // Start the Mines game
  const startGame = async () => {
    try {
      const response = await axios.post('/api/mines/start', { minesCount, betAmount }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGameState('IN_PROGRESS');
      playSound(startAudio);
      setWinnings(0);
      setMinesLeft(minesCount);
      setCurrentMultiplier(1.0); // Reset multiplier
      setGrid(Array(5).fill().map(() => Array(5).fill('HIDDEN'))); // Reset the grid
      alert('Mines game started!');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start the game.');
    }
  };

  // Reveal a tile
  const revealTile = async (row, col) => {
    if (gameState !== 'IN_PROGRESS') return;

    try {
      const response = await axios.post('/api/mines/reveal', { row, col }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const { reward, totalWinnings, result } = response.data;

      // Update the grid
      const newGrid = [...grid];
      newGrid[row][col] = reward;
      setGrid(newGrid);

      // Update winnings and current multiplier
      setWinnings(totalWinnings);
      setCurrentMultiplier(totalWinnings / betAmount);

      // Check if the game is over
      if (result === 'LOSE') {
        setGameState('LOST');
        playSound(bombAudio);
        alert('Game over! You hit a mine.');
      } else {
        setMinesLeft(minesLeft - 1);
        playSound(gemAudio);
      }
    } catch (error) {
      console.error('Error revealing tile:', error);
      alert('Failed to reveal tile.');
    }
  };

  // Cash out
  const cashOut = async () => {
    try {
      const response = await axios.post('/api/mines/cashout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const { totalWinnings, newBalance } = response.data;
      setGameState('WON');
      setWinnings(totalWinnings);

      if (totalWinnings >= betAmount * 5) {
          setShowBigWinAnimation(true);
          setTimeout(() => setShowBigWinAnimation(false), 4000);
      }

      if (totalWinnings > 0) {
          playSound(winAudio);
      } else {
          playSound(loseAudio);
      }

      // Check if winnings are more than 5x bet amount
      if (totalWinnings >= betAmount * 5) {
        setShowBigWinAnimation(true);
        setTimeout(() => setShowBigWinAnimation(false), 4000); // Animation lasts 4 seconds
      }

      alert(`Cash-out successful! You won $${totalWinnings}. New balance: $${newBalance}`);
    } catch (error) {
      console.error('Error cashing out:', error);
      alert('Failed to cash out.');
    }
};

// New state to trigger animation
const [showBigWinAnimation, setShowBigWinAnimation] = useState(false);

return (
  <div className="mines-game">
    {loading ? (
      <div className="loading-message">
        <p>Loading game data...</p>
      </div>
    ) : (
      <>
        <h1>{t("mines_game_title")}</h1>
        <button className="info-button" onClick={() => setShowInstructions(!showInstructions)}>
          {t("instructions.button")}
        </button>
        {showInstructions && (
          <div className="instructions-modal">
            <button className="close-button" onClick={() => setShowInstructions(false)}>×</button>
            <h2>{t("instructions.title")}</h2>
            <p>{t("instructions.description")}</p>
            <div className="casino-icons">
              <div className="casino-icon treasure">
                <img src={treasureIcon} alt={t("treasure_icon")} />
                <p>{t("instructions.treasure")}</p>
              </div>
              <div className="casino-icon bomb">
                <img src={bombIcon} alt={t("bomb_icon")} />
                <p>{t("instructions.bomb")}</p>
              </div>
            </div>
          </div>
        )}
        <div className="game-stats">
          <div className="stat">
            <span>{t("mines_left")}:</span>
            <span className="value">{minesLeft}</span>
          </div>
          <div className={`stat ${showBigWinAnimation ? 'big-win' : ''}`}>
            <span>{t("winnings")}:</span>
            <span className={`value ${showBigWinAnimation ? 'win-glow' : ''}`}>${winnings.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span>{t("balance")}:</span>
            <span className="value">${user?.balance || 0}</span>
            <div className="sound-controls">
              <button 
                className={`sound-toggle ${soundOn ? "sound-on" : "sound-off"}`} 
                onClick={() => {
                  playSound(clickAudio);
                  setSoundOn(!soundOn);
                }}
              >
                {t("sound")}: {soundOn ? t("on") : t("off")}
              </button>
            </div>
          </div>
        </div>

        {/* Bet Amount and Number of Mines (Top Row) */}
        <div className="bet-mines-container">
          <div className="bet-controls">
            <button
              ref={betButtonRef}
              className="bet-amount-btn"
              onClick={() => {
                playSound(clickAudio);
                setShowBetOptions(!showBetOptions);
              }}
            >
              Bet: ${betAmount}
            </button>
            {showBetOptions && (
              <div ref={betDropdownRef} className="dropdown active">
                {betAmounts.map((amount) => (
                  <div
                    key={amount}
                    className="dropdown-option"
                    onClick={() => {
                      setBetAmount(amount);
                      setShowBetOptions(false);
                    }}
                  >
                    ${amount}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mines-controls">
            <button
              ref={minesButtonRef}
              className="mines-count-btn"
              onClick={() => {
                playSound(clickAudio);
                setShowMinesOptions(!showMinesOptions);
              }}
            >
              Mines: {minesCount}
            </button>
            {showMinesOptions && (
              <div ref={minesDropdownRef} className="dropdown active">
                {Array.from({ length: 24 }, (_, i) => i + 1).map((count) => (
                  <div
                    key={count}
                    className="dropdown-option"
                    onClick={() => {
                      setMinesCount(count);
                      setShowMinesOptions(false);
                    }}
                  >
                    {count} Mines
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Grid */}
        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {row.map((tile, colIndex) => (
                <div
                  key={colIndex}
                  className={`tile ${tile === 'HIDDEN' ? 'hidden' : 'revealed'}`}
                  onClick={() => {
                    playSound(clickAudio);
                    revealTile(rowIndex, colIndex);
                  }}
                >
                  {tile === 'HIDDEN' ? '?' : (
                    tile === 'MINE' ? (
                      <img src={mineIcon} alt="Mine" className="tile-icon" />
                    ) : (
                      <img src={gemIcon} alt="Reward" className="tile-icon" />
                    )
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Start Game and Cash Out (Bottom Row) */}
        <div className="bottom-controls">
          <button onClick={startGame} disabled={gameState === 'IN_PROGRESS'}>
            {t("start_game")}
          </button>
          <button onClick={() => {
            playSound(clickAudio);
            cashOut();
          }} disabled={gameState !== 'IN_PROGRESS'}>
            {t("cash_out")} (${(betAmount * currentMultiplier).toFixed(2)})
          </button>
        </div>
      </>
    )}
  </div>
);
};

export default MinesGame;