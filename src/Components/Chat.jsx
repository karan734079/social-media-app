import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import profilePhoto from '../images/Screenshot 2024-05-08 221135.png';
import axios from 'axios';
import {
    // setMessages,
    addMessage,
    setSelectedUsers,
    toggleAddUserModal,
    setQuery,
    setSearchResults,
    setIsNotFound,
    setSelectedUser,
} from '../utils/chatSlice';

const Chat = () => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const dispatch = useDispatch();
    const {
        messages,
        addUserModal,
        query,
        searchResults,
        isNotFound,
        selectedUsers,
        selectedUser,
    } = useSelector((state) => state.chat);

    const [message, setMessage] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const onEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            dispatch(addMessage({ text: message, isSender: true }));
            setMessage('');
        }
    };

    const closeModal = () => {
        dispatch(toggleAddUserModal());
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            dispatch(setSearchResults([]));
            dispatch(setIsNotFound(false));
            return;
        }

        const handleSearch = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}api/auth/users/search?query=${debouncedQuery}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

    const viewUserProfile = (userId) => {
        const user = searchResults.find((user) => user._id === userId);
        dispatch(setSelectedUser(user));
    };

    const handleAddUser = () => {
        if (selectedUser && !selectedUsers.some((user) => user._id === selectedUser._id)) {
            dispatch(setSelectedUsers([...selectedUsers, selectedUser]));
            dispatch(setSelectedUser(null));
        }
        dispatch(toggleAddUserModal());
    };

    return (
        <div className="h-full w-full flex items-start">
            {/* Left Sidebar */}
            <div className="min-h-screen bg-white w-1/3 border-r">
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
                                                    src={user.profilePhoto}
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

                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                    {selectedUsers.map((user) => (
                        <div
                            key={user._id}
                            className="cursor-pointer p-3 flex items-center border-b hover:bg-gray-200"
                            onClick={() => dispatch(setSelectedUser(user))}
                        >
                            <img
                                src={user.profilePhoto}
                                alt=""
                                className="w-10 h-10 object-contain rounded-full mr-3"
                            />
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">{messages[messages.length - 1]?.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-screen max-h-screen flex flex-col">
                <div className="flex items-center justify-between p-[10px] bg-red-600 text-white border-b">
                    <div className="flex items-center">
                        <img
                            src={selectedUser ? selectedUser.profilePhoto : profilePhoto}
                            alt="User"
                            className="w-10 h-10 object-contain bg-white rounded-full mr-3"
                        />
                        <div>
                            <p className="font-medium">{selectedUser ? selectedUser.name : 'Me'}</p>
                            <p className="text-sm">{selectedUser ? 'Active' : 'Select a user'}</p>
                        </div>
                    </div>
                    <div className="flex space-x-7 text-gray-200 mr-2">
                        <i className="fas fa-video cursor-pointer hover:text-white"></i>
                        <i className="fas fa-phone cursor-pointer hover:text-white"></i>
                        <i className="fas fa-search cursor-pointer hover:text-white"></i>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-white">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-4 ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`p-2 rounded-lg max-w-xs ${msg.isSender ? 'bg-red-200' : 'bg-gray-300'
                                    }`}
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
