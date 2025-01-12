/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";

const VideoChat = ({ onClose, socket, selectedUser }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoDisabled, setVideoDisabled] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const config = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  useEffect(() => {
    const initializePeerConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
  
        localVideoRef.current.srcObject = stream;
        setPermissionsGranted(true);
  
        peerConnection.current = new RTCPeerConnection(config);
  
        stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));
  
        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };
  
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { candidate: event.candidate, to: selectedUser._id });
          }
        };
  
        socket.on("ice-candidate", ({ candidate }) => {
          if (candidate) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });
  
        // Handle offer/answer logic
        socket.on("offer", async ({ sdp }) => {
          console.log("Received offer:", sdp);
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit("answer", { sdp: answer, to: selectedUser._id });
        });
  
        socket.on("answer", ({ sdp }) => {
          peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
        });
      } catch (error) {
        console.error("Error initializing peer connection:", error);
      }
    };
  
    initializePeerConnection();
  
    return () => {
      peerConnection.current?.close();
    };
  }, [socket, selectedUser]);  

  const toggleMute = () => {
    const localStream = localVideoRef.current.srcObject;
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const localStream = localVideoRef.current.srcObject;
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoDisabled(!videoTrack.enabled);
    }
  };

  const handleEndCall = () => {
    onClose();
    peerConnection.current?.close();
  };

  return (
    <div className="fixed inset-0 z-50 w-[80%] left-[19.1rem] flex items-center justify-center bg-black bg-opacity-10">
      <div className="w-[60%] h-4/5 bg-gray-700 text-white flex flex-col rounded-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center">
            <img
              src={selectedUser?.profilePhoto || "https://via.placeholder.com/40"}
              alt="User"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium">{selectedUser?.name || "User"}</p>
              <p className="text-sm text-gray-400">
                {permissionsGranted ? "Connected" : "Requesting Permissions..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-lg"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <video ref={remoteVideoRef} autoPlay className="w-full h-full" />
          </div>
          {/* Small User Preview */}
          <div className="absolute bottom-5 right-5 w-24 h-32 bg-gray-600 rounded-lg overflow-hidden">
            <video ref={localVideoRef} autoPlay muted className="w-full h-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center space-x-6 rounded-b-lg bg-gray-800 p-4">
          <button
            onClick={handleEndCall}
            className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700"
          >
            <i className="fas fa-phone-slash"></i>
          </button>
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
              isMuted ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <i className={isMuted ? "fas fa-microphone-slash" : "fas fa-microphone"}></i>
          </button>
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
              videoDisabled ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <i className={videoDisabled ? "fas fa-video-slash" : "fas fa-video"}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
