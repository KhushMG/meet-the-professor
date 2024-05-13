"use client";
import Background from "../assets/background.jpg";
import Image from "next/image"
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";

export default function RustTest() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState('');
  const [response, setResponse] = useState('');
  const [student, setStudent] = useState('');
  const [choice, setChoice] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [profResponse, setProfResponse] = useState('');

  useEffect(() => {
    const getGreeting = async () => {
      const user_message = await invoke('greet');
      setStudent(user_message);
      // setName(response);
      // gets attributes, only do ONCE per professor
      const attributes = await invoke('get_attributes');
      // gets system instructions, only do ONCE per professor
      const system_instructions = await invoke('get_system_instructions', { attributes: attributes });
  
      // store inside useState, NEEDS to be a JSON type object where you add to every time the student has a response
      // add professor MESSAGE only as well 
      let messages = [
        { role: "system", content: system_instructions },
        { role: "user", content: user_message }
      ];
  
      // all you have to do to get the professor's response,
      // messages is a JSON object that tracks the entire conversation
      let gpt_response = await invoke('call_gpt', { messages: messages });
  
      // do this so you can parse the returned value as a JSON object
      const data = JSON.parse(gpt_response);
  
      // do this to store ONLY the message, the actual string response
      const message = data.choices[0].message.content;
      setMessage(message);
  
      // push back GPT's response to messages object to continue conversation
      messages.push({ "role": "assistant", "content": message });

      // get user input using button and store in variable, 
      // then push back user input to messages object
      // messages.push({ "role": "user", "content": studentResponse });
  
      const professor_response = JSON.stringify(message);
  
      const a = professor_response.indexOf('A)');
      const b = professor_response.indexOf('B)');
      const c = professor_response.indexOf('C)');
  
      console.log(user_message);
  
      console.log(professor_response);
  
      setProfResponse(professor_response.slice(1, a-4))
      setOptionA(professor_response.slice(a, b - 2))
      setOptionB(professor_response.slice(b, c - 2))
      setOptionC(professor_response.slice(c, professor_response.length - 1))
  
      console.log(optionA);
      console.log(optionB);
      console.log(optionC);
    };
    getGreeting();
  }, []);

  // get initial user message
  // get system instructions
  // get professor attributes
  // create JSON object
  // make API call through rust and return that,
  // add resulting info back to messages JSON object
  // get user input through frontend

  return (
    <div className="flex flex-col justify-center">
       <div className="text-white text-sm font-semibold bg-black"> {profResponse} </div>
      <div className="text-white text-sm font-semibold bg-black"> {optionA} </div>
      <div className="text-white text-sm font-semibold bg-black"> {optionB} </div>
      <div className="text-white text-sm font-semibold bg-black"> {optionC} </div>

      <div>
        <Image
          src={Background}
          fill
          alt="background"
          className="min-h-screen overflow-hidden -z-50"
        />
      </div>
    </div>
  );
}
