import React from 'react'
import profileIcon from '../images/Screenshot 2024-05-08 221135.png'
import likeIocn from '../images/4926585.png'

const Posts = ({post}) => {
  return (
    <div className="bg-white shadow p-5 rounded-md mb-4 w-[650px]">
      <div className="font-semibold flex pb-3 border-b-2 cursor-pointer"><img src={profileIcon} alt="" className='h-7 w-7 rounded-full mr-2'/>{post.username}</div>
      <img
        src={post.image}
        alt="Post"
        className="w-full h-auto rounded-md mt-2"
      />
      <div className="mt-2 text-gray-600 border-t-2 pt-3 flex cursor-pointer">
        <span className='flex'><img src={likeIocn} alt="" className='h-6 w-6 mr-1 -mb-1' /><p className='text-center'>{post.likes} likes</p></span>
        <span className="ml-4">{post.time} ago</span>
      </div>
    </div>
  );
}

export default Posts
