import React, { useEffect } from 'react'
import {useDispatch, useSelector} from "react-redux";
import { fetchSuggestedUsers , toggleFollowUser } from '../utils/userSlice';

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const {suggestedUsers , loading , error} = useSelector((state)=>state.users);

  useEffect(()=>{
    dispatch(fetchSuggestedUsers());
  },[dispatch]);

  const handleFollwingToggle = (userId)=>{
    dispatch(toggleFollowUser(userId));
  };

  if(loading) return <div>loading...</div>;
  if(error) return <div>Error : {error}</div>

  return(
    <div className="bg-white shadow-md p-5 rounded-md overflow-y-auto max-h-96 w-[400px] scroll-bar ">
      <h3 className="mb-4 font-extralight text-2xl">Suggested for you</h3>
      {suggestedUsers.map((user) => (
        <div key={user._id} className="flex justify-start text-center mb-2 space-x-4 p-2">
          <div><img src={user.profilePhoto} alt="" className='w-8 h-8 rounded-full' /></div>
          <div className='text-lg'>{user.username}</div>
          <button className="text-blue-500"onClick={()=>handleFollwingToggle(user._id)}>{user.isFollowing ? "Unfollow" : "Follow"}</button>
        </div>
      ))}
    </div>
  );
}

export default SuggestedUsers
