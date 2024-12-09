import React, { useEffect, useState } from "react";
import axios from "axios";
import SuggestedUsers from "./SuggestedUsers";
import profileIcon from "../images/Screenshot_2024-12-02_111230-removebg-preview.png";
import likeIcon from "../images/4926585.png";
import { formatDistanceToNow } from "date-fns";

const Reels = () => {
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
          
          const videoPosts = response.data.filter(post => post.mediaType === "video");
          setPosts(videoPosts);
        } catch (err) {
          console.error("Error fetching posts:", err.message);
        }
      };
  
      if (currentUserId) fetchPosts();
    }, [currentUserId]);
  
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
        setPosts(updatedPost); // Update the posts state with the new like count
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
  
              {/* Render video based on media type */}
              {post.mediaType === "video" && (
                <video
                  controls
                  src={post.mediaUrl}
                  className="w-full h-[300px] object-contain rounded-md mt-3"
                />
              )}
  
              <div className="mt-3 w-full text-gray-600 flex justify-between items-center text-sm border-t-2">
                <button
                  className="flex items-center text-sm"
                  onClick={() => handleLike(post._id)}
                >
                  <img src={likeIcon} alt="Like" className="h-6 w-6 mr-2" />
                  <span>{post.likes} likes</span>
                </button>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
        </div>
  
        {/* Suggested Users Sidebar */}
        <div className="px-4">
          <SuggestedUsers />
        </div>
      </div>
    );
};

export default Reels;
