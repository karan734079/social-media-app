import React, { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../utils/supaBase";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch the profile information to get the userId
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

  // Fetch posts and their associated comments
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: posts, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Filter posts based on the current user
        const filteredPosts = posts.filter((post) => post.user_id === userId);

        // Fetch comments for these posts
        const postIds = filteredPosts.map((post) => post.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .in("post_id", postIds); // Get all comments for these posts

        if (commentsError) throw commentsError;

        // Store comments in state grouped by post_id
        const commentsByPost = commentsData.reduce((acc, comment) => {
          acc[comment.post_id] = acc[comment.post_id] || [];
          acc[comment.post_id].push(comment);
          return acc;
        }, {});

        // Update the posts state with the associated comments
        const postsWithComments = filteredPosts.map((post) => ({
          ...post,
          comments: commentsByPost[post.id] || [],
        }));

        setPosts(postsWithComments);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    if (userId) fetchPosts(); // Fetch posts once the userId is available
  }, [userId]);

  const openModal = (post) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

  const handleDelete = async (postId) => {
    try {
      // Extract the filename from the post's media_url
      const fileName = postId.split('/').pop();

      // Delete the file from Supabase storage
      const { error: storageError } = await supabase.storage
        .from('posts')
        .remove([fileName]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError.message);
        return;
      }
      console.log('Image deleted from storage successfully');

      // Delete the post record from Supabase database
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteError) {
        console.error('Error deleting post from database:', deleteError.message);
        return;
      }
      console.log('Post deleted from database successfully');

      // Update the state to remove the deleted post
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error('Error during deletion:', err.message);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-16 gap-y-10 p-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative group cursor-pointer  w-72  h-72  bg-gray-50 shadow-md rounded-lg overflow-hidden"
          onClick={() => openModal(post)}
        >
          {post.media_type === "video" ? (
            <video
              src={post.media_url}
              className="w-full h-full object-contain"
              muted
              loop
              autoPlay
            />
          ) : (
            <img
              src={post.media_url}
              alt="Post"
              className="w-full h-full object-contain"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <p className="text-white text-lg">
              ❤️ {post.likes} &middot; 🗨️ {post.comments.length}
            </p>
          </div>
        </div>
      ))}

      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white max-w-2xl max-h-96 w-full rounded-lg shadow-lg overflow-hidden flex">
            <div className="w-2/3 bg-gray-100">
              {selectedPost.media_type === "video" ? (
                <video
                  controls
                  src={selectedPost.media_url}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={selectedPost.media_url}
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

              {/* Displaying Comments */}
              <div className="flex-grow overflow-y-auto scroll-bar">
                <h3 className="font-semibold text-md">Comments</h3>
                <div className="space-y-2 mt-2 ">
                  {selectedPost.comments.length > 0 ? (
                    selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <img
                          src={comment.profilePhoto}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-contain"
                        />
                        <div>
                          <span className="font-semibold">{comment.profileName}</span>
                          <p className="text-sm text-gray-600">{comment.text}</p>
                        </div>
                      </div>
                    ))  
                  ) : (
                    <p className="text-sm text-gray-600">No comments yet...</p>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => {
                    handleDelete(selectedPost.id); // Call the delete function
                    closeModal(); // Close the modal
                  }}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 w-full mb-4"
                >
                  Delete Post
                </button>
                <button
                  onClick={closeModal} // Close modal when "Close" button is clicked
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
