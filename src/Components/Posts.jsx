import React, { useEffect, useState } from "react";
import axios from "axios";
import likeIcon from "../images/4926585.png";
import profileIcon from "../images/Screenshot_2024-12-02_111230-removebg-preview.png";
import { formatDistanceToNow } from "date-fns";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  // Fetch the logged-in user's profile to get their ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserId(response.data._id);
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      }
    };

    fetchProfile();
  }, []);

  // Fetch posts created by the current user
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/getPosts?filter=currentUser`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    if (userId) fetchPosts();
  }, [userId]);

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const updatedPost = posts.map((post) =>
        post._id === postId ? { ...post, likes: response.data.likes } : post
      );
      setPosts(updatedPost);
    } catch (err) {
      console.error("Error liking post:", err.message);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-5">
      {posts.map((post) => (
        <div
          className="bg-white shadow p-5 rounded-md mb-4 w-[250px] items-center justify-center text-center"
          key={post._id}
        >
          <div className="font-semibold flex pb-3 border-b-2 cursor-pointer">
            <img
              src={post.user?.profilePhoto || profileIcon}
              alt="Profile"
              className="h-7 w-7 rounded-full mr-2"
            />
            {post.user?.username || "Unknown User"}
          </div>
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full h-auto rounded-md mt-2"
          />
          <div className="mt-2 text-gray-600 border-t-2 pt-3 flex justify-between ">
            <button
              className="flex items-center"
              onClick={() => handleLike(post._id)}
            >
              <img src={likeIcon} alt="Like" className="h-6 w-6 mr-1" />
              <span>{post.likes} likes</span>
            </button>
            <span className="text-sm mt-1">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Posts;
