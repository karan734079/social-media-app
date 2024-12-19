import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import profilePhoto from "../images/Screenshot 2024-05-08 221135.png";
import axios from "axios";

const Chat = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        { text: "Hi! How can I help you today?", isSender: false },
        { text: "Hello! I have a question about your services.", isSender: true },
        { text: "Sure, feel free to ask!", isSender: false },
        { text: "What are your pricing plans?", isSender: true },
        { text: "Hi! How can I help you today?", isSender: false },
        { text: "Hi! How can I help you today?", isSender: false },
        { text: "Hello! I have a question about your services.", isSender: true },
        { text: "Sure, feel free to ask!", isSender: false },
        { text: "What are your pricing plans?", isSender: true },
        { text: "Hi! How can I help you today?", isSender: false },
        { text: "Hi! How can I help you today?", isSender: false },
        { text: "Hello! I have a question about your services.", isSender: true },
        { text: "Sure, feel free to ask!", isSender: false },
        { text: "What are your pricing plans?", isSender: true },
        { text: "Hi! How can I help you today?", isSender: false },
        { text: "Hi! How can I help you today?", isSender: false },
        { text: "Hello! I have a question about your services.", isSender: true },
        { text: "Sure, feel free to ask!", isSender: false },
        { text: "What are your pricing plans?", isSender: true },
        { text: "Hi! How can I help you today?", isSender: false },
    ]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [addUser, setAddUser] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isNotFound, setIsNotFound] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };
    const handleSendMessage = () => {
        setMessages((prev) => [
            ...prev,
            { text: message, isSender: true },
        ]);
        setMessage("");  // Clear the input field after sending the message
    };

    const closeModal = () => {
        setAddUser(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            setIsNotFound(false);
            return;
        }

        const handleSearch = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/users/search?query=${debouncedQuery}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (response.data.length === 0) {
                    setSearchResults([]);
                    setIsNotFound(true);
                } else {
                    setSearchResults(response.data);
                    setIsNotFound(false);
                }
            } catch (err) {
                console.error('Search error:', err.message);
                setSearchResults([]);
                setIsNotFound(true);
            }
        };

        handleSearch();
    }, [debouncedQuery]);

    const viewUserProfile = (userId) => {
        const user = searchResults.find((user) => user._id === userId);
        setSelectedUser(user);
    };

    const handleAddUser = () => {
        if (selectedUser && !selectedUsers.some((user) => user._id === selectedUser._id)) {
            setSelectedUsers((prev) => [...prev, selectedUser]);
            setSelectedUser(null);
        }
        setAddUser(false);
    };

    return (
        <div className="h-full w-[100%] flex items-start">
            <div className="min-h-screen bg-white w-[30%] border-r-[1px]">
                <div className="flex items-center justify-between p-[1.08rem] text-red-600 font-bold border-b">
                    <span className="text-2xl">Chats</span>
                    <button
                        className="text-red-600 hover:text-red-800 mx-3"
                        onClick={() => setAddUser((prev) => !prev)}
                    >
                        <i className={"fas fa-plus text-lg"}></i>
                    </button>
                </div>

                {addUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <div className="flex justify-between items-center">
                                <span className="text-xl text-red-600 font-bold">Add User</span>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={closeModal}
                                >
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>
                            <div className="flex w-full max-w-lg mt-4 border rounded-full shadow focus:outline-none">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for a user..."
                                    className="w-full max-w-lg rounded-full focus:outline-none p-3"
                                />
                                <i className="fa-solid fa-search text-red-600 m-4 mt-4 cursor-pointer"></i>
                            </div>
                            {query.trim() && (
                                <div className="left-0 right-0 mt-2 w-full max-w-lg bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
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
                                            <div className="p-4 text-center text-gray-600">
                                                User not found
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                            <div className="user mt-4">
                                <button
                                    className="mt-2 w-full p-2 bg-red-600 text-white rounded"
                                    onClick={handleAddUser}
                                >
                                    Add User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-y-auto h-[calc(100%-4rem)] scroll-bar border-b-[1px]">
                    {selectedUsers.map((user) => (
                        <div
                            key={user._id}
                            className="text-black cursor-pointer p-3 flex items-center hover:bg-gray-200"
                            onClick={() => setSelectedUser(user)}
                        >
                            <div>
                                <img
                                    src={user.profilePhoto}
                                    alt=""
                                    className="w-10 h-10 object-contain rounded-full bg-white mr-3 ring-1 ring-gray-100"
                                />
                            </div>
                            <div>
                                <p className="font-medium text-black">{user.name}</p>
                                <p className="text-sm text-gray-500">
                                    {messages[messages.length - 1]?.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-h-screen min-h-screen flex flex-col">
                <div className="flex items-center justify-between p-[0.7rem] bg-red-600 text-white border-b border-red-700">
                    <div className="flex items-center">
                        <div>
                            <img
                                src={selectedUser ? selectedUser.profilePhoto : profilePhoto}
                                alt="User"
                                className="w-10 h-10 rounded-full object-contain bg-white mr-3"
                            />
                        </div>
                        <div>
                            <p className="font-medium">{selectedUser ? selectedUser.name : "Me"}</p>
                            <p className="text-sm text-gray-200">{selectedUser ? "Active" : "Select a user"}</p>
                        </div>
                    </div>
                    <div className="flex space-x-7 text-gray-200 mr-2">
                        <i className="fas fa-video cursor-pointer hover:text-white"></i>
                        <i className="fas fa-phone cursor-pointer hover:text-white"></i>
                        <i className="fas fa-search cursor-pointer hover:text-white"></i>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto scroll-bar bg-white text-black ">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex  mb-4 ${msg.isSender ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`p-2 rounded-lg max-w-xs ${msg.isSender
                                    ? "bg-red-200 text-black"
                                    : "bg-gray-300 text-black"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={endRef}></div>
                </div>


                <form
                    className="p-4 bg-red-600 space-x-3 flex items-center border-t border-gray-300 relative"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                >
                    <label
                        htmlFor="file"
                        className="ml-3 text-gray-200 hover:text-white cursor-pointer"
                    >
                        <i className="fa-solid fa-image text-2xl"></i>
                    </label>
                    <input type="file" id="file" className="hidden" />

                    <div className="ml-3 text-gray-200 hover:text-white cursor-pointer relative">
                        <i
                            className="fa-solid fa-face-smile text-2xl"
                            onClick={() => setShowEmojiPicker((prev) => !prev)}
                        ></i>
                        {showEmojiPicker && (
                            <div className="absolute bottom-[3.5rem] left-0 z-50">
                                <EmojiPicker onEmojiClick={onEmojiClick} />
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        className="p-2 w-[45rem] bg-white text-black rounded-lg outline-none border border-gray-300"
                    />

                    <button
                        type="submit" // Make the button a submit button
                        className="ml-3 text-gray-200 hover:text-white"
                    >
                        <i className="fas fa-paper-plane text-2xl"></i>
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Chat;
