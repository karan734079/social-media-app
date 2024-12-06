import React from 'react'
import searchIcon from '../images/search-icon-free-vector-removebg-preview.png'

const Searchbar = () => {
    return (
        <div className='m-4 ring-2 ring-gray-200 hover:ring-black rounded-full ml-32 cursor-pointer w-[1000px]'>
            <div className='flex justify-between content-center '><input type="text" className='ml-30 p-3 text-lg focus:outline-none rounded-full w-full' placeholder='Search..' /> <img src={searchIcon} alt="" className='w-7 h-7 m-4' /></div>
        </div>
    )
}

export default Searchbar
