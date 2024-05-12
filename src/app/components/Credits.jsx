export default function Credits({ handleCloseCredits }) {
  return (
    <div className="z-20 absolute w-[50vw] h-[75vh] bg-white rounded-3xl text-black">
      <div className="w-full h-[10vh] flex items-center justify-end">
        <span onClick={handleCloseCredits} className="pr-[2rem] cursor-pointer text-7xl">
          &times;
        </span>
      </div>
      <div className="w-full h-[65vh] grid grid-cols-3 grid-rows-[fit] gap-x-[2rem] place-content-center items-center px-[3rem] py-[1rem] text-[2rem] -mt-[2rem] font-light select-none">
        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Yaamin Ahmed</p>
        <div className="flex justify-center text-center col-span-2">
          <ul>
            <li>Rust Backend</li>
          </ul>
        </div>

        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Khushmeet Gobindpuri</p>
        <div className="flex justify-center text-center col-span-2">
          <ul>
            <li>Frontend Design</li>
            <li>Game Logic</li>
          </ul>
        </div>

        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Khushnain Gobindpuri</p>
        <div className="flex justify-center text-center col-span-2">
          <ul>
            <li>Rust Backend</li>
          </ul>
        </div>

        <p className="col-span-1 border-r-2 border-r-gray-400 p-[0.75rem]">Khushpreet Gobindpuri</p>
        <div className="flex justify-center text-center col-span-2">
          <ul>
            <li>Frontend Design</li>
            <li>Game Logic</li>
          </ul>
        </div>

        <div className="w-full h-fit grid place-content-center col-span-3 pt-[2rem]">
          Shoutout to SWECC!
        </div>
      </div>
      
    </div>
  );
}
