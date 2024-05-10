'use client'
import Image from 'next/image';
import sweccLogo from "../assets/SWECC_LOGO.png";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, useEffect, useRef } from 'react';

export default function StartPage() {

  // Title pulsing animation
  useGSAP(() => {
    const tl = gsap.timeline({repeat: -1, repeatDelay: 0});
    tl.to('#title', {scale: 1.1, duration: 1, ease: 'power1.inOut'});
    tl.to('#title', {scale: 1, duration: 1, ease: 'power1.inOut'});
  });

  // Set difficulty logic
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const decrementDifficulty = () => {
    const idx = difficulties.indexOf(difficulty);
    if((idx - 1) >= 0) {
      setDifficulty(difficulties[idx - 1]);
    }
  }
  const incrementDifficulty = () => {
    const idx = difficulties.indexOf(difficulty);
    if((idx + 1) <= 2) {
      setDifficulty(difficulties[idx + 1]);
    }
  }

  // Getting difficult text content offset to prevent arrows from moving around
  const difficultyRef = useRef(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if(difficultyRef.current) {
      setOffset(difficultyRef.current.offsetWidth)
      console.log(difficultyRef.current.offsetWidth)
    }
  }, [difficulty]);

  return (
    <>
      <div className="relative h-screen flex items-center justify-center">
        {/* Background div */}
        <div className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]" />

        {/* Make sure rest of content goes above dimmed background div */}
        <div className="z-10 flex flex-col text-white font-thin select-none">

          {/* Main Start Page Content */}
          <div className="h-[90vh] flex flex-col justify-center items-center text-8xl pt-[10vh]">
            <div id='title'> Prof-iler </div>
            <div className="text-7xl mt-[2rem]"> Start </div>
            <div className="text-5xl mt-[1rem]">
              <span onClick={decrementDifficulty} className={`${difficulty === 'Easy' ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>&lt;</span>
              <span ref={difficultyRef} style={{ margin: `0 ${(250 - offset) / 2}px`}}>{difficulty}</span>
              <span onClick={incrementDifficulty} className={`${difficulty === 'Hard' ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>&gt;</span>
            </div>
          </div>

          {/* Credits */}
          <div className="h-[10vh] w-screen flex items-center text-4xl gap-x-[1rem] pl-[2rem] pb-[2rem]">
            <Image src={sweccLogo} alt='logo' className='rounded-md h-[8vh] w-auto' />
            <div>Credits</div>
          </div>

        </div>
      </div>
    </>
  );
}
