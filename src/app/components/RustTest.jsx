"use client";
import Background from "../assets/background.jpg"; 
import Image from "next/image"
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";



export default function RustTest() {
  const [name, setName] = useState('World');
  useEffect(() => { 
    const getGreeting = async () => {
    const response = await invoke('greet', { name: 'Balls' });
    setName(response);
    console.log(response);  // Logs: "Hello, World!"
};
getGreeting(); 
}, []);

  return (
    <div className="flex justify-center">
      <div className="text-white font-semibold bg-black"> {name} </div>
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
