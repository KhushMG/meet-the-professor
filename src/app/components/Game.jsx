import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Round from "./Round";
import { useState, useEffect, useRef } from 'react';
import { professors } from '../professors';

export default function Game({ difficulty }) {
  const [gameOver, setGameOver] = useState(false);
  const [professor, setProfessor] = useState('');

  // Sets accuracyThreshold for gameOver state
  let accuracyThreshold;
  if (difficulty === 'Easy') {
    accuracyThreshold = 60;
  } else if (difficulty === 'Medium') {
    accuracyThreshold = 75;
  } else if (difficulty === 'Hard') {
    accuracyThreshold = 90;
  }

  useEffect(() => {
    // Generate a new random professor
    const professor = professors[Math.floor((Math.random() * professors.length))];
    setProfessor(professor);
    console.log('Chosen Professor:', professor);
  }, []);

  // Audio used in animation
  const lightSwitchAudio = new Audio('/audio/lightswitch.mp3');
  lightSwitchAudio.volume = 0.4;
  const playLightSwitchAudio = () => { lightSwitchAudio.play(); };

  const tl = gsap.timeline({ delay: 1.5 });
  const tlRef = useRef(tl);
  useGSAP(() => {
    // Lights turn on
    tlRef.current.set('#background', { filter: 'brightness(1)', onComplete: playLightSwitchAudio })
  }, []);

  // ------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="relative h-screen flex justify-center">

      {/* Background div */}
      <div
        id="background"
        className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]"
      />

      {/* Render Round component as long as game is not over */}
      {!gameOver &&
        <Round tlRef={tlRef} setGameOver={setGameOver} accuracyThreshold={accuracyThreshold} setProfessor={setProfessor} professor={professor} />
      }

      {gameOver &&
        <div className="z-10 grid place-content-center">
          <div className="text-7xl text-red-500">GAME OVER</div>
        </div>
      }
    
    </div>
  );
}