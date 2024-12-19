import React, { useState, useEffect } from 'react';
import profileIcon from '../images/Screenshot_2024-12-02_111230-removebg-preview.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';

Modal.setAppElement('#root');

const Navbar = () => {
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profileName, setProfileName] = useState("Guest");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [caption, setCaption] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setProfilePhoto(response.data.profilePhoto || profileIcon);
                setProfileName(response.data.name || "Guest");
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

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("caption", caption);

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}api/auth/posts`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            toast.success('Post Created successfully', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
            });
            setIsCreateModalOpen(false);
            setSelectedFile(null);
            setCaption('');
        } catch (err) {
            console.error("Error uploading post:", err.message);
            toast.success('Error Uploading Post', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
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

                toast.success('Logout successful!', {
                    position: 'top-right',
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'light',
                });

                setTimeout(() => navigate('/'), 1000);
            }
        });
    };


    return (
        <nav className="bg-white p-4 justify-between w-1/6 md:w-[20%] h-full shadow-lg fixed">
            <div className="font-bold text-start p-3 text-3xl text-red-600 hover:text-red-700">
                <Link to={'/browse'}>Linknest</Link>
            </div>
            <Link to={'/profile'}>
                <span className='m-6 flex space-x-2 transition-transform transform hover:scale-105'>
                    <img
                        src={profilePhoto || profileIcon}
                        alt="Profile"
                        className="h-9 w-9 object-contain rounded-full mb-5 ring-2 ring-gray-200"
                    />
                    <p className='font-semibold text-2xl'>{
                        (profileName.length < 12) ? profileName : `${profileName.slice(0, 12)}...`}</p>
                </span>
            </Link>
            <div className="flex flex-col text-start p-6 space-y-6 text-lg font-extralight">
                <Link to={'/browse'}>
                    <span className='shadow-sm m-3 space-x-2 flex transition-transform transform hover:scale-105'>
                        <i className="fa-solid fa-house text-red-600 mt-1"></i>
                        <p>Home</p>
                    </span>
                </Link>
                <Link to={'/chat'}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'>
                        <i className="fa-regular fa-message text-red-600 mt-2 "></i>
                        <p>Messages</p>
                    </span>
                </Link>
                <Link to={'/reels'}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'>
                        <i className="fa-solid fa-film text-red-600 mt-[0.40rem]"></i>
                        <p>Reels</p>
                    </span>
                </Link>
                <Link to={'/notifications'}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'>
                        <i className="fa-solid fa-bell text-red-600 mt-[0.40rem]"></i>
                        <div className='flex space-x-[1px]'>
                            <p>Notifications</p>
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
                <Link to={''}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105' onClick={() => setIsCreateModalOpen(true)}>
                        <i className="fa-solid fa-plus text-red-600 mt-[0.42rem]"></i>
                        <p>Create</p>
                    </span>
                </Link>

                <Modal
                    isOpen={isCreateModalOpen}
                    onRequestClose={() => setIsCreateModalOpen(false)}
                    className="flex justify-center items-center mx-auto my-56 max-w-lg w-full bg-red-600 rounded-lg shadow-lg p-6"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                >
                    <div className="w-full max-w-md mx-auto">
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
                                onClick={() => setIsCreateModalOpen(false)}
                                className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 transition-colors w-full"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
            <div className='flex space-x-1 p-8 text-center font-semibold transition-transform transform hover:scale-105' onClick={handleLogOut}>
                <i className="fa-solid fa-arrow-right-from-bracket text-red-600 mt-[0.7rem]"></i>
                <p className='text-2xl'>Logout</p>
            </div>
            <ToastContainer />
        </nav>
    );
};

export default Navbar;
