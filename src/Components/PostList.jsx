import React, { useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const PostsList = ({ posts: initialPosts, className = 'grid grid-cols-1 gap-4', imgWidth = 'w-full' }) => {
  const [posts, setPosts] = useState(initialPosts);

  if (!posts || posts.length === 0) {
    return <div className="text-gray-500 text-sm">No posts available.</div>;
  }

  const handleLike = async (postId, isLiked) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const updatedPost = posts.map((post) =>
        post._id === postId
          ? { ...post, likes: response.data.likes, isLiked: !isLiked }
          : post
      );
      setPosts(updatedPost);
    } catch (err) {
      console.error('Error liking post:', err.message);
    }
  };

  return (
    <div className={`mt-4 ${className} overflow-y-auto bg-white rounded-md p-4 shadow-md`}>
      {posts.map((post) => (
        <div
          className="bg-white shadow-md p-4 rounded-lg flex flex-col justify-between h-[450px] mb-4 text-center"
          key={post._id}
        >
          <div className="font-semibold flex items-center justify-start pb-3 border-b-2 cursor-pointer">
            <img
              src={post.user?.profilePhoto || '/default-avatar.png'}
              alt="Profile"
              className="h-8 w-8 rounded-full object-contain bg-white mr-2 ring-2 ring-gray-300"
            />
            <span className="text-black">{post.user?.username || 'Unknown User'}</span>
          </div>

          <div className="flex-grow mt-4">
            {post.mediaType === 'video' ? (
              <video
                controls
                src={post.mediaUrl}
                className="w-full h-[250px] object-contain rounded-md"
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt="Post"
                className={`${imgWidth} h-[250px] object-contain rounded-md`}
              />
            )}
          </div>
          <div className="mr-auto mt-2 text-black">{post.caption}</div>

          <div className="mt-4 w-full text-gray-600 flex justify-between items-center text-sm border-t-2 pt-2">
            <button
              className={`flex items-center text-sm ${post.isLiked ? 'text-blue-500' : 'text-gray-400'}`}
              onClick={() => handleLike(post._id, post.isLiked)}
            >
              <i className="fa-solid fa-thumbs-up mx-1"></i>
              <span>{post.likes} likes</span>
            </button>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
