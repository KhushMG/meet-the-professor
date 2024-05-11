import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Game({ difficulty }) {
  useGSAP(() => {
    const tl = gsap.timeline({});
    tl.set('#background', { delay: 1.5, filter: 'brightness(1)'})
  })
  
  return (
    <div className="relative h-screen flex items-center justify-center text-white font-thin">
    
      {/* Background div */}
      <div id='background' className="absolute inset-0 bg-[url('./assets/background.jpg')] bg-cover bg-center bg-no-repeat brightness-[.25]" />

      {/* Make sure rest of content goes above background div */}
      <div className="z-10 flex flex-col select-none">
        <div className="text-7xl">{difficulty}</div>
      </div>
    </div>
  );
}
