import Background from "../assets/background.jpg"; 
import Image from "next/image"
export default function Game() {
  return (

      <Image
        src={Background}
        fill
        alt="background"
        className="min-h-screen overflow-hidden"
      />

  );
}
