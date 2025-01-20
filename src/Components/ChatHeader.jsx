import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import VideoChat from "./VideoChat";
import AudioChat from "./AudioChat";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

const ChatHeader = ({ backList }) => {
  const { selectedUser } = useSelector((state) => state.chat); // Get selected user from Redux
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [showAudioChat, setShowAudioChat] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [callerInfo, setCallerInfo] = useState({});
  const { id } = useParams();
  const { profileName } = useParams();
  const currentUserId = id;

  const startCall = (type) => {
    if (!selectedUser || !selectedUser._id) {
      console.warn("No user selected or invalid user data.");
      setCallStatus("No user selected or invalid user.");
      return;
    }

    console.log(`Starting ${type} call with:`, selectedUser);
    setCallStatus(`Calling ${type}...`);
    socket.emit("start-call", {
      from: currentUserId,
      to: selectedUser._id,
      callerName: profileName, // Replace with current user's name
      callerSocketId: socket.id,
      callType: type, // Specify the call type
    });
  };

  const acceptCall = (type) => {
    if (callerInfo?.callerSocketId) {
      console.log(`Accepting ${type} call from:`, callerInfo);
      socket.emit("accept-call", {
        callerSocketId: callerInfo.callerSocketId,
        callType: type,
      });

      if (type === "audio") setShowAudioChat(true);
      else setShowVideoChat(true);

      setCallerInfo({});
    }
  };

  const declineCall = () => {
    if (callerInfo?.callerSocketId) {
      console.log("Declining call from:", callerInfo);
      socket.emit("decline-call", { callerSocketId: callerInfo.callerSocketId });
      setCallerInfo({});
    }
  };

  useEffect(() => {
    socket.on("incoming-call", ({ from, callerSocketId, callerName, callType }) => {
      console.log("Incoming call received:", { from, callerSocketId, callerName, callType });
      setCallerInfo({ from, callerSocketId, callerName, callType });
    });

    return () => socket.off("incoming-call");
  }, []);

  useEffect(() => {
    socket.on("call-status", ({ status }) => {
      console.log("Call status:", status);
      setCallStatus(status);
    });

    socket.on("call-accepted", ({ callType }) => {
      console.log(`Call accepted. Starting ${callType} chat.`);
      setCallStatus("");
      if (callType === "audio") setShowAudioChat(true);
      else setShowVideoChat(true);
    });

    socket.on("call-declined", () => {
      console.log("Call declined.");
      setCallStatus("Call declined.");
    });

    return () => {
      socket.off("call-status");
      socket.off("call-accepted");
      socket.off("call-declined");
    };
  }, [selectedUser]);

  useEffect(() => {
    socket.emit("user-login", currentUserId);

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [currentUserId]);

  return (
    <>
      <div className="flex items-center justify-between p-2 bg-red-600 text-white">

        <div className="flex items-center">
          <button onClick={() => backList(false)} className="">
            <i class="fa-solid fa-arrow-left mr-2 opacity-80"></i>
          </button>
          <img
            src={selectedUser?.profilePhoto || "/default-profile.png"}
            alt="User"
            className="w-12 h-12 rounded-full object-contain bg-white"
          />
          <div className="ml-2">
            <p>{selectedUser?.name || "No user selected"}</p>
            <p>{selectedUser?.online ? "Online" : "Offline"}</p>
          </div>
        </div>
        <div className="space-x-3">
          <i
            className="fas fa-video cursor-pointer"
            onClick={() => startCall("video")}
          ></i>
          <i
            className="fas fa-phone cursor-pointer"
            onClick={() => startCall("audio")}
          ></i>
          <i
            className="fas fa-search cursor-pointer"
          ></i>
        </div>
      </div>

      {callStatus && <p className="text-center mt-2">{callStatus}</p>}

      {/* Incoming Call Popup */}

      <div className="relative z-50 flex justify-end">
        {callerInfo.from && <div className={`rounded-xl m-5   shadow-lg absolute w-1/3 transition-transform duration-1000 ease-in-out`}>
          <div className="bg-white w-full px-2 py-2 rounded-xl">
            <p className="text-center font-medium mb-4">
              {callerInfo.callerName || "Someone"} is calling you...
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => acceptCall(callerInfo.callType)}
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
        </div>}
      </div>


      {/* Video Chat Component */}
      {showVideoChat && (
        <VideoChat
          onClose={() => setShowVideoChat(false)}
          socket={socket}
          selectedUser={selectedUser}
          callType="video"
        />
      )}

      {/* Audio Chat Component */}
      {showAudioChat && (
        <AudioChat
          onClose={() => setShowAudioChat(false)}
          socket={socket}
          selectedUser={selectedUser}
          callType="audio"
        />
      )}
    </>
  );
};

export default ChatHeader;
