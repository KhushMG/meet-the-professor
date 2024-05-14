import React from 'react'

const Form = ({ keys }) => {
  return (
    <form className="z-10 bg-white h-[50vh] w-[50vw] grid place-content-center rounded-md text-black">
      {keys.map((key) => (
        <div className='flex justify-between items-center gap-x-[1rem] mb-[1rem]' key={key}>
          <label htmlFor={key}>{key} </label>
          <input
            type="text"
            id={key}
            name={key}
            placeholder="enter a value of 1 to 5"
            className="text-left border-2 rounded-sm p-2 w-[275px] border-black"
          />
        </div>
      ))}
    </form>
  );
};

export default Form