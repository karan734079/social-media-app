import React, { useState, useEffect } from 'react';
import profileIcon from '../images/Screenshot_2024-12-02_111230-removebg-preview.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import { supabase } from '../utils/supaBase';
import { v4 as uuidv4 } from 'uuid';
import io from "socket.io-client";

Modal.setAppElement('#root');

const MobileNav = () => {
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profileName, setProfileName] = useState("Guest");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [caption, setCaption] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [id, setId] = useState(null);
    const navigate = useNavigate();
    const [threedot, setThreedot] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setProfilePhoto(response.data.profilePhoto || profileIcon);
                setProfileName(response.data.name || "Guest");
                setId(response.data._id);
            } catch (err) {
                console.error("Failed to fetch profile", err.message);
            }
        };

        fetchProfile();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
            setSelectedFile(null);
        }
    };


    const handleUpload = async () => {
        if (!selectedFile || !caption.trim()) {
            Swal.fire("Error", "Please select a file and add a caption", "error");
            return;
        }

        try {
            const fileName = `${Date.now()}_${selectedFile.name}`;
            const { data, error } = await supabase.storage
                .from('posts')
                .upload(fileName, selectedFile);

            if (error) throw error;

            const mediaUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/posts/${data.path}`;

            const { error: insertError } = await supabase
                .from('posts')
                .insert([
                    {
                        id: uuidv4(),
                        user_id: id,
                        caption,
                        media_url: mediaUrl,
                        media_type: selectedFile.type.includes('video') ? 'video' : 'image',
                        profilePhoto: profilePhoto,
                        profileName: profileName,
                    },
                ]);

            if (insertError) throw insertError;

            toast.success('Post created successfully!', {
                position: 'top-right',
                autoClose: 2000,
            });

            setIsCreateModalOpen(false);
            setSelectedFile(null);
            setCaption('');
            setImagePreview("");
        } catch (err) {
            console.error("Error uploading post:", err.message);
            toast.error('Error uploading post', {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/notifications`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setUnreadCount(response.data.filter((n) => !n.isRead).length);
            } catch (err) {
                console.error("Error fetching notifications", err.message);
            }
        };

        fetchNotifications();
    }, []);

    const handleLogOut = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of your account.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Logout',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('No token found');

                    // Notify the backend to update the user's status
                    await axios.post(`${process.env.REACT_APP_BASE_URL}api/auth/logout`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    // Emit the "user-logout" event to Socket.IO
                    const socket = io("http://localhost:5000"); // Adjust the URL as needed
                    socket.emit("user-logout", id); // Notify other users

                    // Clean up
                    localStorage.removeItem('token');
                    socket.disconnect(); // Disconnect the socket for the logged-out user
                    toast.success('Logout successful!', {
                        position: 'top-right',
                        autoClose: 1000,
                    });
                    setTimeout(() => navigate('/'), 1000);
                } catch (err) {
                    console.error('Error logging out:', err.message);
                    toast.error('Failed to log out. Please try again.', {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
            }
        });
    };


    return (
        <div className=' shadow-lg relative z-50'>
            <div className='flex justify-between my-2 mx-1'>
                <Link to={'/browse'}><img src="https://res.cloudinary.com/dk3zxkgez/image/upload/v1733678057/profile_photos/kz4ao9rfuvvqyojbvufc.png" alt="" className='w-10 h-10 mb-1' /></Link>
                <div className="font-bold text-2xl text-red-600 hover:text-red-700">
                    <Link to={'/browse'}>Linknest</Link>
                </div>
                <div className='flex'>
                    <Link to={'/profile'}>
                        <span className='flex transition-transform transform hover:scale-105'>
                            <img
                                src={profilePhoto || profileIcon}
                                alt="Profile"
                                className="h-6 w-6 object-contain rounded-full mt-2 ring-2 ring-gray-200"
                            />
                        </span>
                    </Link>
                    <div className='cursor-pointer' onClick={() => setThreedot((prev) => !prev)}>
                        <i className="fa-solid fa-bars text-2xl px-2 py-1"></i>
                    </div>
                </div>
                {threedot && <div className='absolute flex justify-center bg-gray-100 w-full text-center mt-14'>
                    <div className=''>
                        <Link to={'/browse'} onClick={() => setThreedot((prev) => !prev)}>
                            <span className='flex my-3 justify-start space-x-2 cursor-pointer hover:text-red-600'>
                                <i className="fa-solid fa-house text-xl text-red-600"></i>
                                <p className='text-lg'>Home</p>
                            </span>
                        </Link>
                        <Link to={`/chat/${id}/${profileName}`} onClick={() => setThreedot((prev) => !prev)}>
                            <span className='flex my-3 justify-start space-x-2 cursor-pointer hover:text-red-600'>
                                <i className="fa-regular fa-message text-xl text-red-600 "></i>
                                <p className='text-lg'>Messages</p>
                            </span>
                        </Link>
                        <Link to={'/reels'} onClick={() => setThreedot((prev) => !prev)}>
                            <span className='flex my-3 justify-start space-x-2 cursor-pointer hover:text-red-600'>
                                <i className="fa-solid fa-film text-xl text-red-600 "></i>
                                <p className='text-lg'>Reels</p>
                            </span>
                        </Link>
                        <Link to={'/notifications'} onClick={() => setThreedot((prev) => !prev)}>
                            <span className='flex my-3 justify-start space-x-2 cursor-pointer hover:text-red-600'>
                                <i className="fa-solid fa-bell text-xl text-red-600"></i>
                                <div className='flex space-x-[1px]'>
                                    <p className='text-lg'>Notifications</p>
                                    {unreadCount > 0 && (
                                        <div className='w-5 h-5 -my-1 -mx-2 rounded-full flex items-center text-center justify-center bg-red-600'>
                                            <span className="text-xs text-white rounded-full">
                                                {unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </span>
                        </Link>
                        <Link to={''} onClick={() => setIsCreateModalOpen(true)}>
                            <span className='flex my-3 text-xl justify-start space-x-2 cursor-pointer hover:text-red-600' >
                                <i className="fa-solid fa-plus text-xl text-red-600"></i>
                                <p className='text-lg'>Create</p>
                            </span>
                        </Link>
                        <Modal
                            isOpen={isCreateModalOpen}
                            onRequestClose={() => setIsCreateModalOpen(false)}
                            className=" max-w-lg w-full bg-red-600 rounded-lg shadow-lg p-6 m-5"
                            overlayClassName="absolute z-50 flex justify-center items-center inset-0 bg-black bg-opacity-50"
                        >
                            <div className="w-full max-w-md ">
                                <h2 className="text-2xl text-center mb-4 font-bold">Create a Post</h2>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full p-2 rounded-lg mb-4 cursor-pointer"
                                />
                                {imagePreview && (
                                    <div className="m-4">
                                        <img
                                            src={imagePreview}
                                            alt=""
                                            className="w-full h-48 object-contain rounded-lg"
                                        />
                                    </div>
                                )}
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Write a caption..."
                                    className="w-full p-2 rounded-lg mb-4"
                                />
                                <div className="flex justify-between space-x-4">
                                    <button
                                        onClick={handleUpload}
                                        className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-950 transition-colors w-full"
                                    >
                                        Upload
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCreateModalOpen(false)
                                            setImagePreview("");
                                        }}
                                        className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 transition-colors w-full"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </Modal>
                        <div className='flex my-3 text-xl justify-start space-x-2 cursor-pointer hover:text-red-600' onClick={handleLogOut}>
                            <i className="fa-solid fa-arrow-right-from-bracket text-xl mt-[0.15rem] text-red-600"></i>
                            <p className='text-lg'>Logout</p>
                        </div>
                    </div>

                </div>}
            </div>
            <ToastContainer />
        </div>
    )
};

export default MobileNav;

