export default function Credits({ handleCloseCredits }) {
  return (
    <div className="z-20 absolute w-[50vw] h-[75vh] bg-white rounded-3xl text-black">
      <div className="flex justify-end">
        <span onClick={handleCloseCredits} className="pr-[2rem] cursor-pointer text-7xl">
          &times;
        </span>
      </div>
      <div className="w-full h-fit grid grid-cols-3 grid-rows-[fit] gap-x-[2rem] items-center px-[3rem] py-[1rem] text-[2rem] font-light">
        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Yaamin Ahmed</p>
        <p className="col-span-2">Prompt Engineer</p>
        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Khushmeet Gobindpuri</p>
        <p className="col-span-2">Frontend Design and Game Logic</p>
        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Khushnain Gobindpuri</p>
        <p className="col-span-2">Backend</p>
        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Khushpreet Gobindpuri</p>
        <p className="col-span-2">Frontend Design and Game Logic</p>
        <div className="w-full h-fit col-span-3 pt-4">
          give shoutout to swecc
        </div>
      </div>
      
    </div>
  );
}
