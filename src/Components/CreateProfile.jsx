import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import Swal from 'sweetalert2';
import axios from 'axios';
import Lottie from 'lottie-react';
import create from '../images/animations/robo.json'
import { ToastContainer, toast } from 'react-toastify';

const CreateProfile = () => {
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    // const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const navigate = useNavigate();
    const { username } = useParams();

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setProfilePhoto(file);
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setPhotoPreview(previewURL);
        } else {
            setPhotoPreview(null);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("address", address);
        formData.append("profilePhoto", profilePhoto);

        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}api/auth/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success('Profile Created successfully', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
            })
            setTimeout(() => navigate("/browse"), 2000);
        } catch (err) {
            toast.error('Error Creating Profile', {
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

    return (
        <>
            <div>
                <h1 className="text-4xl font-bold text-center my-6 text-red-600">Linknest</h1>
            </div>
            <div className="flex items-center justify-around bg-white mx-2 mb-1">
                <Lottie className='hidden md:block h-[600px] w-[500px] mb-4' animationData={create} />
                <form
                    className="bg-red-600 p-7 rounded-lg shadow-lg w-96"
                    onSubmit={handleSaveProfile}
                >
                    <h2 className="text-xl font-bold mb-4 text-center text-white">Create Profile</h2>
                    <div className=''>
                        <div className="mb-4 justify-center items-center text-center space-y-2">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Profile Preview"
                                    className="w-24 h-24 rounded-full bg-white mx-auto object-contain border-2 border-white"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full mx-auto bg-white flex items-center justify-center text-gray-500">
                                    No Image
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="ml-9"
                            />
                        </div>
                        <div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={username}
                                    // onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 rounded bg-gray-100  focus:outline-none"
                                    placeholder='Username'
                                    readOnly
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded bg-gray-100  focus:outline-none"
                                    placeholder='Name'
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-3 rounded bg-gray-100  focus:outline-none"
                                    placeholder='Address'
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-black hover:bg-slate-950 rounded text-white font-medium"
                            >
                                Save Profile
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </>
    );
};

export default CreateProfile;
