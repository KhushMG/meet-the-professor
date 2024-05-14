'use client'
import Image from 'next/image';
import sweccLogo from "../assets/SWECC_LOGO.png";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, useEffect, useRef } from 'react';
import Credits from './Credits';

export default function StartPage({ handleGameStart, handleSetDifficulty, difficulty }) {

  // Title pulsing animation
  useGSAP(() => {
    const tl = gsap.timeline({repeat: -1, repeatDelay: 0});
    tl.to('#title', {scale: 1.05, fontWeight: '450', duration: 1, ease: 'power1.inOut'});
    tl.to('#title', {scale: 1, fontWeight: 100, duration: 1, ease: 'power1.inOut'});
  });

  // Set difficulty logic
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const decrementDifficulty = () => {
    const idx = difficulties.indexOf(difficulty);
    if((idx - 1) >= 0) {
      handleSetDifficulty(difficulties[idx - 1]);
    }
  };
  const incrementDifficulty = () => {
    const idx = difficulties.indexOf(difficulty);
    if((idx + 1) <= 2) {
      handleSetDifficulty(difficulties[idx + 1]);
    }
  };

  // Getting difficult text content offset to prevent arrows from moving around
  const difficultyRef = useRef(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if(difficultyRef.current) {
      setOffset(difficultyRef.current.offsetWidth);
      // console.log('Current offset:', difficultyRef.current.offsetWidth);
    }
  }, [difficulty]);

  // Credits pop-up logic
  const [creditsOpen, setCreditsOpen] = useState(false);
  const openCredits = () => { setCreditsOpen(true); };
  const closeCredits = () => { setCreditsOpen(false); };

  return (
    <>
      <div className="relative h-screen flex items-center justify-center text-white font-thin">
        {/* Background div */}
        <div className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]" />

        {/* Make sure rest of content goes above background div */}
        <div className="z-10 flex flex-col select-none">

          {/* Main Start Page Content */}
          <div className="h-[90vh] flex flex-col justify-center items-center text-8xl pt-[10vh]">
            <div id='title'> Prof-iler </div>
            <button onClick={handleGameStart} className="text-7xl text-yellow-500 mt-[1rem] ease-in-out duration-150 hover:scale-105 hover:text-purple-800 hover:font-[300]"> Start </button>
            <div className="text-5xl mt-[1rem]">
              <button onClick={decrementDifficulty} className={`${difficulty === 'Easy' ? 'opacity-50 cursor-default' : ''}`}>&lt;</button>

              <span ref={difficultyRef} style={{ margin: `0 ${(225 - offset) / 2}px`}} 
                className={`${difficulty === 'Easy' ? 'text-green-600 font-[250]' : ''} ${difficulty === 'Medium' ? 'text-yellow-600 font-[350]' : ''} ${difficulty === 'Hard' ? 'text-red-600 font-[450]' : ''}`}
              >
                {difficulty}
              </span>
              <button onClick={incrementDifficulty} className={`${difficulty === 'Hard' ? 'opacity-50 cursor-default' : ''}`}>&gt;</button>
            </div>
          </div>

          {/* Credits Text */}
          <div className="h-[10vh] w-screen flex items-center text-4xl gap-x-[1rem] pl-[2rem] pb-[2rem]">
            <Image src={sweccLogo} alt='logo' className='rounded-md h-[8vh] w-auto' />
            <button onClick={openCredits} className={`${creditsOpen ? 'cursor-default' : 'cursor-pointer'} `}>Credits</button>
          </div>
        </div>

        {/* Credits Window */}
        {creditsOpen && <Credits handleCloseCredits={closeCredits} />}
        
      </div>
    </>
  );
}
