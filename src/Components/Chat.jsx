/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import profilePhoto from '../images/Screenshot 2024-05-08 221135.png';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
    setMessages,
    addMessage,
    setSelectedUsers,
    toggleAddUserModal,
    setQuery,
    setSearchResults,
    setIsNotFound,
    setSelectedUser,
} from '../utils/chatSlice';
import { supabase } from '../utils/supaBase';
import { useParams } from 'react-router-dom';

const Chat = () => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [following, setFollowing] = useState([]);
    const [showFollowing, setShowFollowing] = useState(false);
    const [wantToDelete, setWantToDelete] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [lastFetchMessage, setLastFetchMessage] = useState(null);
    const endRef = useRef(null);
    const chatRef = useRef(null);
    const dispatch = useDispatch();
    const { id } = useParams();
    const currentUserId = id;

    const {
        messages,
        addUserModal,
        query,
        searchResults,
        isNotFound,
        selectedUsers,
        selectedUser,
    } = useSelector((state) => state.chat);

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

    const onEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };

    const handleSendMessage = async () => {
        if (message.trim()) {
            const newMessage = {
                id: uuidv4(),
                text: message,
                isSender: true,
                sender_id: currentUserId,
                receiver_id: selectedUser?._id,
            };

            try {
                const { error } = await supabase
                    .from('messages')
                    .insert([
                        {
                            id: newMessage.id,
                            text: newMessage.text,
                            is_sender: newMessage.isSender,
                            sender_id: newMessage.sender_id,
                            receiver_id: newMessage.receiver_id,
                        },
                    ]);

                if (error) {
                    console.error('Supabase error:', error.message);
                    return;
                }

                setMessage('');
            } catch (err) {
                console.error('Error sending message:', err.message);
            }
        }
    };

    useEffect(() => {
        const channel = supabase
            .channel('messages')
            .on('postgres_changes', { event: 'INSERT', table: 'messages' }, (payload) => {
                if (
                    payload.new.receiver_id === currentUserId ||
                    payload.new.sender_id === currentUserId
                ) {
                    const incomingMessage = {
                        id: payload.new.id,
                        text: payload.new.text,
                        isSender: payload.new.sender_id === currentUserId,
                        sender_id: payload.new.sender_id,
                        receiver_id: payload.new.receiver_id,
                    };

                    dispatch(addMessage(incomingMessage));
                }
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [dispatch, currentUserId]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser, dispatch, currentUserId]);
    
    const fetchMessages = async (isPaginated = false) => {
        if (!selectedUser || (!isPaginated && loadingMore)) return;
    
        setLoadingMore(true);
    
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                .order('created_at', { ascending: false })
                .limit(20)
                .lt('created_at', lastFetchMessage || new Date().toISOString());
    
            if (error) {
                console.error('Error fetching messages:', error.message);
                setLoadingMore(false);
                return;
            }
    
            if (data.length > 0) {
                const updatedMessages = isPaginated
                    ? [...data.reverse(), ...messages]
                    : [...data.reverse()
                        .map((msg) => ({
                            ...msg,
                            isSender: msg.sender_id === currentUserId,
                        })),...messages];
    
                setLastFetchMessage(data[data.length - 1].created_at);
                dispatch(setMessages(updatedMessages));
            } else {
                setHasMoreMessages(false);
            }
        } catch (err) {
            console.error('Error fetching messagez:', err.message);
        } finally {
            setLoadingMore(false);
        }
    };
    
    useEffect(() => {
        if (endRef.current && messages.length > 0) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    

    useEffect(() => {
        const handleScroll = () => {
            if (chatRef.current.scrollTop === 0 && hasMoreMessages && !loadingMore) {
                const currentScrollHeight = chatRef.current.scrollHeight;
                fetchMessages(true).then(() => {
                    const newScrollHeight = chatRef.current.scrollHeight;
                    chatRef.current.scrollTop = newScrollHeight - currentScrollHeight;
                });
            }
        };

        const chatDiv = chatRef.current;
        if (chatDiv) {
            chatDiv.addEventListener('scroll', handleScroll);
            return () => chatDiv.removeEventListener('scroll', handleScroll);
        }
    }, [hasMoreMessages, loadingMore]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery) {
            dispatch(setSearchResults([]));
            dispatch(setIsNotFound(false));
            return;
        }

        const handleSearch = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}api/auth/users/search?query=${debouncedQuery}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );

                if (response.data.length === 0) {
                    dispatch(setSearchResults([]));
                    dispatch(setIsNotFound(true));
                } else {
                    dispatch(setSearchResults(response.data));
                    dispatch(setIsNotFound(false));
                }
            } catch (err) {
                console.error('Search error:', err.message);
                dispatch(setSearchResults([]));
                dispatch(setIsNotFound(true));
            }
        };

        handleSearch();
    }, [debouncedQuery, dispatch]);

    const closeModal = () => {
        dispatch(toggleAddUserModal());
    };

    const viewUserProfile = (userId) => {
        const user = searchResults.find((user) => user._id === userId);
        if (user) {
            dispatch(setSelectedUser(user));
        }
    };

    const handleAddUser = () => {
        if (
            selectedUser &&
            !selectedUsers.some((user) => user._id === selectedUser._id)
        ) {
            dispatch(setSelectedUsers([...selectedUsers, selectedUser]));
        }
        dispatch(toggleAddUserModal());
    };

    const handleDeleteMessage = async (messageId) => {

        try {
            await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            dispatch(setMessages(messages.filter((msg) => msg.id !== messageId)));
            setWantToDelete(null)
        } catch (err) {
            console.error('Error deleting message:', err.message);
        }
    };

    return (
        <div className="h-full w-full flex items-start">
            {/* Left Sidebar */}
            <div className="min-h-screen bg-white w-1/4 border-r ">
                <div className="flex items-center justify-between p-4 text-red-600 font-bold border-b">
                    <span className="text-2xl">Chats</span>
                    <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => dispatch(toggleAddUserModal())}
                    >
                        <i className="fas fa-plus text-lg"></i>
                    </button>
                </div>

                {addUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <div className="flex justify-between items-center">
                                <span className="text-xl text-red-600 font-bold">Add User</span>
                                <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>
                            <div className="flex w-full mt-4 border rounded-full shadow focus:outline-none">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => dispatch(setQuery(e.target.value))}
                                    placeholder="Search for a user..."
                                    className="w-full p-3 rounded-full focus:outline-none"
                                    aria-label="Search for a user"
                                />
                                <i className="fas fa-search text-red-600 m-4 cursor-pointer"></i>
                            </div>
                            {query.trim() && (
                                <div className="mt-2 w-full bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((user) => (
                                            <div
                                                key={user._id}
                                                className="cursor-pointer p-3 hover:bg-gray-200 flex items-center"
                                                onClick={() => viewUserProfile(user._id)}
                                            >
                                                <img
                                                    src={user.profilePhoto || profilePhoto}
                                                    alt={`${user.username}'s profile`}
                                                    className="w-10 h-10 object-contain rounded-full mr-4"
                                                />
                                                <div>
                                                    <h3 className="text-sm font-semibold">{user.name}</h3>
                                                    <p className="text-xs text-gray-600">@{user.username}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        isNotFound && (
                                            <div className="p-4 text-center text-gray-600">User not found</div>
                                        )
                                    )}
                                </div>
                            )}
                            <button
                                className="mt-4 w-full p-2 bg-red-600 text-white rounded"
                                onClick={handleAddUser}
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-y-auto scroll-bar h-[calc(100%-4rem)]">
                    {selectedUsers.map((user) => (
                        <div
                            key={user._id}
                            className={`cursor-pointer p-3 flex items-center border-b ${selectedUser?._id === user._id ? 'bg-gray-200' : " "}`}
                            onClick={() => dispatch(setSelectedUser(user))}
                        >
                            <img
                                src={user.profilePhoto || profilePhoto}
                                alt="Profile"
                                className="w-10 h-10 object-contain rounded-full mr-3"
                            />
                            <div>
                                <p className="font-medium">{user.name}</p>
                            </div>
                        </div>
                    ))}
                    <div>
                        {following.map((user) => (
                            <div
                                key={user._id}
                                className={`cursor-pointer p-3 flex items-center border-b ${selectedUser?._id === user._id ? 'bg-gray-200' : " "}`}
                                onClick={() => dispatch(setSelectedUser(user))}
                            >
                                <img
                                    src={user.profilePhoto || profilePhoto}
                                    alt="Profile"
                                    className="w-10 h-10 object-contain rounded-full mr-3"
                                />
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-screen max-h-screen flex flex-col">
                <div className="flex items-center justify-between p-[10px] bg-red-600 text-white border-b">
                    <div className="flex items-center">
                        <img
                            src={selectedUser?.profilePhoto || profilePhoto}
                            alt="User"
                            className="w-10 h-10 object-contain bg-white rounded-full mr-3"
                        />
                        <div>
                            <p className="font-medium">{selectedUser?.name || 'Select a user'}</p>
                            <p className="text-sm">{selectedUser ? 'Active' : 'Select a user'}</p>
                        </div>
                    </div>
                    <div className="flex space-x-7 text-gray-200 mr-2">+ 
                        <i className="fas fa-video cursor-pointer hover:text-white"></i>
                        <i className="fas fa-phone cursor-pointer hover:text-white"></i>
                        <i className="fas fa-search cursor-pointer hover:text-white"></i>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto scroll-bar bg-white" ref={chatRef}>
                    {loadingMore && (
                        <div className="text-center text-gray-600 my-4">Loading previous messages...</div>
                    )}
                    {messages
                        .filter(
                            (msg) =>
                                (msg.sender_id === currentUserId && msg.receiver_id === selectedUser?._id) ||
                                (msg.receiver_id === currentUserId && msg.sender_id === selectedUser?._id)
                        )
                        .map((msg, index) => (
                            <div
                                key={index}
                                className={`relative group flex mb-4 ${msg.isSender ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* Dropdown Trigger */}
                                <div className={`absolute   hidden -my-4 mx-1 group-hover:block`}>
                                    <button
                                        className="text-gray-500 hover:text-gray-800"
                                        onClick={(e) => {
                                            setWantToDelete(msg.id);
                                        }}
                                    >
                                        {msg.isSender === true && <i className="fas fa-ellipsis-h"></i>}
                                    </button>
                                </div>

                                {/* Dropdown Menu */}
                                {wantToDelete === msg.id && msg.sender_id === currentUserId && (
                                    <div className="absolute top-0 right-0 mt-6 bg-white border border-gray-300 shadow-lg rounded-md z-10">
                                        <ul className="text-sm">
                                            <li
                                                className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-red-600"
                                                // onClick={() => {
                                                //     setEditingMessageId(msg.id);
                                                //     setEditingMessageText(msg.text);
                                                //     setWantToDelete(false);
                                                // }}
                                            >
                                                Update
                                            </li>  
                                            <li
                                                className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-red-600"
                                                onClick={() => {
                                                    handleDeleteMessage(msg.id);
                                                }}
                                            >
                                                Delete
                                            </li>
                                            <li
                                                className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setWantToDelete(false);
                                                }}
                                            >
                                                Cancel
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={`p-2 rounded-lg inline-block cursor-pointer ${msg.isSender ? 'bg-red-200 text-right' : 'bg-gray-300 text-left'
                                        }`}
                                    style={{
                                        maxWidth: '75%',
                                        width: 'fit-content',
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                    <div ref={endRef}></div>
                </div>
                <form
                    className="p-4 bg-red-600 flex items-center space-x-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                >
                    <label htmlFor="file" className="text-gray-200 cursor-pointer">
                        <i className="fas fa-image text-2xl"></i>
                    </label>
                    <input type="file" id="file" className="hidden" />

                    <div className="relative text-gray-200 cursor-pointer">
                        <i
                            className="fas fa-face-smile text-2xl"
                            onClick={() => setShowEmojiPicker((prev) => !prev)}
                        ></i>
                        {showEmojiPicker && (
                            <div className="absolute bottom-12 left-0 z-50">
                                <EmojiPicker onEmojiClick={onEmojiClick} />
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        className="p-2 w-full bg-white rounded-lg outline-none border border-gray-300"
                    />

                    <button type="submit" className="text-gray-200">
                        <i className="fas fa-paper-plane text-2xl"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
