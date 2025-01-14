/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import VideoChat from "./VideoChat";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

const ChatHeader = () => {
  const { selectedUser } = useSelector((state) => state.chat); // Get the selected user from Redux state
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [callStatus, setCallStatus] = useState(""); // Tracks call-related messages
  const [callerInfo, setCallerInfo] = useState({}); // Stores info about incoming calls
  const { id } = useParams();
  const currentUserId = id;

  const startCall = () => {
    if (!selectedUser || !selectedUser._id) {
      console.warn("No user selected or invalid user data.");
      setCallStatus("No user selected or invalid user.");
      return;
    }

    console.log("Starting call with:", selectedUser);
    setCallStatus("Calling...");
    socket.emit("start-call", {
      from: currentUserId, // Current user ID
      to: selectedUser._id, // Target user ID
      callerName: "Your Name Here", // Replace with the current user's name
      callerSocketId: socket.id, // Caller's socket ID
    }
    ); 
    console.log("caller socket id = ", socket.id);
  };



  const acceptCall = () => {
    if (callerInfo?.callerSocketId) {
      console.log("Accepting call from:", callerInfo);
      socket.emit("accept-call", { callerSocketId: callerInfo.callerSocketId });
      setShowVideoChat(true);
      setCallerInfo({}); // Clear caller info after accepting
    }
  };

  const declineCall = () => {
    if (callerInfo?.callerSocketId) {
      console.log("Declining call from:", callerInfo);
      socket.emit("decline-call", { callerSocketId: callerInfo.callerSocketId });
      setCallerInfo({}); // Clear caller info after declining
    }
  };

  useEffect(() => {
    socket.on("incoming-call", ({ from, callerSocketId, callerName }) => {
      console.log("Incoming call received:", { from, callerSocketId, callerName });
      setCallerInfo({ from, callerSocketId, callerName });
    });

    return () => {
      socket.off("incoming-call");
    };
  }, [])

  useEffect(() => {
    socket.on("call-status", ({ status }) => {
      console.log("Call status update:", status);
      setCallStatus(status);
    });

    socket.on("call-accepted", () => {
      console.log("Call accepted. Starting video chat...");
      setShowVideoChat(true);
      setCallStatus("");
    });

    socket.on("call-declined", () => {
      console.log("Call declined by recipient.");
      setCallStatus("Call declined.");
    });

    return () => {
      socket.off("call-status");
      socket.off("call-accepted");
      socket.off("call-declined");
    };
  }, [selectedUser]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });
    socket.emit("user-login", currentUserId);

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between p-2 bg-red-600 text-white">
        <div className="flex items-center">
          <img
            src={selectedUser?.profilePhoto || "/default-profile.png"}
            alt="User"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p>{selectedUser?.name || "No user selected"}</p>
            <p>{selectedUser?.online ? "Online" : "Offline"}</p>
          </div>
        </div>
        <div>
          <i className="fas fa-video cursor-pointer" onClick={startCall}></i>
        </div>
      </div>

      {callStatus && <p>{callStatus}</p>}

      {/* Incoming Call Popup */}
      {callerInfo.from && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-96">
            <p className="text-center font-medium mb-4">
              {callerInfo.callerName || "Someone"} is calling you...
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={acceptCall}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={declineCall}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Chat Component */}
      {showVideoChat && (
        <VideoChat
          onClose={() => setShowVideoChat(false)}
          socket={socket}
          selectedUser={selectedUser}
        />
      )}
    </>
  );
};

export default ChatHeader;
