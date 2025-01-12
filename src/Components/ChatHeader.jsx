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
  const [callerInfo, setCallerInfo] = useState(null);// Stores info about incoming calls
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
    });
  };


  const acceptCall = () => {
    if (callerInfo?.callerSocketId) {
      console.log("Accepting call from:", callerInfo);
      socket.emit("accept-call", { callerSocketId: callerInfo.callerSocketId });
      setShowVideoChat(true);
      setCallerInfo(null); // Clear caller info after accepting
    }
  };

  const declineCall = () => {
    if (callerInfo?.callerSocketId) {
      console.log("Declining call from:", callerInfo);
      socket.emit("decline-call", { callerSocketId: callerInfo.callerSocketId });
      setCallerInfo(null); // Clear caller info after declining
    }
  };

  useEffect(() => {
    socket.on("incoming-call", ({ from, callerSocketId, callerName }) => {
      console.log("Incoming call received:", { from, callerSocketId, callerName });
      setCallerInfo({ from, callerSocketId, callerName });
    });


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
      socket.off("incoming-call");
      socket.off("call-status");
      socket.off("call-accepted");
      socket.off("call-declined");
    };
  }, [selectedUser]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Recipient connected to socket with ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Recipient disconnected from socket.");
    });
  }, []);


  useEffect(() => {
    console.log("Listening for 'incoming-call' events...");
    socket.on("incoming-call", (data) => {
      console.log("Incoming call event received:", data);
      setCallerInfo({ ...data }); // Update state to trigger popup
    });

    return () => {
      socket.off("incoming-call");
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
      {callerInfo && (
        <div className="popup">
          <p>{callerInfo.callerName} is calling you...</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={declineCall}>Decline</button>
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
