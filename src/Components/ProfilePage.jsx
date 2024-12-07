import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Posts from './Posts';

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProfile(response.data);
        };

        fetchProfile();
    }, []);

    const fetchFollowers = async () => {
        if (showFollowers) {
            setShowFollowers(false); // Close the followers card if it's already open
        } else {
            const response = await axios.get('http://localhost:5000/api/auth/followers', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFollowers(response.data);
            setShowFollowers(true); // Show the followers card
        }
    };

    const fetchFollowing = async () => {
        if (showFollowing) {
            setShowFollowing(false); // Close the following card if it's already open
        } else {
            const response = await axios.get('http://localhost:5000/api/auth/following', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFollowing(response.data);
            setShowFollowing(true); // Show the following card
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center py-8">
            <div className="bg-white w-full max-w-4xl p-8 rounded-lg shadow-xl space-y-6">
                <div className="flex justify-center items-center flex-col">
                    <img
                        src={profile.profilePhoto}
                        alt="Profile"
                        className="rounded-full h-40 w-40 border-4 border-blue-500 mb-4"
                    />
                    <h2 className="text-3xl font-semibold text-gray-800">{profile.name}</h2>
                    <p className="text-lg text-gray-500">@{profile.username}</p>
                    <p className="text-lg text-gray-600">{profile.email}</p>
                    <p className="text-lg text-gray-600">{profile.address}</p>
                </div>

                <div className="flex justify-around items-center">
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
            </div>

            <div className="mt-8 w-full max-w-4xl">
                <h1 className='text-3xl font-semibold m-5'>Posts:</h1>
                <Posts />
            </div>
        </div>
    );
};

export default Profile;
