import React, { useEffect, useState } from "react";
import axios from "axios";

const Reels = () => {
    const [reels, setReels] = useState([]);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/reels", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setReels(response.data);
            } catch (err) {
                console.error("Error fetching reels:", err.message);
            }
        };

        fetchReels();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Reels</h1>
            <div className="grid grid-cols-3 gap-6">
                {reels.map((reel) => (
                    <div key={reel._id} className="bg-white shadow-lg p-4 rounded-lg">
                        <video
                            controls
                            src={reel.mediaUrl}
                            className="w-full h-auto rounded-md"
                        />
                        <div className="mt-2">
                            <p className="text-gray-700 font-semibold">{reel.user.username}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reels;
