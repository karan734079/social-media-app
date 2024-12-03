import React from 'react'
import searchIcon from '../images/search-icon-free-vector-removebg-preview.png'

const Searchbar = () => {
    return (
        <div className='flex m-4 ring-2 ring-gray-200 hover:ring-black rounded-full ml-14 cursor-pointer'>
            <div className='flex justify-between '><input type="text" className='rounded-full p-4 w-[1100px] focus:outline-none text-lg' placeholder='Search..' /> <img src={searchIcon} alt="" className='w-7 h-7 m-4' /></div>
        </div>
    )
}

export default Searchbar
