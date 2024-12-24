import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Posts from './Posts';

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showChangePhoto, setShowChangePhoto] = useState(false);
    const [newPhoto, setNewPhoto] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProfile(response.data);
        };

        fetchProfile();
    }, []);

    const fetchFollowers = async () => {
        if (showFollowers) {
            setShowFollowers(false);
        } else {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/followers`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFollowers(response.data);
            setShowFollowers(true);
        }
    };

    const fetchFollowing = async () => {
        if (showFollowing) {
            setShowFollowing(false);
        } else {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/following`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFollowing(response.data);
            setShowFollowing(true);
        }
    };

    const handleChangePhotoClick = () => {
        setShowChangePhoto(true);
    };

    const handlePhotoChange = (event) => {
        setNewPhoto(event.target.files[0]);
    };

    const handlePhotoUpload = async () => {
        const formData = new FormData();

        formData.append('profilePhoto', newPhoto);
        formData.append('name', profile.name);
        formData.append('address', profile.address);

        try {
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfile({ ...profile, profilePhoto: response.data.user.profilePhoto });
            setShowChangePhoto(false);
        } catch (error) {
            console.error('Error uploading photo:', error.response || error);
        }
    };


    return (
        <div className=" min-h-screen w-[1000px] flex flex-col items-center py-8">
            <div className="bg-white w-full max-w-4xl p-8 rounded-lg shadow-xl space-y-6">
                <div className="flex justify-center items-center flex-col">
                    <img
                        src={profile.profilePhoto}
                        alt="Profile"
                        className="rounded-full object-contain h-40 w-40 border-4 border-gray-300 mb-2"
                    /><button
                        onClick={handleChangePhotoClick}
                        className="mb-5 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                    >
                        Change Profile Photo
                    </button>
                    <h2 className="text-3xl font-semibold text-gray-800">{profile.name}</h2>
                    <p className="text-lg text-gray-500">@{profile.username}</p>
                    <p className="text-lg text-gray-600">{profile.email}</p>
                    <p className="text-lg text-gray-600">{profile.address}</p>
                </div>

                <div className="flex space-x-32 ml-60 items-center">
                    <button
                        onClick={fetchFollowers}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Followers: {profile.followers?.length}
                    </button>
                    <button
                        onClick={fetchFollowing}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                    >
                        Following: {profile.following?.length}
                    </button>
                </div>

                {showFollowers && (
                    <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800">Followers</h3>
                        <ul className="mt-4">
                            {followers.map((follower) => (
                                <li key={follower._id} className="py-2 border-b">
                                    <p className="text-gray-700">{follower.username}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {showFollowing && (
                    <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800">Following</h3>
                        <ul className="mt-4">
                            {following.map((follow) => (
                                <li key={follow._id} className="py-2 border-b">
                                    <p className="text-gray-700">{follow.username}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="mt-8 w-full max-w-4xl">
                    <Posts />
                </div>
            </div>

            {showChangePhoto && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-red-600 p-8 rounded-lg shadow-lg w-1/3 outline-none">
                        <h2 className="text-2xl font-semibold mb-4">Upload New Profile Photo</h2>
                        <input
                            type="file"
                            onChange={handlePhotoChange}
                            className="mb-4 p-2 rounded-md w-full outl"
                        />
                        <div className="flex justify-between space-x-2">
                            <button
                                onClick={handlePhotoUpload}
                                className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-950 transition-colors w-full"
                            >
                                Upload
                            </button>
                            <button
                                onClick={() => setShowChangePhoto(false)}
                                className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 transition-colors w-full"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}      
        </div>
    );
};

export default Profile;
