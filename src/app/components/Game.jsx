import { useEffect, useState, useRef } from 'react';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Dialogue from "./Dialogue";
import { professors } from '../professors';
import Image from 'next/image';

export default function Game({ difficulty }) {
  const [dialogueAnimationTrigger, setDialogueAnimationTrigger] = useState(null);
  const [professor, setProfessor] = useState('');
  const [textContent, setTextContent] = useState("Of course! I'm here to help you tackle those key concepts you're worried about.");

  // Audios used in animation
  const lightSwitchAudio = new Audio('/audio/lightswitch.mp3');
  const dialogueOpenAudio = new Audio('/audio/dialogueopen.mp3');
  const footstepAudio = new Audio('/audio/footstep.mp3');
  lightSwitchAudio.volume = 0.4;
  dialogueOpenAudio.volume = 0.5;
  footstepAudio.volume = 0.5;
  const playLightSwitchAudio = () => { lightSwitchAudio.play(); };
  const playDialogueOpenAudio = () => { dialogueOpenAudio.play(); };
  const playFootstepAudio = () => { footstepAudio.play(); };
  
  // Select random professor
  useEffect(() => {
    const professor = professors[Math.floor((Math.random() * professors.length))];
    setProfessor(professor);
    console.log('Chosen Professor:', professor);
  }, []);

  // Initial game start animation
  useGSAP(() => {
    const gameStartTL = gsap.timeline({ delay: 1.5 });

    // Lights turn on
    gameStartTL.set('#background', { filter: 'brightness(1)', onComplete: playLightSwitchAudio })

    // Dialogue box appears from offscreen
    .fromTo('#dialogue', { y: '50vh' }, { y: '0', duration: 0.3, ease: 'rough', onStart: playDialogueOpenAudio }, '+=0.7')
  }, []);
  
  // Recursive game animation
  const tl = gsap.timeline({ delay: 2.5 });
  const tlRef = useRef(tl);
  useGSAP(() => {
    // Professor walks from offscreen (from right to left side)
    tlRef.current.from('#professorImg', { x:'100vw', duration: 2, ease: 'rough', skewX: '-10deg', skewY: '-10deg', stagger: { onUpdate: playFootstepAudio } } )

    // Student initial response generated in dialogue box


    // Professor response to student generated in dialogue box


    // Student dialouge options animated onto chalkboard

  }, []);

  // Dialogue animation
  useGSAP(() => {
    tlRef.current.call(() => {
      if (dialogueAnimationTrigger !== null) {
        console.log('dialogue played');
        dialogueAnimationTrigger.play();
      }
    }, null, '+=0.3')
  }, [textContent, dialogueAnimationTrigger]);

  // useGSAP(() => {
  //   const tl = gsap.timeline({});

  //   // Lights turn on
  //   tl.set('#background', { filter: 'brightness(1)', onComplete: playLightSwitchAudio }, '>=1.5')
  //     // Dialogue box appears from off screen
  //     .fromTo('#dialogue', { y: '50vh' }, { y: '0', duration: 0.3, ease: 'rough', onStart: playDialogueOpenAudio }, '>=0.75')

  //     // Dialogue starts generating
  //     .call(() => {
  //       if(dialogueAnimationTrigger !== null) dialogueAnimationTrigger.play();
  //     }, null, '+=1');
  // }, [dialogueAnimationTrigger])
  
  return (
    <div className="relative h-screen flex justify-center text-red-500 font-bold">

      {/* Background div */}
      <div id='background' className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]" />

      {/* Make sure rest of content goes above background div */}
      <div className="z-10 flex flex-col justify-end items-center select-none">

        {/* Professor Image */}
        <Image
          id='professorImg'
          src={`/images/${professor}.png`}
          alt='Image of professor'
          height={1000}
          width={500}
          className='fixed mr-[40vw] -mb-[10vh]'
        />

        {/* Dialogue Box */}
        <div id='dialogue' className="fixed">
          <Dialogue
            textContent={textContent}
            setDialogueAnimationTrigger={setDialogueAnimationTrigger}
          />
        </div>

      </div>
    </div>
  );
}
