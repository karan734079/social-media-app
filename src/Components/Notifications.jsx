// Notifications.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/notifications`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setNotifications(response.data);
                setUnreadCount(response.data.filter((n) => !n.isRead).length);
            } catch (err) {
                console.error("Error fetching notifications", err.message);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}api/auth/notifications/${id}/read`, null, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking notification as read", err.message);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}api/auth/notifications/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error deleting notification", err.message);
        }
    };

    return (
        <div className="w-[500px] mx-auto py-6 px-4 overflow-y-auto h-screen scroll-bar">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Notifications ({unreadCount})</h2>
            <ul>
                {notifications.map((notification) => (
                    <li
                        key={notification._id}
                        className={`mb-4 p-4 rounded-lg shadow-md relative ${notification.isRead ? "bg-gray-100" : "bg-red-50 border-l-4 border-red-600"
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                {notification.type === "follow" ? (
                                    <p className="text-sm flex text-gray-800">
                                        <span><img src={notification.fromUser.profilePhoto} alt="" className="h-7 w-7 rounded-full mr-2" /></span>
                                        <span className="font-bold mr-2">{notification.fromUser.username}</span> started following you.
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-800 flex">
                                        <span><img src={notification.fromUser.profilePhoto} alt="" className="h-7 w-7 rounded-full mr-2" /></span>
                                        <span className="font-bold mr-2">{notification.fromUser.username}</span> posted a new{" "}
                                        {notification.post && notification.post.mediaType ? notification.post.mediaType : "content"}.
                                    </p>
                                )}
                            </div>

                            <div className="space-x-3 ml-2 mb-2 flex">
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="bg-red-600 text-white py-1 px-3 rounded-full text-sm hover:bg-red-700"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification._id)}
                                    className="text-red-600 text-sm hover:text-red-700 transition-transform transform hover:scale-105"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Time in top-right corner */}
                        <div className="absolute bottom-[1px] right-1 text-xs text-gray-500 px-2 py-1 rounded-full">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
