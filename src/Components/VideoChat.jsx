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
    const initializeConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localVideoRef.current.srcObject = stream;
        setPermissionsGranted(true);

        peerConnection.current = new RTCPeerConnection(config);

        // Add local stream tracks to the peer connection
        stream.getTracks().forEach((track) =>
          peerConnection.current.addTrack(track, stream)
        );

        peerConnection.current.ontrack = (event) => {
          console.log("Received remote stream:", event.streams[0]);
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        console.log("Local video stream:", localVideoRef.current.srcObject);
        console.log("Remote video stream:", remoteVideoRef.current.srcObject);

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: selectedUser._id,
            });
          }
        };


        socket.on("offer", async ({ sdp }) => {
          try {
            console.log("Received offer:", sdp);

            // Check if the connection is in the "stable" state before proceeding
            if (peerConnection.current.signalingState !== "stable") {
              console.warn("PeerConnection is not stable. Ignoring duplicate offer.");
              return;
            }

            // Set the remote description and create an answer
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(sdp)
            );
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            // Send the answer back to the caller
            socket.emit("answer", { sdp: answer, to: selectedUser._id });
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        });


        socket.on("answer", async ({ sdp }) => {
          try {
            console.log("Received answer:", sdp);

            // Prevent setting the remote description if the state isn't appropriate
            if (peerConnection.current.signalingState !== "have-local-offer") {
              console.warn("PeerConnection is not in 'have-local-offer' state. Ignoring answer.");
              return;
            }

            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(sdp)
            );
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        });


        socket.on("ice-candidate", ({ candidate }) => {
          console.log("Received ICE candidate:", candidate);
          if (candidate) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

      } catch (error) {
        console.error("Error initializing peer connection:", error);
      }
    };

    initializeConnection();

    return () => {
      peerConnection.current?.close();
      socket.off("ice-candidate");
      socket.off("offer");
      socket.off("answer");
    };
  }, [socket, selectedUser]);


  const createOffer = async () => {
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { sdp: offer, to: selectedUser._id });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

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

  useEffect(() => {
    const handleEndCallReceived = () => {
      console.log("Call ended by the other user.");
      peerConnection.current?.close(); // Close the peer connection
      onClose(); // Close the UI
    };

    // Listen for the 'end-call' event
    socket.on("end-call", handleEndCallReceived);

    return () => {
      socket.off("end-call", handleEndCallReceived);
    };
  }, [socket, onClose]);

  const handleEndCall = () => {
    // Notify the other user to end the call
    socket.emit("end-call", { to: selectedUser._id });

    // Close the local peer connection
    peerConnection.current?.close();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:w-[80%] md:left-[19.1rem] flex items-center justify-center bg-black bg-opacity-10">
      <div className="md:w-[55%] md:m-0 mt-50 h-screen  md:h-4/5 md:bottom-10 bg-gray-700 text-white flex flex-col md:rounded-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center">
            <img
              src={selectedUser?.profilePhoto || "https://via.placeholder.com/40"}
              alt="User"
              className="w-10 h-10 object-contain bg-white rounded-full mr-3"
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
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-full"
              style={{
                backgroundColor: "black", 
                transform: "scaleX(-1)",
                objectFit: "cover",
              }}
            />

          </div>
          {/* Small User Preview */}
          <div className="absolute bottom-5 right-5 w-24 h-32 bg-gray-600 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full"
              style={{
                transform: "scaleX(-1)",
                objectFit: "cover",   // Keep the aspect ratio consistent
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-center space-x-6 rounded-b-lg bg-gray-800 p-4">
          <button
            onClick={createOffer} // Call createOffer here
            className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700"
          >
            <i className="fas fa-phone"></i>
          </button>
          <button
            onClick={handleEndCall}
            className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700"
          >
            <i className="fas fa-phone-slash"></i>
          </button>
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${isMuted ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            <i className={isMuted ? "fas fa-microphone-slash" : "fas fa-microphone"}></i>
          </button>
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${videoDisabled ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"
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