import React, { useEffect, useState } from "react";
import axios from "axios";
import SuggestedUsers from "./SuggestedUsers";
import profileIcon from "../images/Screenshot_2024-12-02_111230-removebg-preview.png";
import { formatDistanceToNow } from "date-fns";

const MainFeed = () => {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCurrentUserId(response.data._id);
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/getPosts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    if (currentUserId) fetchPosts();
  }, [currentUserId]);

  const handleLike = async (postId, isLiked) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const updatedPost = posts.map((post) =>
        post._id === postId
          ? { ...post, likes: response.data.likes, isLiked: !isLiked }
          : post
      );
      setPosts(updatedPost);
    } catch (err) {
      console.error("Error liking post:", err.message);
    }
  };
  

  return (
    <div className="px-5 flex space-x-10 mx-8 mt-10">
      <div className="flex flex-wrap gap-6 w-full justify-center">
        {posts.map((post) => (
          <div
            className="bg-white shadow-lg w-full sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[600px] min-h-[400px] rounded-md mb-6 p-5 flex flex-col items-center"
            key={post._id}
          >
            <div className="font-semibold flex pb-3 border-b-2 w-full">
              <img
                src={post.user?.profilePhoto || profileIcon}
                alt="Profile"
                className="h-10 w-10 rounded-full mr-3 ring-2 ring-gray-300"
              />
              <span className="self-center text-xl">{post.user?.username || "Unknown User"}</span>
            </div>

            {post.mediaType === "video" ? (
              <video
                controls
                src={post.mediaUrl}
                className="w-full h-[300px] object-contain rounded-md mt-3"
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt="Post"
                className="w-full h-auto object-contain rounded-md mt-3"
              />
            )}

            <div className="mt-3 w-full text-gray-600 flex justify-between items-center text-sm border-t-2">
              <button
                className={`flex items-center text-sm ${post.isLiked ? 'text-blue-500' : 'text-gray-400'}`}
                onClick={() => handleLike(post._id, post.isLiked)}
              >
                <i className="fa-solid fa-thumbs-up mx-1 mt-2"></i>
                <span className="mt-2">{post.likes} likes</span>
              </button>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-2">
        <SuggestedUsers />
      </div>
    </div>
  );
};

export default MainFeed;
