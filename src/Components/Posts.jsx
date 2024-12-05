import React, { useEffect, useState } from 'react'
import likeIocn from '../images/4926585.png'
import profileIcon from '../images/Screenshot_2024-12-02_111230-removebg-preview.png'
import axios from 'axios'

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileName, setProfileName] = useState("Guest");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/getPosts', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPosts(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfilePhoto(response.data.profilePhoto || profileIcon);
        setProfileName(response.data.name || "Guest");
      } catch (err) {
        console.error("Failed to fetch profile", err.message);
      }
    };

    fetchProfile();
  }, []);

  return (<div className='grid grid-cols-3 gap-3'>
    {posts.map((post) => (
      <div className="bg-white shadow p-5 rounded-md mb-4 w-[200px] items-center justify-center text-center" key={post.id}>
        <div className="font-semibold flex pb-3 border-b-2 cursor-pointer"><img src={profilePhoto} alt="hello" className='h-7 w-7 rounded-full mr-2' />{profileName}</div>
        <img
          src={post.mediaUrl}
          alt="Post"
          className="w-full h-auto rounded-md mt-2"
        />
        <div className="mt-2 text-gray-600 border-t-2 pt-3 flex cursor-pointer">
          <span className='flex'><img src={likeIocn} alt="" className='h-6 w-6 mr-1 -mb-1' /><p className='text-center'>{post.likes} likes</p></span>
          <span className="ml-4">{post.time} ago</span>
        </div>
      </div>
    ))}
  </div>
  );
}

export default Posts
