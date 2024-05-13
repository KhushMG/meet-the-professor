import { useEffect, useState, useRef } from 'react';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Dialogue from "./Dialogue";
import { professors } from '../professors';
import Image from 'next/image';
import { invoke } from "@tauri-apps/api";

export default function Game({ difficulty }) {
  // Game setup states
  const [professor, setProfessor] = useState('');
  const [attributes, setAttributes] = useState({});
  const [systemInstructions, setSystemInstructions] = useState('');
  const [messages, setMessages] = useState([]);

  // Dialogue animation states
  const [dialogueAnimationTrigger, setDialogueAnimationTrigger] = useState(null);
  const [textContent, setTextContent] = useState('');
  const dialogueRef = useRef(null);

  // Game logic states
  const [isStudentTurn, setIsStudentTurn] = useState(false);
  const [isProfessorTurn, setIsProfessorTurn] = useState(true);
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');


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
  

  // For each round start (when professor changes)
  useEffect(() => {
    // Generate a new random professor
    const professor = professors[Math.floor((Math.random() * professors.length))];
    setProfessor(professor);
    console.log('Chosen Professor:', professor);

    // Generate professor attributes and wait for it to complete
    const setupGameStart = async () => {
      const attributes = await invoke('get_attributes');
      setAttributes(attributes);
      console.log(attributes);

      // Call getSystemInstructions after attributes is set
      const systemInstructions = await invoke('get_system_instructions', { attributes });
      setSystemInstructions(systemInstructions);
      // console.log(systemInstructions);
      setMessages(messages.push({ role: "system", content: systemInstructions }));

      // Generate student initial message after getSystemInstructions is done
      const studentInitialMessage = await invoke('generate_initial_user_message');
      setTextContent(studentInitialMessage);
      // console.log(textContent);
      setMessages(messages.push({ role: "user", content: studentInitialMessage }));

      console.log('System:', messages[0].content);
      console.log('User:', messages[1].content);
    };
    setupGameStart();
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


    // Student dialogue options animated onto chalkboard

  }, []);


  // Dialogue animation
  useGSAP(() => {
    tlRef.current.call(() => {
      if (dialogueAnimationTrigger !== null) {
        console.log('dialogue played');
        dialogueAnimationTrigger.play();
      }
    }, null, '+=0.3')
  }, [textContent]);


  // Advance dialogue logic
  useEffect(() => {
    const swapTurns = () => {
      setIsStudentTurn((prevState) => !prevState);
      setIsProfessorTurn((prevState) => !prevState);
    };

    const getGPTResponse = async () => {
      const gptResponse = await invoke('call_gpt', { messages: messages });
      const gptData = JSON.parse(gptResponse);

      const profResponse = gptData.choices[0].message.content;
      const a = Math.max(profResponse.indexOf('A)'), profResponse.indexOf('A.'));
      const b = Math.max(profResponse.indexOf('B)'), profResponse.indexOf('B.'));
      const c = Math.max(profResponse.indexOf('C)'), profResponse.indexOf('C.'));

      const optionA = profResponse.slice(a, b - 2);
      const optionB = profResponse.slice(b, c - 2);
      const optionC = profResponse.slice(c, profResponse.length - 1);
      const profMessage = profResponse.slice(0, a).replace('\n', '')

      setOptionA(optionA);
      setOptionB(optionB);
      setOptionC(optionC);
      setTextContent(profMessage);

      const copyOfMessages = [...messages, { "role": "assistant", "content": profMessage }];
      setMessages(copyOfMessages);

      console.log(profMessage);
      console.log(optionA);
      console.log(optionB);
      console.log(optionC);

      swapTurns();
    }
    
    // Set textContent to next dialogue message in here
    const handleAdvanceDialogue = (event) => {
      if (event.code === 'Enter') {
        if(isProfessorTurn) {
          getGPTResponse();
        }
        else { console.log('solved') }
      }
    };

    document.addEventListener('keydown', handleAdvanceDialogue);

    return () => {
      document.removeEventListener('keydown', handleAdvanceDialogue);
    };
  }, [isProfessorTurn]);
  

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
            textContent={textContent.toString()}
            setDialogueAnimationTrigger={setDialogueAnimationTrigger}
            dialogueRef={dialogueRef}
          />
        </div>

      </div>
    </div>
  );
}
