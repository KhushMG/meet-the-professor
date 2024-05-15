import { React, useState } from 'react';
import { professors } from '../professors';

const Form = ({ keys, attributes, accuracyThreshold, setGameOver, setProfessor, setIsConversationOver, setIsStudentTurn, setIsProfessorTurn }) => {
  const [userGuess, setUserGuess] = useState({});

  const handleChange = (key) => (event) => {
    setUserGuess((prevGuess) => ({
      ...prevGuess,
      [key]: parseInt(event.target.value, 10),
    }));
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    let totalUserAccuracy = 100;
    let idx = 0;

    // Iterate over attributes
    while (idx < 3) {
      // Get professor attribute
      const attribute = keys[idx];

      // Get actual professor attribute score
      const attributeScore = attributes[attribute];

      // Get user guess on professor attribute score
      const userGuessOfAttributeScore = userGuess[attribute];

      // Calculate user guess accuracy and add to total score
      const userGuessAccuracy = Math.abs(attributeScore - userGuessOfAttributeScore) * 6.6666666666;
      totalUserAccuracy -= userGuessAccuracy;
      idx++;
    }

    // If user guess accuracy is lower than threshold, end game
    if (totalUserAccuracy < accuracyThreshold) {
      console.log(`User Guess Accuracy: ${totalUserAccuracy}\nAccuracy Threshold: ${accuracyThreshold}`);
      setGameOver(true);
    } else {
      // Generate a new random professor
      const professor = professors[Math.floor(Math.random() * professors.length)];
      setProfessor(professor);
      console.log('User Guess Accuracy: {}\nAccuracy Threshold: {}', totalUserAccuracy, accuracyThreshold);
      console.log('Chosen Professor:', professor);
      setIsStudentTurn(false);
      setIsProfessorTurn(true);
      setIsConversationOver(false);
    }
  };
  
  return (
    <form className="z-10 bg-white h-[50vh] w-[50vw] grid place-content-center rounded-md text-black">

      <div className='text-black font-semibold text-xl text-center mb-[2rem]'> guess the professor&apos;s attributes! </div>

      {/* Fields for guessing professor's attributes */}
      {keys.map((key) => (
        <div className='flex justify-between items-center gap-x-[1rem] mb-[1rem]' key={key}>
          <label htmlFor={key}>{key}</label>
          <input
            type="number"
            min='1'
            max='5'
            id={key}
            name={key}
            onChange={handleChange(key)}
            required
            placeholder="enter a value of 1 to 5"
            className="text-left border-2 rounded-sm p-2 w-[275px] border-black"
          />
        </div>
      ))}

      <button type='submit' onClick={handleSubmit} className='p-4 mt-[2rem] border-black border-2 rounded-sm hover:text-white hover:bg-black hover:border-white hover:ring-2 hover:ring-black transition ease-in-out duration-150'> 
        submit!
      </button>

    </form>
  );
};

export default Form