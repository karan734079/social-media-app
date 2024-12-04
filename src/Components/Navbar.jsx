import React from 'react'
import homeIcon from '../images/846449.png'
import searchIcon from '../images/search-icon-free-vector-removebg-preview.png'
import messegeIcon from '../images/685887.png'
import profileIcon from '../images/Screenshot_2024-12-02_111230-removebg-preview.png'
import createIcon from '../images/39c8f16f856d23e08b995f8facdbcf8d-removebg-preview.png'
import notificationIcon from '../images/3119338.png'
import logoutIcon from '../images/126467.png'
import reelsIcon from '../images/reels.png';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const Navbar = () => {
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profileName, setProfileName] = useState("Guest");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/profile", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setProfilePhoto(response.data.profilePhoto || profileIcon); 
                setProfileName(response.data.name || "Guest");
                console.log(response.data)
            } catch (err) {
                console.error("Failed to fetch profile", err.message);
            }
        };

        fetchProfile();
    }, []);

    const handleLogOut = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of your account.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Logout',
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                navigate('/');
            }
        });
    };

    return (
        <nav className="bg-white  p-4 justify-between min-w-[15%] shadow-lg h-screen space-y-8 cursor-pointer fixed">
            <div className="font-bold text-start p-3 text-3xl text-red-600 hover:text-red-700">Linknest</div>
            <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img
                src={profilePhoto || profileIcon}
                alt="Profile"
                className="h-8 w-8 rounded-full mb-5"
            /><p className='font-semibold text-2xl'>{profileName}</p></span>
            <div className="flex flex-col text-start p-3 space-y-9 text-lg font-extralight">
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={homeIcon} alt="" className='h-7 w-7' /><p>Home</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={searchIcon} alt="" className='h-7 w-7' /><p>Search</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={messegeIcon} alt="" className='h-7 w-7' /><p>Messages</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={reelsIcon} alt="" className='h-7 w-7' /><p>Reels</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={notificationIcon} alt="" className='h-7 w-7' /><p>Notifications</p></span>
                <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'><img src={createIcon} alt="" className='h-7 w-7' /><p>Create</p></span>

            </div>
            <div className='flex space-x-2 p-3 text-center font-semibold space-y-6 transition-transform transform hover:scale-105' onClick={handleLogOut}><img src={logoutIcon} alt="" className='h-8 w-8 mt-6' /><p className='text-xl'>Logout</p></div>
        </nav>
    );
}

export default Navbar
