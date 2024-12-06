import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Posts from './Posts';

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProfile(response.data);
        };

        fetchProfile();
    }, []);

    const fetchFollowers = async () => {
        const response = await axios.get('http://localhost:5000/api/auth/followers', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFollowers(response.data);
        setShowFollowers(true);
    };

    const fetchFollowing = async () => {
        const response = await axios.get('http://localhost:5000/api/auth/following', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFollowing(response.data);
        setShowFollowing(true);
    };

    return (
        <div>
            <div className='ml-96'>
                <img src={profile.profilePhoto} alt="Profile" className="rounded-full h-32 w-32" />
                <h2>{profile.name}</h2>
                <p>Username: {profile.username}</p>
                <p>Email: {profile.email}</p>
                <p>Address: {profile.address}</p>
                <button onClick={fetchFollowers}>Followers: {profile.followers?.length}</button>
                <button onClick={fetchFollowing}>Following: {profile.following?.length}</button>

                {showFollowers && (
                    <div >
                        <h3>Followers</h3>
                        {followers.map((follower) => (
                            <p key={follower._id}>{follower.username}</p>
                        ))}
                    </div>
                )}

                {showFollowing && (
                    <div>
                        <h3>Following</h3>
                        {following.map((follow) => (
                            <p key={follow._id}>{follow.username}</p>
                        ))}
                    </div>
                )}
            </div>
            <div className='m-5 ml-40'>
                <Posts />
            </div>
        </div>
    );
};

export default Profile;
