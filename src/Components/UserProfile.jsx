import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PostsList from '../Components/PostList';
import { supabase } from '../utils/supaBase';

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

        const userResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile?userId=${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(userResponse.data);

        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const filteredPosts = posts.filter((post) => post.user_id === userId);
        setUserPosts(filteredPosts);

        const followersResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/followers?userId=${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFollowers(followersResponse.data);

        const followingResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/following?userId=${userId}`, {
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

  const closeModal = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-full max-w-4xl p-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-14">
          <div className="relative">
            <img
              src={user.profilePhoto || "https://via.placeholder.com/150"}
              alt="Profile"
              className="rounded-full h-40 w-40 object-contain border-4 border-gray-300"
            />
          </div>
          <div className="text-center sm:text-left">
            <div className='flex space-x-4'><h2 className="text-3xl font-bold text-gray-800">{user.name}</h2> <button className='text-red-600 rounded p-2 border'>Message</button></div>
            <h2 className="text-base mt-1">@{user.username}</h2>
            <h2 className="text-base">{user.email}</h2>
            <h2 className="text-base">{user.address}</h2>
            <div className="mt-4 flex space-x-8 text-lg text-gray-600">
              <div>
                <strong className="text-gray-800">{userPosts.length || 0}</strong> Posts
              </div>
              <button onClick={fetchFollowers} className="text-gray-600">
                <strong className="text-gray-800">{user.followers?.length || 0}</strong> Followers
              </button>
              <button onClick={fetchFollowing} className="text-gray-600">
                <strong className="text-gray-800">{user.following?.length || 0}</strong> Following
              </button>
            </div>
          </div>
        </div>

        {showFollowers && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-40">
            <div className="bg-white rounded-lg w-1/3 overflow-y-auto scroll-bar max-h-96 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Followers</h3>
              <ul>
                {followers.map((follower) => (
                  <li key={follower._id} className="flex items-center mb-4">
                    <img
                      src={follower.profilePhoto || "https://via.placeholder.com/40"}
                      alt={follower.username}
                      className="h-10 w-10 rounded-full mr-4 object-contain"
                    />
                    <p className="text-gray-700">{follower.username}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={closeModal}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showFollowing && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-40">
            <div className="bg-white rounded-lg w-1/3 overflow-y-auto scroll-bar max-h-96 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Following</h3>
              <ul>
                {following.map((follow) => (
                  <li key={follow._id} className="flex items-center mb-4">
                    <img
                      src={follow.profilePhoto || "https://via.placeholder.com/40"}
                      alt={follow.username}
                      className="h-10 w-10 rounded-full mr-4 object-contain"
                    />
                    <p className="text-gray-700">{follow.username}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={closeModal}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 w-full max-w-4xl border-t">
        <PostsList userId={userId} />
      </div>
    </div>
  );
};

export default UserProfile;
