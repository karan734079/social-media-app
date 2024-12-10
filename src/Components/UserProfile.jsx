import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PostsList from '../Components/PostList';

const UserProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                const userResponse = await axios.get(`http://localhost:5000/api/auth/profile?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setUser(userResponse.data);

                const postsResponse = await axios.get(`http://localhost:5000/api/auth/getPosts?filter=userId&userId=${userId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setUserPosts(postsResponse.data);

                const followersResponse = await axios.get(`http://localhost:5000/api/auth/followers?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setFollowers(followersResponse.data);

                const followingResponse = await axios.get(`http://localhost:5000/api/auth/following?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setFollowing(followingResponse.data);

                setLoading(false);
            } catch (err) {
                setLoading(false);
                setError(err.message);
            }
        };

        fetchUserData();
    }, [userId]);

    const fetchFollowers = () => {
        setShowFollowers(!showFollowers);
    };

    const fetchFollowing = () => {
        setShowFollowing(!showFollowing);
    };

    const handleMessage = () => {
        alert(`Message feature for ${user.username} is coming soon!`);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="h-screen w-[1000px] flex flex-col items-center py-8">
            <div className="bg-white w-full max-w-4xl p-8 rounded-lg shadow-xl space-y-6">
                <div className="flex justify-center items-center flex-col">
                    <img
                        src={user.profilePhoto}
                        alt="Profile"
                        className="rounded-full h-40 w-40 border-4 border-gray-300 mb-2"
                    />
                    <h2 className="text-3xl font-semibold text-gray-800">{user.name}</h2>
                    <p className="text-lg text-gray-500">@{user.username}</p>
                    <p className="text-lg text-gray-600">{user.email}</p>
                    <p className="text-lg text-gray-600">{user.address}</p>
                </div>

                <div className="flex items-center ml-60 space-x-3">
                    <div className='space-x-3'>
                        <button
                            onClick={fetchFollowers}
                            className="bg-blue-600 text-white  px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                        >
                            Followers: {followers.length}
                        </button>
                        <button
                            onClick={fetchFollowing}
                            className="bg-green-600 text-white  px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                        >
                            Following: {following.length}
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={handleMessage}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                        >
                            Message
                        </button>
                    </div>
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
                    <h1 className="text-3xl font-semibold m-5 text-red-600">Posts:</h1>
                    <PostsList posts={userPosts} className="grid grid-cols-3 gap-4" />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
