'use client'
import Game from "./components/Game";
import StartPage from "./components/StartPage";
import { useState } from 'react';

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
    console.log(difficulty)
  };
  
  return (
    <>
      {/* Render start page if game hasn't clicked start */}
      {!shouldGameStart && <StartPage handleGameStart={startGame} handleSetDifficulty={setSelectedDifficulty} difficulty={difficulty} />}

      {/* Render game page if user clicked start */}
      {shouldGameStart && <Game difficulty={difficulty} />}
    </>
  );
}