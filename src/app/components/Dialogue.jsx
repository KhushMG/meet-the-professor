import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState, useRef, useEffect } from 'react';

export default function Dialogue({ textContent }) {
  const [chars, setChars] = useState([]);
  const text = textContent;

  useState(() => {
    const wordsArray = text.split(' ');
    const charsArray = wordsArray.map(wordToChars);
    setChars(charsArray);
  }, [text]);

  function wordToChars(word) {
    const charArray = [];
    const n = word.length;
    for (let i = 0; i < n; ++i) {
      charArray.push(word[i]);
    }
    return charArray;
  }

  const dialoguePlaying = new Audio('/beep.mp3');
  const dialogueComplete = new Audio('/dialoguecomplete.mp3');
  dialoguePlaying.volume = 0.5;
  dialogueComplete.volume = 0.5

  const currAnimatedElementRef = useRef(null);
  useGSAP(() => {
    const animatedElements = gsap.utils.toArray('.js-animateText');
    let idx = 0;
    gsap.from(animatedElements, {
      duration: 0.01,
      opacity: 0,
      stagger: {
        each: 0.05,
        onStart: () => {
          currAnimatedElementRef.current = animatedElements[idx];
          console.log('Updated Animated Element:', currAnimatedElementRef.current);
          idx++;

          if (currAnimatedElementRef.current) {
            currAnimatedElementRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }

          dialoguePlaying.currentTime = 0;
          dialoguePlaying.play();
        },
      },
      onComplete: () => {
        dialogueComplete.play();
      },
    }, '+=3');
  }, [textContent]);

  return (
    <div className="w-[75vw] h-[30vh] bg-white border-[1rem] border-amber-600 rounded-3xl mb-[1rem] p-[1rem] text-black text-[4rem] overflow-y-scroll no-scrollbar">
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
  );
}