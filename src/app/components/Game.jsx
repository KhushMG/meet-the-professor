import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Round from "./Round";
import { useState, useRef } from 'react';

export default function Game({ difficulty }) {
  const [gameOver, setGameOver] = useState(false);
  const [professor, setProfessor] = useState('');

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
        className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]"
      />

      {/* Render Round component as long as game is not over */}
      {!gameOver &&
        <Round setGameOver={setGameOver} accuracyThreshold={accuracyThreshold} setProfessor={setProfessor} professor={professor} />
      }

      {gameOver &&
        <div className="z-10 grid place-content-center">
          <div className="text-9xl text-red-500 select-none">GAME OVER</div>
        </div>
      }
    
    </div>
  );
}