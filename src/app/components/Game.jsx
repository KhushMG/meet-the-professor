import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [messages, setMessages] = useState([]);

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
      // console.log(systemInstructions);
      setMessages(messages.push({ role: "system", content: systemInstructions }));

      // Generate student initial message after getSystemInstructions is done
      const studentInitialMessage = await invoke('generate_initial_user_message');
      setTextContent(studentInitialMessage);
      // console.log(textContent);
      setMessages(messages.push({ role: "user", content: studentInitialMessage }));

      // console.log('System:', messages[0].content);
      console.log('User:', messages[1].content);
    };
    setupGameStart();
  }, []);

  const tl = gsap.timeline({ delay: 1.5 });
  const tlRef = useRef(tl);
  useGSAP(() => {
    // Lights turn on
    tlRef.current.set('#background', { filter: 'brightness(1)', onComplete: playLightSwitchAudio })

    // Dialogue box appears from offscreen
    .fromTo('#dialogue', { y: '50vh' }, { y: '0', duration: 0.3, ease: 'rough', onStart: playDialogueOpenAudio }, '+=0.7')
  }, []);
  
  // Recursive game animation
  // const tl = gsap.timeline({ delay: 2.5 });
  // const tlRef = useRef(tl);
  useGSAP(() => {
    // Professor walks from offscreen (from right to left side)
    tlRef.current.from('#professorImg', { x:'100vw', duration: 2, ease: 'rough', skewX: '-10deg', skewY: '-10deg', stagger: { onUpdate: playFootstepAudio } } )

    // Professor response to student generated in dialogue box
    // Student dialogue options animated onto chalkboard
  }, []);

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
    const gptResponse = await invoke('call_gpt', { messages: messages });
    const gptData = JSON.parse(gptResponse);
  
    const profResponse = gptData.choices[0].message.content;
    console.log(profResponse);
    const optionRegex = /[A-C]\) [^]+?(?=(?: [A-C]\) |\n|$))/g;
    const match = profResponse.match(optionRegex);
    console.log('match:', match);
  
    if (match) {
      const profMessage = profResponse.slice(0, profResponse.indexOf(match[0]));
      const optionA = match[0];
      const optionB = match[1];
      const optionC = match[2];
  
      setOptionA(optionA);
      setOptionB(optionB);
      setOptionC(optionC);
      setTextContent(profMessage);
  
      setMessages([...messages, { role: "assistant", content: profMessage }]);
  
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
  useEffect(() => {
    if(userChoice != '') {
      const copyOfMessages = [...messages, { role: 'user', content: userChoice }];
      setMessages(copyOfMessages);
      console.log(copyOfMessages);
      swapTurns();
    }
  }, [userChoice]);

  useEffect(() => {
    // Set textContent to next dialogue message in here
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
      <div id='background' className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]" />

      {isConversationOver ?
        <div className='z-20'>
          hello balls
        </div>

        :

        <div className="z-10 flex flex-col justify-end items-center select-none">

          {isStudentTurn &&
            <div className=' h-screen w-[30vw] ml-[52rem] mb-[5rem] flex flex-col gap-y-[2rem] justify-center text-3xl text-black fixed'>
              <button className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl " id='A' onClick={() => handleSelectedUserChoice('A')}>{optionA}</button>
              <button className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl " id='B' onClick={() => handleSelectedUserChoice('B')}>{optionB}</button>
              <button className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl " id='C' onClick={() => handleSelectedUserChoice('C')}>{optionC}</button>
            </div>
          }
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
            />
          </div>
        </div>
       
      }

{/*       
      <div className="z-10 flex flex-col justify-end items-center select-none">

        {isStudentTurn &&
          <div className=' h-screen w-[30vw] ml-[52rem] mb-[5rem] flex flex-col gap-y-[2rem] justify-center text-3xl text-black fixed'>
            <button className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl " id='A' onClick={() => handleSelectedUserChoice('A')}>{optionA}</button>
            <button className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl " id='B' onClick={() => handleSelectedUserChoice('B')}>{optionB}</button>
            <button className="bg-white border-[0.5rem] p-4 border-amber-600 rounded-xl " id='C' onClick={() => handleSelectedUserChoice('C')}>{optionC}</button>
          </div>
        }
        
        <Image
          id='professorImg'
          src={`/images/${professor}.png`}
          alt='Image of professor'
          height={1000}
          width={500}
          className='fixed mr-[40vw] -mb-[10vh]'
        />

       
        <div id='dialogue' className="fixed">
          <Dialogue
            textContent={textContent.toString()}
            setDialogueAnimationTrigger={setDialogueAnimationTrigger}
          />
        </div>
      </div> */}
    </div>
  );
}
