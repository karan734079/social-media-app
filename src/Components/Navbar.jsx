import React from 'react'
import homeIcon from '../images/25694.png'
import searchIcon from '../images/search-icon-free-vector-removebg-preview.png'
import messegeIcon from '../images/685887.png'
import profileIcon from '../images/Screenshot_2024-12-02_111230-removebg-preview.png'
import createIcon from '../images/39c8f16f856d23e08b995f8facdbcf8d-removebg-preview.png'
import notificationIcon from '../images/3119338.png'
import logoutIcon from '../images/126467.png'

const Navbar = () => {
    return (
        <nav className="bg-white  p-4 justify-between w-[15%] shadow-lg h-screen space-y-10 cursor-pointer fixed">
            <div className="font-bold text-start p-3 text-3xl text-red-600 hover:text-red-700">Socio</div>
            <div className="flex flex-col text-start p-3 space-y-12 text-xl font-extralight">
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={homeIcon} alt="" className='h-7 w-7' /><p>Home</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={searchIcon} alt="" className='h-7 w-7' /><p>Search</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={messegeIcon} alt="" className='h-7 w-7' /><p>Messages</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={notificationIcon} alt="" className='h-7 w-7' /><p>Notifications</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={createIcon} alt="" className='h-7 w-7' /><p>Create</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={profileIcon} alt="" className='h-7 w-7' /><p>Profile</p></span>
            </div>  
            <div className='flex space-x-2 p-3 text-center space-y-6 transition-transform transform hover:scale-105'><img src={logoutIcon} alt="" className='h-8 w-8 mt-6' /><p className='text-xl'>Logout</p></div>
        </nav>
    );
}

export default Navbar
