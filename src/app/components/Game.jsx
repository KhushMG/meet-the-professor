import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Dialogue from "./Dialogue";

import { useEffect, useState } from 'react';

export default function Game({ difficulty }) {
  useGSAP(() => {
    const tl = gsap.timeline({});
    tl.set('#background', { filter: 'brightness(1)', onComplete: playLightSwitchAudio }, '>=1.5')
      .fromTo('#dialogue', { y: '50vh' }, { y: '0', duration: 0.3, ease: 'rough', onStart: playDialogueOpenAudio }, '>=0.75');
  })

  const lightSwitchAudio = new Audio('/lightswitch.mp3');
  const dialogueOpenAudio = new Audio('/dialogueopen.mp3');
  lightSwitchAudio.volume = 0.4;
  dialogueOpenAudio.volume = 0.5;
  const playLightSwitchAudio = () => { lightSwitchAudio.play() };
  const playDialogueOpenAudio = () => { dialogueOpenAudio.play() };
  
  return (
    <div className="relative h-screen flex justify-center text-red-500 font-bold">

      {/* Background div */}
      <div id='background' className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]" />

      {/* Make sure rest of content goes above background div */}
      <div className="z-10 flex flex-col justify-end items-center select-none">

        {/* Dialogue Box */}
        <div id='dialogue' className="fixed"> <Dialogue textContent={"Of course! I'm here to help you tackle those key concepts you're worried about."} /> </div>

      </div>
    </div>
  );
}
