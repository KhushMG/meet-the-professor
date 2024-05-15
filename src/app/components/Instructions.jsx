export default function Instructions({ handleCloseInstructions }) {
  return (
    <div className="z-20 absolute w-[50vw] h-[75vh] bg-white rounded-3xl text-black">
      <div className="w-full h-[10vh] flex items-center justify-end">
        <span onClick={handleCloseInstructions} className="pr-[2rem] cursor-pointer text-7xl">
          &times;
        </span>
      </div>
      <div className="w-full h-[65vh] grid place-content-center overflow-y-scroll items-center px-[3rem] py-[1rem] text-[2rem] -mt-[2rem] font-light select-none">
        <div>
          <p>Welcome to &quot;Prof-iler&quot;! Have an engaging conversation with a college professor and discover their unique personality. Here’s how to play:</p>
          <ul className="list-disc pl-5 mt-4">
            <li>Start the Game: Begin with a statement from the student.</li>
            <li>Respond to the Professor: The professor will reply based on their personality. You’ll be given three response options.</li>
            <li>Choose Wisely: Select one of the options to continue the conversation. The professor’s tone will reflect their unique traits.</li>
            <li>Continue the Dialogue: Keep the conversation going by choosing your responses from the provided options.</li>
            <li>Conclude the Conversation: After several exchanges, the conversation will come to a natural end.</li>
          </ul>
          <p className="mt-4">Enjoy exploring the diverse personalities of different professors in &quot;Prof-iler&quot;!</p>
        </div>
      </div>
    </div>
  );
}