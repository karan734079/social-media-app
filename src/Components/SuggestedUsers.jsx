import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestedUsers, toggleFollowUser, fetchUserPosts } from '../utils/userSlice'; // Add fetchUserPosts
import PostsList from '../Components/PostList'; // Assuming you have a PostsList component

const SuggestedUsers = () => {
  const [activeUserId, setActiveUserId] = useState(null); // Tracks the active user's card
  const [postsVisible, setPostsVisible] = useState({}); // State to track posts visibility for each user
  const dispatch = useDispatch();
  const { suggestedUsers, loading, error, userPosts } = useSelector((state) => state.users); // Include userPosts

  useEffect(() => {
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  const handleFollowingToggle = (userId) => {
    dispatch(toggleFollowUser(userId));
  };

  const handleViewPosts = (userId) => {
    // Fetch posts for the selected user and toggle their card
    if (!userPosts[userId]) {
      dispatch(fetchUserPosts(userId));
    }

    // Toggle visibility of posts for the specific user
    setPostsVisible((prev) => ({
      ...prev,
      [userId]: !prev[userId], // Toggle the visibility for this user
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white shadow-md p-5 rounded-md overflow-y-auto max-h-96 w-[400px] scroll-bar">
      <h3 className="mb-4 font-extralight text-2xl">Suggested for you</h3>
      {suggestedUsers &&
        suggestedUsers.map((user) => (
          <div key={user._id} className="mb-4">
            <div
              className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => setActiveUserId((prev) => (prev === user._id ? null : user._id))}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.profilePhoto}
                  alt={`${user.username}'s profile`}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-lg">{user.username}</div>
              </div>
              <button
                className="text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowingToggle(user._id);
                }}
              >
                {user.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
            {activeUserId === user._id && (
              <div className="p-4 mt-2 bg-red-600 shadow text-white rounded-md border">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.profilePhoto}
                    alt={`${user.username}'s profile`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-white">@{user.username}</p>
                  </div>
                </div>
                <div className="mt-4 text-white">
                  <p>Email: {user.email}</p>
                  <p>Address: {user.address}</p>
                </div>
                <button className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900">
                  Message
                </button>
                <button
                  className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 ml-5"
                  onClick={() => handleViewPosts(user._id)}
                >
                  {postsVisible[user._id] ? 'Hide Posts' : `See ${user.name}'s Posts`}
                </button>

                {/* Conditionally render posts */}
                {postsVisible[user._id] && userPosts[user._id] && (
                  <div className="mt-4">
                    <PostsList posts={userPosts[user._id]} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default SuggestedUsers;
