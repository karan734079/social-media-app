import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestedUsers, toggleFollowUser, fetchUserPosts } from '../utils/userSlice';
import PostsList from '../Components/PostList';

const SuggestedUsers = () => {
  const [activeUserId, setActiveUserId] = useState(null);
  const [postsVisible, setPostsVisible] = useState({});
  const dispatch = useDispatch();
  const { suggestedUsers, loading, error, userPosts } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  const handleFollowingToggle = (userId) => {
    dispatch(toggleFollowUser(userId));
  };

  const handleViewPosts = (userId) => {
    if (!userPosts[userId]) {
      dispatch(fetchUserPosts(userId));
    }

    setPostsVisible((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white shadow-md p-5 rounded-md overflow-y-auto max-h-96 w-full sm:w-[350px] lg:w-[400px] scroll-bar">
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
                  className="w-8 h-8 rounded-full ring-2 object-contain ring-gray-300"
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
                    className="w-16 h-16 rounded-full object-contain bg-white ring-2 ring-gray-300"
                  />
                  <div>
                    <h2 className="text-xl text-black font-semibold">{user.name}</h2>
                    <p className="text-black">@{user.username}</p>
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
                  className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 ml-1"
                  onClick={() => handleViewPosts(user._id)}
                >
                  {postsVisible[user._id] ? 'Hide Posts' : `See ${user.name}'s Posts`}
                </button>

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
