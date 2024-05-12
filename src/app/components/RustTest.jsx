"use client";
import Background from "../assets/background.jpg";
import Image from "next/image"
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";

export default function RustTest() {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState('');
  const [response, setResponse] = useState('');
  const [student, setStudent] = useState('');
  const [choice, setChoice] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');

  // let optionA;
  // let optionB;
  // let optionC;

  const getGreeting = async () => {
    // console.log(response);  // Logs: "Hello, World!"
    const user_message = await invoke('greet');
    setStudent(user_message);
    // setName(response);
    const attributes = await invoke('get_attributes');
    const system_instructions = await invoke('get_system_instructions', { attributes: attributes });

    let messages = [
      { role: "system", content: system_instructions },
      { role: "user", content: user_message }
    ];

    let gpt_response = await invoke('call_gpt', { messages: messages });

    const data = JSON.parse(gpt_response);

    const message = data.choices[0].message.content;
    setName(message);

    messages.push({ "role": "assistant", "content": message });

    const professor_response = JSON.stringify(message);

    const a = professor_response.indexOf('A)');
    const b = professor_response.indexOf('B)');
    const c = professor_response.indexOf('C)');

    console.log(user_message);

    console.log(professor_response);

    setOptionA(professor_response.slice(a, b - 2))
    setOptionB(professor_response.slice(b, c - 2))
    setOptionC(professor_response.slice(c, professor_response.length - 1))

    console.log(optionA);
    console.log(optionB);
    console.log(optionC);
  };

  useEffect(() => {
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
