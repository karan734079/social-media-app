import React, { useEffect, useState } from "react";
import axios from "axios";
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

  // Handle like functionality
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
          ? { ...post, likes: response.data.likes, isLiked: !isLiked } // Toggle like status
          : post
      );
      setPosts(updatedPost);
    } catch (err) {
      console.error("Error liking post:", err.message);
    }
  };

  // Handle delete functionality
  const handleDelete = async (postId) => {
    try {
      // Ensure the post belongs to the current user
      const postToDelete = posts.find(post => post._id === postId);
      if (postToDelete.user._id !== userId) {
        alert("You can only delete your own posts.");
        return;
      }

      // Send request to delete the post
      await axios.delete(`http://localhost:5000/api/auth/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Remove the post from the state (optimistic UI update)
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err.message);
    }
  };

  return (
    <div className="grid  sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 px-5 mt-10">
      {posts.map((post) => (
        <div
          className="bg-white shadow-md rounded-md p-4 flex flex-col justify-between items-center"
          key={post._id}
        >
          <div className="font-semibold flex justify-between w-full pb-3 border-b-2">
            <div className="flex items-center space-x-2">
              <img
                src={post.user?.profilePhoto || profileIcon}
                alt="Profile"
                className="h-7 w-7 rounded-full ring-2 ring-red-600"
              />
              <span className="text-md">{post.user?.username || "Unknown User"}</span>
            </div>
            {/* Display delete button only for the current user's posts */}
            {post.user._id === userId && (
              <button
                onClick={() => handleDelete(post._id)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                X
              </button>
            )}
          </div>

          {/* Render video or image based on media type */}
          {post.mediaType === "video" ? (
            <video
              controls
              src={post.mediaUrl}
              className="w-full max-h-[400px] object-contain rounded-md mt-3"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post"
              className="w-full max-h-[400px] object-contain rounded-md mt-3"
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
  );
};

export default Posts;
