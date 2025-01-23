import React, { useState, useEffect } from "react";
import axios from "axios";
import Posts from "./Posts";
import { supabase } from "../utils/supaBase";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showChangePhoto, setShowChangePhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [posts,setPosts] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfile(response.data);
      setUserId(response.data._id);
    };
    fetchProfile();
  }, []);

  const fetchFollowers = async () => {
    if (showFollowers) {
      setShowFollowers(false);
    } else {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/followers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFollowers(response.data);
      setShowFollowers(true);  
    }
  };

  const fetchFollowing = async () => {
    if (showFollowing) {
      setShowFollowing(false);
    } else {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/following`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFollowing(response.data);
      setShowFollowing(true);
    }
  };

  useEffect(() => {
      const fetchPosts = async () => {
        try {
          const { data: posts, error } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false });
    
          if (error) throw error;
    
          // Assuming currentUserId is the ID of the logged-in user
          const filteredPosts = posts.filter((post) => post.user_id === userId);
    
          setPosts(filteredPosts);
        } catch (err) {
          console.error("Error fetching posts:", err.message);
        }
      };
    
     if(userId) fetchPosts(); // Ensure currentUserId is available before fetching posts
    }, [userId]);

  const handleChangePhotoClick = () => {
    setShowChangePhoto(true);
  };

  const handlePhotoChange = (event) => {
    setNewPhoto(event.target.files[0]);
  };

  const handlePhotoUpload = async () => {
    const formData = new FormData();

    formData.append("profilePhoto", newPhoto);
    formData.append("name", profile.name);
    formData.append("address", profile.address);

    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}api/auth/profile`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile({ ...profile, profilePhoto: response.data.user.profilePhoto });
      setShowChangePhoto(false);
      setNewPhoto("");
    } catch (error) {
      console.error("Error uploading photo:", error.response || error);
    }
  };

  const closeModal = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-full max-w-4xl p-4 ">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-14">
          <div className="relative">
            <img
              src={profile.profilePhoto || "https://via.placeholder.com/150"}
              alt="Profile"
              className="rounded-full h-40 w-40 object-contain border-4 border-gray-300"
            />
            <button
              onClick={handleChangePhotoClick}
              className="absolute h-8 w-8 bottom-2 flex items-center justify-center text-center right-4 bg-red-600 text-white p-2 rounded-full"
            >
              +
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
            <h2 className="text-base mt-1">@{profile.username}</h2>
            <h2 className="text-base">{profile.email}</h2>
            <h2 className="text-base">{profile.address}</h2>
            <div className="mt-4 flex space-x-8 text-lg text-gray-600">
              <div>
                <strong className="text-gray-800">{posts.length || 0}</strong> Posts
              </div>
              <button onClick={fetchFollowers} className="text-gray-600">
                <strong className="text-gray-800">{profile.followers?.length || 0}</strong> Followers
              </button>
              <button onClick={fetchFollowing} className="text-gray-600">
                <strong className="text-gray-800">{profile.following?.length || 0}</strong> Following
              </button>
            </div>
          </div>
        </div>

        {showChangePhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white  rounded-lg shadow-lg md:w-1/3 p-6 relative">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-red-600">Change Profile Photo</h2>
                <button
                  onClick={() => setShowChangePhoto(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl absolute top-4 right-4"
                >
                  &times;
                </button>
              </div>

              {/* Upload Section */}
              <div className="mt-4">
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Select a new profile photo:
                </label>
                <input
                  type="file"
                  onChange={handlePhotoChange}
                  className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Preview */}
              {newPhoto && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={URL.createObjectURL(newPhoto)}
                    alt="Preview"
                    className="h-32 w-32 object-contain rounded-full border-2 border-red-600"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {setShowChangePhoto(false)
                    setNewPhoto("");
                  }
                  }
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePhotoUpload}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition duration-200"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {showFollowers && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-40">
            <div className="bg-white rounded-lg md:w-1/3 w-full m-5 overflow-y-auto scroll-bar max-h-96 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Followers</h3>
              <ul>
                {followers.map((follower) => (
                  <li key={follower._id} className="flex items-center mb-4">
                    <img
                      src={follower.profilePhoto || "https://via.placeholder.com/40"}
                      alt={follower.username}
                      className="h-10 w-10 rounded-full mr-4 object-contain"
                    />
                    <p className="text-gray-700">{follower.username}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={closeModal}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showFollowing && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-40">
            <div className="bg-white rounded-lg md:w-1/3 w-full m-5 overflow-y-auto scroll-bar max-h-96 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Following</h3>
              <ul>
                {following.map((follow) => (
                  <li key={follow._id} className="flex items-center mb-4">
                    <img
                      src={follow.profilePhoto || "https://via.placeholder.com/40"}
                      alt={follow.username}
                      className="h-10 w-10 rounded-full mr-4 object-contain"
                    />
                    <p className="text-gray-700">{follow.name}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={closeModal}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 w-full max-w-4xl border-t">
        <Posts />
      </div>
    </div>
  );
};

export default Profile;


