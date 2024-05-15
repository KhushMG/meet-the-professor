import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState, useRef, useEffect } from 'react';

export default function Dialogue({ textContent, setDialogueAnimationTrigger }) {
  const [chars, setChars] = useState([]);

  // Split up text into characters
  useEffect(() => {
    const wordsArray = textContent.split(' ');
    const charsArray = wordsArray.map(wordToChars);
    // console.log('charsArray:', charsArray);
    setChars(charsArray);
  }, [textContent]);

  // Convert word to characters array
  function wordToChars(word) {
    const charArray = [];
    const n = word.length;
    for (let i = 0; i < n; ++i) {
      charArray.push(word[i]);
    }
    return charArray;
  }

  // Audio for animations
  const dialoguePlaying = new Audio('/audio/beep.mp3');
  const dialogueComplete = new Audio('/audio/dialoguecomplete.mp3');
  dialoguePlaying.volume = 0.2;
  dialogueComplete.volume = 0.05;

  // Character generation animation
  const currAnimatedElementRef = useRef(null);
  useGSAP(() => {
    if(chars.length !== 0) {
      const animatedElements = gsap.utils.toArray('.js-animateText');
      
      let idx = 0;
      let animation = gsap.from(animatedElements, {
        paused: true,
        duration: 0.05,
        opacity: 0,
        stagger: {
          each: 0.05,
          onStart: () => {
            currAnimatedElementRef.current = animatedElements[idx];
            if (currAnimatedElementRef.current) {
              currAnimatedElementRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
            dialoguePlaying.currentTime = 0;
            dialoguePlaying.play();
            ++idx;
          }
        },
        onComplete: () => {
          dialogueComplete.play();
        },
      });
      setDialogueAnimationTrigger(animation);
    }
  }, [chars]);

  return (
    <div key={chars} className="w-[75vw] h-[30vh] flex flex-col justify-between bg-white border-[1rem] border-amber-600 rounded-3xl mb-[1rem] p-[1rem] text-black text-[2.5rem] overflow-y-scroll no-scrollbar">
      <div>
        {chars.map((word, idx1) => (
          <div className="inline-block" key={idx1}>
            {word.map((char, idx2) => (
              <span className="js-animateText relative inline-block font-light" key={idx2}>
                {char}
              </span>
            ))}
            <span>{'\u00A0'}</span>
          </div>
        ))}
      </div>
      <div className='flex justify-end w-full h-fit'>
        <div className='text-[2rem] mr-4 italic'> click to continue </div>
      </div>
    </div>
  );
}