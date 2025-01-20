/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import profilePhoto from '../images/Screenshot 2024-05-08 221135.png';
import { setSelectedUser, setUnreadMessages, setMessages } from '../utils/chatSlice';
import ChatHeader from './ChatHeader';
import ChatFooter from './ChatFooter';
import ChatArea from './ChatArea';
import { supabase } from '../utils/supaBase';
import { useParams } from 'react-router-dom';
import io from "socket.io-client";

const Chat = () => {
    const [following, setFollowing] = useState([]);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showChat, setShowChat] = useState(false); // State to toggle chat on small screens
    const { selectedUser, unreadMessages } = useSelector((state) => state.chat);
    const dispatch = useDispatch();
    const { id } = useParams();
    const currentUserId = id;

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
        if (selectedUser) fetchUnreadCounts();
    }, [selectedUser]);

    const fetchUnreadCounts = async () => {
        try {
            const { data, error } = await supabase.rpc("fetch_unread_counts");

            if (error) {
                console.error("Error fetching unread counts:", error.message);
                return;
            }

            const counts = data.reduce((acc, item) => {
                if (item.receiver_id === currentUserId) {
                    acc[item.sender_id] = item.count;
                }
                return acc;
            }, {});

            dispatch(setUnreadMessages(counts));
        } catch (err) {
            console.error("Error fetching unread counts:", err.message);
        }
    };

    useEffect(() => {
        const socket = io("http://localhost:5000");

        socket.on("user-status", (data) => {
            setFollowing((prevFollowing) =>
                prevFollowing.map((user) =>
                    user._id === data.userId
                        ? { ...user, online: data.status === "online" }
                        : user
                )
            );
        });

        socket.emit("user-login", currentUserId);

        return () => {
            socket.emit("user-logout", currentUserId);
            socket.off("user-status");
            socket.disconnect();
        };
    }, [currentUserId]);

    const handleSelectUser = async (user) => {
        try {
            dispatch(setSelectedUser(user));
            setShowChat(true); // Show chat on small screens when a user is selected

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(`sender_id.eq.${user._id},receiver_id.eq.${user._id}`)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error.message);
                return;
            }

            dispatch(setMessages(data || []));

            const unreadMessages = data?.filter(
                (msg) => msg.receiver_id === currentUserId && !msg.is_read
            );

            if (unreadMessages?.length > 0) {
                const idsToUpdate = unreadMessages.map((msg) => msg.id);
                const { error: updateError } = await supabase
                    .from("messages")
                    .update({ is_read: true })
                    .in("id", idsToUpdate);

                if (updateError) {
                    console.error("Error updating unread messages:", updateError.message);
                }

                await fetchUnreadCounts();
            }

        } catch (err) {
            console.error("Error selecting user:", err.message);
        }
    };

    useEffect(() => {
        const messageListener = supabase
            .channel('messages')
            .on('postgres_changes', { event: 'INSERT', table: 'messages' }, (payload) => {
                const newMessage = payload.new;

                if (newMessage.receiver_id === currentUserId) {
                    fetchUnreadCounts();
                }
            })
            .subscribe();

        return () => {
            messageListener.unsubscribe();
        };
    }, []);

    return (
        <div className="h-full w-full flex items-start">
            {/* Chat List (Visible only when `showChat` is false on small screens) */}
            <div className={`min-h-screen bg-white w-full md:w-[30%] border-r ${showChat ? "hidden md:block" : "block"}`}>
                <div className="flex items-center justify-between p-4 text-red-600 font-bold border-b">
                    <span className="text-3xl">Chats</span>
                </div>
                <div className="overflow-y-auto scroll-bar h-[calc(100%-4rem)]">
                    {following.map((user) => (
                        <div
                            key={user._id}
                            className={`cursor-pointer p-3 flex md:w-96 items-center border-b hover:bg-gray-100 ${selectedUser?._id === user._id ? "bg-gray-200" : ""}`}
                            onClick={() => handleSelectUser(user)}
                        >
                            <img
                                src={user.profilePhoto || profilePhoto}
                                alt="Profile"
                                className="w-12 h-12 object-contain rounded-full mr-3"
                            />
                            <div className={`w-3 h-3 absolute ml-9 mt-7 rounded-full ${user.online ? "bg-green-500" : "hidden"}`}></div>
                            <div className="flex space-x-1">
                                <p className="font-medium text-lg">{user.name}</p>
                                {unreadMessages[user._id] > 0 && (
                                    <div className='w-5 h-5 mt-1 rounded-full flex items-center text-center justify-center bg-red-600'>
                                        <span className="text-xs text-white rounded-full">
                                            {unreadMessages[user._id]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window (Visible only when `showChat` is true on small screens) */}
            {selectedUser ? (
                <div className={`w-full md:flex-1 ${showChat ? "block" : "hidden md:block"}`}>
                    <div className="flex-1 min-h-screen max-h-screen flex flex-col">
                        <ChatHeader  backList={setShowChat}/>
                        <ChatArea />
                        <ChatFooter />
                    </div>
                </div>
            ) : <div className='md:block hidden'> <div className="bg-gray-50 flex w-[950px] text-center justify-center items-center h-screen">
                <div className="bg-white shadow-lg rounded-lg p-6 w-80">
                    <div className="flex items-center ml-16 justify-between  mb-4">
                        <h2 className="text-xl font-semibold text-red-600"><i className="fa-regular p-2 fa-message text-red-600 mt-2 "></i>Start a Chat</h2>
                    </div>
                    <p className="text-gray-500 mb-4 text-sm">Select a user from the list to start chatting:</p>
                </div>
            </div> </div>}
        </div>
    );
};

export default Chat;
