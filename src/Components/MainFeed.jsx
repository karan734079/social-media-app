import React, { useEffect, useState } from "react";
import axios from "axios";
import SuggestedUsers from "./SuggestedUsers";
import profileIcon from "../images/Screenshot_2024-12-02_111230-removebg-preview.png";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "../utils/supaBase";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

const MainFeed = () => {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();
  // const [showLikedUsersModal, setShowLikedUsersModal] = useState(false);
  // const [likedUsers, setLikedUsers] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCurrentUserId(response.data._id);
        setProfileName(response.data.name);
        setProfilePhoto(response.data.profilePhoto);
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch posts
        const { data: fetchedPosts, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch comments for these posts
        const postIds = fetchedPosts.map((post) => post.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .in("post_id", postIds);

        if (commentsError) throw commentsError;

        // Combine posts with comments
        const postsWithComments = fetchedPosts.map((post) => ({
          ...post,
          comments: commentsData.filter((comment) => comment.post_id === post.id),
        }));

        setPosts(postsWithComments);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    if (currentUserId) fetchPosts();
  }, [currentUserId]);

  const handleLike = async (postId, isLiked) => {
    try {
      const { error } = await supabase.rpc(isLiked ? "decrement_likes" : "increment_likes", {
        post_id: postId,
        user_id: currentUserId,
      });

      if (error) {
        console.error("Error with like operation:", error.message);
        throw error;
      }

      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !isLiked,
            }
          : post
      );

      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error liking post:", err.message);
    }
  };

  // const openLikedUsersModal = async (postId) => {
  //   try {
  //     // Fetch the list of users who liked the post
  //     const { error } = await supabase
  //       .from("post_likes")
  //       .select("user_id")
  //       .eq("post_id", postId);

  //     if (error) {
  //       console.error("Error fetching liked users:", error.message);
  //       return;
  //     }

  //     // Fetch the profile names and photos for the liked users
  

  //     // Set the liked users' profiles to show in the modal
  //     // setLikedUsers(userProfiles.filter((profile) => profile !== null));
  //     // setShowLikedUsersModal(true);
  //   } catch (err) {
  //     console.error("Error fetching liked users:", err.message);
  //   }
  // };

  // const closeLikedUsersModal = () => {
  //   setShowLikedUsersModal(false);
  //   setLikedUsers([]);
  // };

  const handleAddComment = async (postId) => {
    try {
      const { data, error } = await supabase.from("comments").insert([{
        id: uuidv4(),
        post_id: postId,
        user_id: currentUserId,
        text: newComment,
        profileName: profileName,
        profilePhoto: profilePhoto,
      }]).select();

      if (error) {
        console.error("Error adding comment:", error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.error("Comment data is null or empty");
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, data[0]] }
            : post
        )
      );

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err.message);
    }
  };

  const openCommentModal = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPost(null);
  };

  const viewUserProfile = (userId) =>{
    navigate(`/user/${userId}`);
  }

  return (
    <div className="flex">
      <div className="flex justify-center">
        <div className="w-full max-w-xl flex flex-col space-y-6 p-4">
          {posts.map((post) => (
            <div className="bg-white shadow rounded-lg p-4" key={post.id}>
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => viewUserProfile(post.user_id)}>
                <img
                  src={post.profilePhoto || profileIcon}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-contain"
                />
                <span className="font-semibold">{post.profileName || "Unknown User"}</span>
              </div>

              <div className="mt-3">
                {post.media_type === "video" ? (
                  <video controls src={post.media_url} className="w-[500px] h-auto rounded-md" />
                ) : (
                  <img
                    src={post.media_url}
                    alt="Post"
                    className="w-[500px] h-96 object-contain"
                  />
                )}
              </div>

              {post.caption && <div className="mt-2 text-gray-700">{post.caption}</div>}

              <div className="flex justify-between items-center mt-3 text-gray-600">
                <button
                  onClick={() => handleLike(post.id, post.isLiked)}
                  className={`flex items-center space-x-1 ${post.isLiked ? "text-red-500" : ""}`}
                >
                  <i className={`fa-heart ${post.isLiked ? "fas" : "far"} text-lg`}></i>
                  <span>{post.likes} likes</span>
                </button>
                <button
                  onClick={() => openCommentModal(post)}
                  className="flex items-center space-x-1"
                >
                  <i className="far fa-comment text-lg"></i>
                  <span>{post.comments ? post.comments.length : 0} comments</span>
                </button>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {/* <button onClick={() => openLikedUsersModal(post.id)} className="text-blue-500">
                  View Liked Users
                </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SuggestedUsers />
      </div>

      {showCommentModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button onClick={closeCommentModal} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-64">
              {(selectedPost.comments || []).map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img
                    src={comment.profilePhoto || profileIcon}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-contain"
                  />
                  <div>
                    <span className="font-semibold">{comment.profileName}</span>
                    <p className="text-sm text-gray-600">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={() => handleAddComment(selectedPost.id)}
                className="text-blue-500 font-semibold"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {showLikedUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Liked Users</h3>
              <button onClick={closeLikedUsersModal} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              {post.map((user) => (
                <div key={user.user_id} className="flex items-center space-x-3">
                  <img
                    src={user.profile_photo || profileIcon}
                    alt="User"
                    className="w-8 h-8 rounded-full object-contain"
                  />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MainFeed;
