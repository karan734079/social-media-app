/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import SuggestedUsers from "./SuggestedUsers";
import profileIcon from "../images/Screenshot_2024-12-02_111230-removebg-preview.png";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "../utils/supaBase";
import { debounce } from "lodash";

const Reels = () => {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false); // Track if the user interacted
  const videoRefs = useRef([]);

  // Fetch profile data (user info)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}api/auth/profile`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setCurrentUserId(response.data._id);
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      }
    };

    fetchProfile();
  }, []);

  // Fetch posts data (video posts)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: posts, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const filteredPosts = posts.filter(
          (post) => post.media_type === "video"
        );

        setPosts(filteredPosts);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    if (currentUserId) fetchPosts();
  }, [currentUserId]);

  // Intersection Observer for playing videos when they come into view
  const playVideoInView = () => {
    const observer = new IntersectionObserver(
      debounce((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && userInteracted) {
            if (video.paused) video.play();
          } else {
            if (!video.paused) video.pause();
          }
        });
      }, 100), // Debounced to avoid rapid triggering
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((video) => observer.observe(video));

    return () => observer.disconnect();
  };

  // Handle like functionality
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

  useEffect(() => {
    playVideoInView();
  }, [posts, userInteracted]); // Re-run when posts or user interaction changes

  // Listen for user interaction on the page
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true); // Mark user as having interacted
    };

    window.addEventListener("click", handleUserInteraction); // Trigger on click
    window.addEventListener("scroll", handleUserInteraction); // Trigger on scroll

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
    };
  }, []);

  return (
    <div className="flex">
      <div
        className="reels-container scroll-bar"
        style={{ height: "100vh", overflowY: "scroll"  }}
      >
        <p className="text-3xl text-red-600 font-bold md:block hidden my-3">Reels</p>
        {/* Reels Videos Section */}
        <div
          className="reels-videos"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {posts.map((post, index) => (
            <div
              className="reel-item relative w-[95%] mt-2 m-auto md:w-[500px] h-screen mb-6"
              key={post.id}
            >
              <div className="flex justify-between p-3 absolute top-0 left-0 w-full z-10">
                <div className="flex items-center">
                  <img
                    src={post.profilePhoto || profileIcon}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-contain mr-3 ring-2 ring-gray-300"
                  />
                  <span className="self-center text-lg font-semibold">
                    {post.profileName || "Unknown User"}
                  </span>
                </div>
              </div>

              {/* Video component */}
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                controls
                autoPlay
                muted
                src={post.media_url}
                className="w-full h-full object-cover rounded-lg"
                onEnded={() => {
                  if (index < posts.length - 1) {
                    videoRefs.current[index + 1]?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }
                }}
              />

              {/* Overlay Controls */}
              <div className="absolute bottom-8 left-4 text-white w-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-6">
                    <button
                      className={`flex items-center ${
                        post.isLiked ? "text-blue-500" : "text-white"
                      }`}
                      onClick={() => handleLike(post._id, post.isLiked)}
                    >
                      <i className="fa-solid fa-thumbs-up text-2xl"></i>
                      <span className="ml-2 text-lg">{post.likes}</span>
                    </button>
                  </div>
                  <span className="text-xs mr-7">
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {post.caption && <div className="text-sm">{post.caption}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Users Section */}
      <div className="px-4 md:block hidden mt-20">
        <SuggestedUsers />
      </div>
    </div>
  );
};

export default Reels;
