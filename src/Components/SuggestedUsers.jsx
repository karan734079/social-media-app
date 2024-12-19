import React, { useEffect,  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestedUsers, toggleFollowUser,  } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';

const SuggestedUsers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { suggestedUsers, loading, error} = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  const handleFollowingToggle = (userId) => {
    dispatch(toggleFollowUser(userId));
  };

  const viewUserProfile = (userId) =>{
    navigate(`/user/${userId}`);
  }

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
              onClick={() => viewUserProfile(user._id)}
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
          </div>
        ))}
    </div>
  );
};

export default SuggestedUsers;
