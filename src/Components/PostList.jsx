import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supaBase';

const PostsList = ({ userId }) => {
  const [posts, setPosts] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);

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


  if (!posts || posts.length === 0) {
    return <div className="text-gray-500 text-sm">No posts available.</div>;
  }

  const openModal = (post) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

  return (
    <div className="grid grid-cols-3 gap-16 p-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative group cursor-pointer w-72  h-72  bg-gray-100 shadow-md rounded-lg overflow-hidden"
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
              ❤️ {post.likes} &middot; 🗨️ {post.comments?.length || 0}
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
              <button
                onClick={closeModal} // Close modal when "Close" button is clicked
                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400 w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsList;
