/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import profilePhoto from '../images/Screenshot 2024-05-08 221135.png';
import { setSelectedUser} from '../utils/chatSlice';

const ChatSidebar = () => {
    const [following, setFollowing] = useState([]);
    const [showFollowing, setShowFollowing] = useState(false);
    const { selectedUser, selectedUsers } = useSelector((state) => state.chat);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchFollowing();
    }, []);

    const fetchFollowing = async () => {
        if (showFollowing) {
            setShowFollowing(false);
        } else {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/following`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFollowing(response.data);
            setShowFollowing(true);
        }
    };

    useEffect(() => {
        if (selectedUsers.length > 0) {
            dispatch(setSelectedUser(selectedUsers[0]));
        } else if (following.length > 0) {
            dispatch(setSelectedUser(following[0]));
        }
    }, [dispatch, selectedUsers, following]);

    return (
        <div className="min-h-screen bg-white w-1/4 border-r ">
            <div className="flex items-center justify-between p-4 text-red-600 font-bold border-b">
                <span className="text-3xl">Chats</span>
            </div>
            <div className="overflow-y-auto scroll-bar h-[calc(100%-4rem)]">
                {following.map((user) => (
                    <div
                        key={user._id}
                        className={`cursor-pointer p-3 flex items-center border-b hover:bg-gray-100 ${selectedUser?._id === user._id ? 'bg-gray-200' : " "}`}
                        onClick={() => dispatch(setSelectedUser(user))}
                    >
                        <img
                            src={user.profilePhoto || profilePhoto}
                            alt="Profile"
                            className="w-12 h-12 object-contain rounded-full mr-3"
                        />
                        <div>
                            <p className="font-medium text-lg">{user.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChatSidebar
