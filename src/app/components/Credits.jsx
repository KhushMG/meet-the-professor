

export default function Credits({ handleCloseCredits }) {
    return (
        <div className='z-20 absolute w-[50vw] h-[75vh] bg-white rounded-3xl text-black'>
            <div className='flex justify-end text-7xl'>
                <span onClick={handleCloseCredits} className='pr-[2rem] cursor-pointer'>&times;</span>
            </div>
            <div className='px-[3rem] py-[1rem] text-5xl'>
                PUT CREDITS HERE
            </div>
        </div>
    );
}