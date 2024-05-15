import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Round from "./Round";
import { useState, useRef, useEffect } from 'react';

export default function Game({ difficulty }) {
  const [gameOver, setGameOver] = useState(false);
  const [professor, setProfessor] = useState('');
  const [score, setScore] = useState(0);

  // Sets accuracyThreshold for gameOver state
  let accuracyThreshold;
  if (difficulty === 'Easy') {
    accuracyThreshold = 65;
  } else if (difficulty === 'Medium') {
    accuracyThreshold = 80;
  } else if (difficulty === 'Hard') {
    accuracyThreshold = 93;
  }

  // Audio used in animation
  const lightSwitchAudio = new Audio('/audio/lightswitch.mp3');
  lightSwitchAudio.volume = 0.4;
  const playLightSwitchAudio = () => { lightSwitchAudio.play(); };

  // Background music (fades in)
  useEffect(() => {
    const audio = new Audio('/audio/NoDestination.mp3');
    audio.loop = true;
    audio.volume = 0;
    audio.play();

    const fadeDuration = 10000;
    const fadeStep = 0.01;
    const fadeInterval = fadeDuration / (1 / fadeStep);
    let currentVolume = 0;
    const fadeAudioIn = setInterval(() => {
      if (currentVolume < 0.2) {
        currentVolume = Math.min(currentVolume + fadeStep, 0.2);
        audio.volume = currentVolume;
      } else {
        clearInterval(fadeAudioIn);
      }
    }, fadeInterval);

    return () => {
      clearInterval(fadeAudioIn);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [professor]);

  const tl = gsap.timeline({});
  const tlRef = useRef(tl);
  useGSAP(() => {
    // Lights turn on
    gsap.set('#background', { delay: 1.5, filter: 'brightness(1)', onComplete: playLightSwitchAudio } )
  }, []);

  // ------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="relative h-screen flex justify-center">

      {/* Background div */}
      <div
        id="background"
        className={`absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25] ${gameOver ? 'brightness-[.25]' : ''}`}
      />

      {/* Render Round component as long as game is not over */}
      {!gameOver &&
        <Round setGameOver={setGameOver} accuracyThreshold={accuracyThreshold} setProfessor={setProfessor} professor={professor} setScore={setScore} score={score} />
      }

      {gameOver &&
        <div className="z-10 grid place-content-center text-center">
          <div className="text-9xl text-red-500 select-none">GAME OVER</div>
          <div className="text-7xl text-white select-none">Professors Profiled: {score}</div>
        </div>
      }
    
    </div>
  );
}