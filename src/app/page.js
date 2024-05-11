'use client'

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
  const setSelectedDifficulty = (difficulty) => {
    setDifficulty(difficulty);
    console.log('Selected difficulty:', difficulty);
  };
  
  return (
    <>
      {!shouldGameStart&& <StartPage handleGameStart={startGame} handleSetDifficulty={setSelectedDifficulty} difficulty={difficulty} />}
    </>
  );
}