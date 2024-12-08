import React from 'react';
import profileIcon from '../images/Screenshot_2024-12-02_111230-removebg-preview.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Navbar = () => {
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profileName, setProfileName] = useState("Guest");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/profile", {
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
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
          Swal.fire("Error", "Please select a file to upload", "error");
          return;
        }
      
        const formData = new FormData();
        formData.append("file", selectedFile);
      
        try {
          const response = await axios.post("http://localhost:5000/api/auth/posts", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
      
          Swal.fire("Success", "Post created successfully!", "success", response.data.message);
          setIsCreateModalOpen(false);
          setSelectedFile(null);
        } catch (err) {
          console.error("Error uploading post:", err.message);
          Swal.fire("Error", "Error uploading post!", "error");
        }
      };
      

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
        <nav className="bg-white p-4 justify-between min-w-[15%] shadow-lg h-screen space-y-8 cursor-pointer fixed">
            <div className="font-bold text-start p-3 text-3xl text-red-600 hover:text-red-700">
                <Link to={'/browse'}>Linknest</Link>
            </div>
            <Link to={'/profile'}>
                <span className='m-6 flex space-x-2 transition-transform transform hover:scale-105'>
                    <img
                        src={profilePhoto || profileIcon}
                        alt="Profile"
                        className="h-9 w-9 rounded-full mb-5 ring-2 ring-gray"
                    />
                    <p className='font-semibold text-2xl'>{profileName}</p>
                </span>
            </Link>
            <div className="flex flex-col text-start p-4 space-y-4 text-lg font-extralight">
                <Link to={'/browse'}>
                    <span className='shadow-sm m-3 space-x-2 flex transition-transform transform hover:scale-105'>
                        <i class="fa-solid fa-house text-red-600 mt-1"></i>
                        <p>Home</p>
                    </span>
                </Link>
                <Link to={""}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'>
                    <i class="fa-solid fa-magnifying-glass text-red-600 mt-1"></i>
                        <p>Search</p>
                    </span>
                </Link>
                <Link to={''}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'>
                    <i class="fa-regular fa-message text-red-600 mt-2 "></i>
                        <p>Messages</p>
                    </span>
                </Link>
                <Link to={'/reels'}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'>
                    <i class="fa-solid fa-film text-red-600 mt-[0.40rem]"></i>
                        <p>Reels</p>
                    </span>
                </Link>
                <Link to={''}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105'>
                    <i class="fa-solid fa-bell text-red-600 mt-[0.40rem]"></i>
                        <p>Notifications</p>
                    </span>
                </Link>
                <Link to={''}>
                    <span className='shadow-sm m-3 flex space-x-2 transition-transform transform hover:scale-105' onClick={() => setIsCreateModalOpen(true)}>
                    <i class="fa-solid fa-plus text-red-600 mt-[0.42rem]"></i>
                        <p>Create</p>
                    </span>
                </Link>

                {/* Modal for Creating Post */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onRequestClose={() => setIsCreateModalOpen(false)}
                    className="flex justify-center items-center mx-[35rem] my-[15rem] max-w-lg w-full bg-red-600 rounded-lg shadow-lg p-6"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                >
                    <div className="w-full max-w-md mx-auto">
                        <h2 className="text-2xl text-center mb-4 font-bold">Create a Post</h2>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full p-2  rounded-lg mb-4 cursor-pointer"
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
            <div className='flex space-x-1 p-5 text-center font-semibold transition-transform transform hover:scale-105' onClick={handleLogOut}>
            <i class="fa-solid fa-arrow-right-from-bracket text-red-600 mt-2"></i>
                <p className='text-xl'>Logout</p>
            </div>
        </nav>
    );
};

export default Navbar;
