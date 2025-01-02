// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import profileIcon from "../images/Screenshot_2024-12-02_111230-removebg-preview.png";
// import { formatDistanceToNow } from "date-fns";

// const Posts = () => {
//   const [posts, setPosts] = useState([]);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         setUserId(response.data._id);
//       } catch (err) {
//         console.error("Failed to fetch profile:", err.message);
//       }
//     };

//     fetchProfile();
//   }, []);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}api/auth/getPosts?filter=currentUser`,
//           {
//             headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//           }
//         );
//         setPosts(response.data);
//       } catch (err) {
//         console.error("Error fetching posts:", err.message);
//       }
//     };

//     if (userId) fetchPosts();
//   }, [userId]);

//   const handleLike = async (postId, isLiked) => {
//     try {
//       const response = await axios.put(
//         `${process.env.REACT_APP_BASE_URL}api/auth/posts/${postId}/like`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );
//       const updatedPost = posts.map((post) =>
//         post._id === postId
//           ? { ...post, likes: response.data.likes, isLiked: !isLiked }
//           : post
//       );
//       setPosts(updatedPost);
//     } catch (err) {
//       console.error("Error liking post:", err.message);
//     }
//   };

//   const handleDelete = async (postId) => {
//     try {
//       const postToDelete = posts.find(post => post._id === postId);
//       if (postToDelete.user._id !== userId) {
//         alert("You can only delete your own posts.");
//         return;
//       }

//       await axios.delete(`${process.env.REACT_APP_BASE_URL}api/auth/posts/${postId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });

//       setPosts(posts.filter((post) => post._id !== postId));
//     } catch (err) {
//       console.error("Error deleting post:", err.message);
//     }
//   };

//   return (
//     <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5 mt-10">
//       {posts.map((post) => (
//         <div
//           className="bg-white shadow-md rounded-md p-4 flex flex-col justify-between items-center max-w-[400px] w-full"
//           key={post._id}
//         >
//           <div className="font-semibold flex justify-between w-full pb-3 border-b-2">
//             <div className="flex items-center space-x-2">
//               <img
//                 src={post.user?.profilePhoto || profileIcon}
//                 alt="Profile"
//                 className="h-10 w-10 rounded-full object-contain ring-2 ring-gray-200"
//               />
//               <span className="text-md">{post.user?.username || "Unknown User"}</span>
//             </div>

//             {post.user._id === userId && (
//               <button
//                 onClick={() => handleDelete(post._id)}
//                 className="text-red-500 hover:text-red-700 text-xl"
//               >
//                 X
//               </button>
//             )}
//           </div>

//           {post.mediaType === "video" ? (
//             <video
//               controls
//               src={post.mediaUrl}
//               className="w-full h-[400px] object-cover rounded-md mt-3"
//             />
//           ) : (
//             <img
//               src={post.mediaUrl}
//               alt="Post"
//               className="w-full h-[400px] object-cover rounded-md mt-3"
//             />
//           )}

//           <div className="mr-auto mt-2 text-sm">
//             {post.caption}
//           </div>

//           <div className="mt-3 w-full text-gray-600 flex justify-between items-center text-sm border-t-2 pt-2">
//             <button
//               className={`flex items-center text-sm ${post.isLiked ? 'text-blue-500' : 'text-gray-400'}`}
//               onClick={() => handleLike(post._id, post.isLiked)}
//             >
//               <i className="fa-solid fa-thumbs-up mx-1 mt-2"></i>
//               <span className="mt-2">{post.likes} likes</span>
//             </button>
//             <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Posts;

import React, { useState, useEffect } from "react";
import axios from "axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  const [selectedPost, setSelectedPost] = useState(null);

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
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/getPosts?filter=currentUser`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    fetchPosts();
  }, []);

  const openModal = (post) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

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
    <div className="grid grid-cols-3 gap-6 p-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="relative group cursor-pointer w-full h-48 bg-gray-100 shadow-md rounded-lg overflow-hidden"
          onClick={() => openModal(post)}
        >
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              className="w-full h-full object-contain"
              muted
              loop
              autoPlay
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post"
              className="w-full h-full object-contain"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <p className="text-white text-lg">
              ❤️ {post.likes} &middot; 🗨️ {post.comments?.length || 0}
            </p>
          </div>
        </div>
      ))}

      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white max-w-2xl max-h-96 w-full rounded-lg shadow-lg overflow-hidden flex">
            <div className="w-2/3 bg-gray-100">
              {selectedPost.mediaType === "video" ? (
                <video
                  controls
                  src={selectedPost.mediaUrl}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={selectedPost.mediaUrl}
                  alt="Post"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="w-1/3 p-6 flex flex-col">
              <div className="mb-4">
                <h2 className="font-semibold text-lg">{selectedPost.caption}</h2>
                <span className="text-sm text-gray-600">
                  ❤️ {selectedPost.likes} likes
                </span>
              </div>
              <div className="mt-auto">
                <button
                  onClick={() => handleDelete(selectedPost._id)}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 w-full mb-4"
                >
                  Delete Post
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400 w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;


