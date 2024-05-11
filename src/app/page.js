'use client'
import Game from "./components/Game";
import StartPage from "./components/StartPage";
import { useState, useEffect } from 'react';

export default function Home() {

  // Start game logic
  const [shouldGameStart, setGameStart] = useState(false);
  const startGame = (gameStart) => {
    setGameStart(!shouldGameStart);
  };

  // Setting difficulty logic
  const [difficulty, setDifficulty] = useState('Easy');
  const setSelectedDifficulty = (difficulty, accuracyThreshold) => {
    setDifficulty(difficulty);
    console.log(difficulty)
  };
  
  return (
    <>
      {/* Start Page */}
      {!shouldGameStart && <StartPage handleGameStart={startGame} handleSetDifficulty={setSelectedDifficulty} difficulty={difficulty} />}

      {/* Game */}
      {shouldGameStart && <Game difficulty={difficulty} />}
    </>
  );
}