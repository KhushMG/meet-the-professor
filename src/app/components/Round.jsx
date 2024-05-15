import { useEffect, useState, useRef } from 'react';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Dialogue from "./Dialogue";
import Image from 'next/image';
import { invoke } from "@tauri-apps/api";
import Form from './Form';
import { professors } from '../professors';

export default function Round({ setGameOver, accuracyThreshold, setProfessor, professor }) {
  // Game setup states
  const [attributes, setAttributes] = useState({'happiness': 3, 'helpfulness': 2, 'innovation': 1});
  const [keys, setKeys] = useState([]);
  const setupCompleted = useRef(false);

  // Dialogue animation states
  const [dialogueAnimationTrigger, setDialogueAnimationTrigger] = useState(null);
  const [textContent, setTextContent] = useState('');

  // Game logic states
  const [isStudentTurn, setIsStudentTurn] = useState(false);
  const [isProfessorTurn, setIsProfessorTurn] = useState(true);
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [userChoice, setUserChoice] = useState('');
  const [isConversationOver, setIsConversationOver] = useState(false);


  // Audios used in animation
  const dialogueOpenAudio = new Audio('/audio/dialogueopen.mp3');
  const footstepAudio = new Audio('/audio/footstep.mp3');
  dialogueOpenAudio.volume = 0.3;
  footstepAudio.volume = 0.3;
  const playDialogueOpenAudio = () => { dialogueOpenAudio.play(); };
  const playFootstepAudio = () => { footstepAudio.play(); };

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

  // Generate new professor on initial round
  useEffect(() => {
    // Generate a new random professor
    const professor = professors[Math.floor((Math.random() * professors.length))];
    setProfessor(professor);
    console.log('Chosen Professor:', professor);
  }, []);
  
  // For each round start (when professor changes)
  const messagesRef = useRef([]);
  useEffect(() => {
    if (setupCompleted.current) {
      return;
    }

    // Setup game
    const setupGameStart = async () => {
      // Generate and set professor attributes
      const attributes = await invoke('get_attributes');
      console.log(attributes);
      setAttributes(attributes);
      setKeys(Object.keys(attributes));

      // Get system instructions and push to messages history
      const systemInstructions = await invoke('get_system_instructions', { attributes });
      messagesRef.current = [];
      messagesRef.current.push({ role: "system", content: systemInstructions });

      // Generate student initial message, animate as dialogue, and push to messages history
      const studentInitialMessage = await invoke('generate_initial_user_message');
      setTextContent(studentInitialMessage);
      messagesRef.current.push({ role: "user", content: studentInitialMessage });
    };
    setupGameStart();
    setupCompleted.current = true;
  }, [professor]);

  
  // Round setup animations
  const tl = gsap.timeline();
  const tlRef = useRef(tl);
  useGSAP(() => {
    // Professor walks on screen
    tlRef.current.from('#professorImg', { x:'100vw', duration: 2, ease: 'rough', skewX: '-10deg', skewY: '-10deg', stagger: { onUpdate: playFootstepAudio } } )

    // Dialogue box appears from offscreen
    .fromTo('#dialogue', { y: '50vh' }, { y: '0', duration: 0.3, ease: 'rough', onStart: playDialogueOpenAudio }, '+=0.7')
  }, [professor]);

  // Dialogue animation
  useGSAP(() => {
    tlRef.current.call(() => {
      if ((dialogueAnimationTrigger !== null) && (textContent != '')) {
        console.log('dialogue played');
        dialogueAnimationTrigger.play();
      }
    }, null, '+=0.05')
  }, [dialogueAnimationTrigger]);

  
  // Dialogue logic
  const swapTurns = () => {
    setIsStudentTurn(!isStudentTurn);
    setIsProfessorTurn(!isProfessorTurn);
  };

  // Getting, parsing, and displaying GPT's response in game
  const getGPTResponse = async () => {
    const gptResponse = await invoke('call_gpt', { messages: messagesRef.current });
    const gptData = JSON.parse(gptResponse);
  
    const profResponse = gptData.choices[0].message.content;
    console.log(profResponse);
    const optionRegex = /[A-C]\) [^]+?(?=(?: [A-C]\) |\n|$))/g;
    const match = profResponse.match(optionRegex);
    // console.log('match:', match);
  
    if (match) {
      const profMessage = profResponse.slice(0, profResponse.indexOf(match[0]));
      const optionA = match[0];
      const optionB = match[1];
      const optionC = match[2];
  
      setOptionA(optionA);
      setOptionB(optionB);
      setOptionC(optionC);
      setTextContent(profMessage);
  
      messagesRef.current.push({ role: "assistant", content: profMessage });
  
      // console.log(profMessage);
      // console.log(optionA);
      // console.log(optionB);
      // console.log(optionC);
      swapTurns();
    } else {
      // HAVE PROFESSOR WALK OUT OF CLASSROOM AT END OF CONVERSATION
      setTextContent(profResponse);
      setIsProfessorTurn(false);
      setIsStudentTurn(false);
      console.log('Conversation finished');
    }
  };
  
  // Logic for when user selects an option
  const handleSelectedUserChoice = (choice) => {
    const selectedChoice = document.getElementById(choice).textContent;
    setUserChoice(selectedChoice);
    console.log(`Student choice: ${selectedChoice}`);
  };

  // Whenever user selects a dialogue option add it to messages array (so GPT can remember conversation)
  useEffect(() => {
    if(userChoice != '') {
      messagesRef.current.push({ role: 'user', content: userChoice });
      console.log(messagesRef.current);
      swapTurns();
    }
  }, [userChoice]);

  // Advance dialogue logic
  useEffect(() => {
    const handleAdvanceDialogue = (event) => {
      if ((event.button === 0) && isProfessorTurn) {
        getGPTResponse();
      }
      else if(!isStudentTurn && !isProfessorTurn) { 
        setIsConversationOver(true);
      }
    };

    document.addEventListener('mousedown', handleAdvanceDialogue);

    return () => {
      document.removeEventListener('mousedown', handleAdvanceDialogue);
    };
  }, [isProfessorTurn]);

  // ------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="relative h-screen flex justify-center">

      {/* Background div */}
      <div
        id="background"
        className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat"
      />

      {isConversationOver ? (
        // Mount Form component (to guess professor attributes) if conversation is over
        <div className="z-10 h-screen w-screen flex flex-col items-center justify-center select-none">
          <Form
            keys={keys}
            attributes={attributes}
            accuracyThreshold={accuracyThreshold}
            setGameOver={setGameOver}
            setProfessor={setProfessor}
            setIsConversationOver={setIsConversationOver}
            setIsStudentTurn={setIsStudentTurn}
            setIsProfessorTurn={setIsProfessorTurn}
            setupCompleted={setupCompleted}
          />
        </div>

      ) : (
        // If conversation isn't over, render dialogue
        <div className="z-10 flex flex-col justify-end items-center select-none">

          {/* Render student dialogue options if it is student's turn */}
          {isStudentTurn && (
            <div className=" h-screen w-[30vw] ml-[52rem] mb-[5rem] flex flex-col gap-y-[2rem] justify-center text-3xl text-black fixed">
              <button
                className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl "
                id="A"
                onClick={() => handleSelectedUserChoice("A")}
              >
                {optionA}
              </button>
              <button
                className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl "
                id="B"
                onClick={() => handleSelectedUserChoice("B")}
              >
                {optionB}
              </button>
              <button
                className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl "
                id="C"
                onClick={() => handleSelectedUserChoice("C")}
              >
                {optionC}
              </button>
            </div>
          )}

          {/* Professor Image */}
          <Image
            id="professorImg"
            src={`/images/${professor}.png`}
            alt="Image of professor"
            height={1000}
            width={500}
            className="fixed mr-[40vw] -mb-[10vh]"
          />

          {/* Dialogue Box */}
          <div id="dialogue" className="fixed">
            <Dialogue
              textContent={textContent.toString()}
              setDialogueAnimationTrigger={setDialogueAnimationTrigger}
            />
          </div>
        </div>
      )}

    </div>
  );
}
