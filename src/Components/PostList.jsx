import React, { useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const PostsList = ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState(initialPosts);

  if (!posts || posts.length === 0) {
    return <div className="text-gray-500 text-sm">No posts available.</div>;
  }

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the likes for the specific post
      const updatedPosts = posts.map((post) =>
        post._id === postId ? { ...post, likes: response.data.likes } : post
      );
      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error liking post:", err.message);
    }
  };

  return (
    <div className="mt-4 w-[300px] h-[378px] grid grid-cols-1 bg-white rounded-md p-4 shadow-md overflow-y-auto scroll-bar">
      {posts.map((post) => (
        <div
          className="bg-white shadow p-5 rounded-md mb-4 text-center"
          key={post._id}
        >
          {/* Post Header */}
          <div className="font-semibold flex items-center justify-start pb-3 border-b-2 cursor-pointer">
            <img
              src={post.user?.profilePhoto || "/default-avatar.png"}
              alt="Profile"
              className="h-7 w-7 rounded-full mr-2 ring-2 ring-gray-300"
            />
            <span className="text-black">{post.user?.username || "Unknown User"}</span>
          </div>

          {/* Post Media */}
          {post.mediaType === "video" ? (
            <video
              controls
              src={post.mediaUrl}
              className="w-full h-[300px] object-contain rounded-md mt-2"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post"
              className="w-full h-auto rounded-md mt-2"
            />
          )}

          {/* Post Footer */}
          <div className="mt-2 text-gray-600 border-t-2 pt-3 flex justify-between items-center">
            {/* Like Button */}
            <button
              className="flex items-center"
              onClick={() => handleLike(post._id)}
            >
              <i class="fa-solid fa-thumbs-up text-gray-400 mx-1 mt-2"></i>
              <span className="mt-2">{post.likes} likes</span>
            </button>

            {/* Post Timestamp */}
            <span className="text-sm">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
