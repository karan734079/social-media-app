import React, { useEffect, useState } from "react";
import axios from "axios";
import profileIcon from "../images/Screenshot_2024-12-02_111230-removebg-preview.png";
import { formatDistanceToNow } from "date-fns";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserId(response.data._id);
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}api/auth/getPosts?filter=currentUser`,
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

  const handleLike = async (postId, isLiked) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}api/auth/posts/${postId}/like`,
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

  const handleDelete = async (postId) => {
    try {
      const postToDelete = posts.find(post => post._id === postId);
      if (postToDelete.user._id !== userId) {
        alert("You can only delete your own posts.");
        return;
      }

      await axios.delete(`${process.env.REACT_APP_BASE_URL}api/auth/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err.message);
    }
  };

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5 mt-10">
      {posts.map((post) => (
        <div
          className="bg-white shadow-md rounded-md p-4 flex flex-col justify-between items-center max-w-[400px] w-full"
          key={post._id}
        >
          <div className="font-semibold flex justify-between w-full pb-3 border-b-2">
            <div className="flex items-center space-x-2">
              <img
                src={post.user?.profilePhoto || profileIcon}
                alt="Profile"
                className="h-10 w-10 rounded-full object-contain ring-2 ring-gray-200"
              />
              <span className="text-md">{post.user?.username || "Unknown User"}</span>
            </div>

            {post.user._id === userId && (
              <button
                onClick={() => handleDelete(post._id)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                X
              </button>
            )}
          </div>

          {post.mediaType === "video" ? (
            <video
              controls
              src={post.mediaUrl}
              className="w-full h-[400px] object-cover rounded-md mt-3"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post"
              className="w-full h-[400px] object-cover rounded-md mt-3"
            />
          )}

          <div className="mr-auto mt-2 text-sm">
            {post.caption}
          </div>

          <div className="mt-3 w-full text-gray-600 flex justify-between items-center text-sm border-t-2 pt-2">
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
