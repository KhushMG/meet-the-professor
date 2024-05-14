import React from 'react'

const Form = ({ keys }) => {
  return (
    <>
    <form className="z-10 bg-white h-[50vh] w-[50vw] grid place-content-center rounded-md text-black">
      <div className='text-black font-semibold text-xl text-center mb-[2rem]'> guess the professor&apos;s attributes! </div>
      {keys.map((key) => (
        <div className='flex justify-between items-center gap-x-[1rem] mb-[1rem]' key={key}>
          <label htmlFor={key}>{key} </label>
          <input
            type="text"
            id={key}
            name={key}
            required
            placeholder="enter a value of 1 to 5"
            className="text-left border-2 rounded-sm p-2 w-[275px] border-black"
          />
        </div>
      ))}
      <button type='submit' className='p-4 mt-[2rem] border-black border-2 rounded-sm hover:text-white hover:bg-black hover:border-white hover:ring-2 hover:ring-black transition ease-in-out duration-150'> 
        submit!
      </button>
    </form>
    </>
  );
};

export default Form