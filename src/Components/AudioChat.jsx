/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";

const AudioChat = ({ onClose, socket, selectedUser }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
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
        setIsConnecting(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Check if localAudioRef is available before setting srcObject
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        } else {
          console.error("localAudioRef is not yet available.");
        }

        setPermissionsGranted(true);
        setIsConnecting(false);

        peerConnection.current = new RTCPeerConnection(config);

        // Add local stream tracks to the peer connection
        stream.getTracks().forEach((track) =>
          peerConnection.current.addTrack(track, stream)
        );

        peerConnection.current.ontrack = (event) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: selectedUser._id,
            });
          }
        };

        // Handle offer and answer only if the peer connection is in the correct state
        socket.on("offer", async ({ sdp }) => {
          try {
            if (peerConnection.current.signalingState !== "stable") {
              console.warn("PeerConnection is not stable. Ignoring duplicate offer.");
              return;
            }

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit("answer", { sdp: answer, to: selectedUser._id });
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        });

        socket.on("answer", async ({ sdp }) => {
          try {
            if (peerConnection.current.signalingState !== "have-local-offer") {
              console.warn("PeerConnection is not in 'have-local-offer' state. Ignoring answer.");
              return;
            }

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        });

        socket.on("ice-candidate", ({ candidate }) => {
          if (candidate) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });
      } catch (error) {
        setIsConnecting(false);
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
      if (!peerConnection.current) {
        console.error("Peer connection is not yet initialized.");
        return;
      }

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { sdp: offer, to: selectedUser._id });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const toggleMute = () => {
    const localStream = localAudioRef.current?.srcObject;
    if (localStream && localStream.getAudioTracks().length > 0) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    } else {
      console.error("Local stream not available or audio track missing.");
      alert("Audio is not available. Please ensure microphone permissions are granted.");
    }
  };



  useEffect(() => {
    const handleEndCallReceived = () => {
      peerConnection.current?.close();
      onClose();
    };

    socket.on("end-call", handleEndCallReceived);

    return () => {
      socket.off("end-call", handleEndCallReceived);
    };
  }, [socket, onClose]);

  const handleEndCall = () => {
    socket.emit("end-call", { to: selectedUser._id });
    peerConnection.current?.close();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:w-[40%] md:h-5/6 md:left-[65rem] top-12 flex items-center justify-center">
      <div className="md:w-[45%] p-5 md:p-0 md:m-0 mt-10 h-4/6 bottom-10 bg-black text-white bg-opacity-80 flex flex-col rounded-lg relative">
        {/* Header */}
        <div className="flex items-center justify-end p-4 text-white">
          <button onClick={onClose} className="text-gray-300 hover:text-white text-2xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col items-center justify-center flex-1">
          <img
            src={selectedUser?.profilePhoto || "https://via.placeholder.com/120"}
            alt="User"
            className="w-32 h-32 object-contain bg-white rounded-full mb-6 border-4 border-white"
          />
          <p className="text-2xl font-medium text-white">{selectedUser?.name || "User"}</p>
          <p className="text-gray-300 text-lg mt-2">
            {permissionsGranted ? "Connected" : "Requesting Permissions..."}
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="">
            <audio
              ref={remoteAudioRef}
              autoPlay
              className="w-full h-full"
            />

          </div>
          {/* Small User Preview */}
          <div className="">
            <audio
              ref={localAudioRef}
              autoPlay
              muted
              className="w-full h-full"
            />
          </div>

        </div>

        {/* Bottom Section (Buttons) */}
        <div className="flex justify-center items-center space-x-8 mb-8">
          <button
            onClick={createOffer}
            disabled={isConnecting}
            className={`w-16 h-16 ${isConnecting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } rounded-full flex items-center justify-center text-white text-2xl shadow-lg`}
          >
            <i className="fas fa-phone"></i>
          </button>
          <button
            onClick={handleEndCall}
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl hover:bg-red-700 shadow-lg"
          >
            <i className="fas fa-phone-slash"></i>
          </button>
          <button
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg ${isMuted ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            <i className={isMuted ? "fas fa-microphone-slash" : "fas fa-microphone"}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioChat;
