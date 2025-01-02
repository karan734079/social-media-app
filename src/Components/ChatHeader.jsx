import React from 'react'
import profilePhoto from '../images/Screenshot 2024-05-08 221135.png';
import { useSelector } from 'react-redux';


const ChatHeader = () => {
    const {selectedUser} = useSelector((state)=>state.chat)

    return (
        <div className="flex items-center justify-between p-[10px] bg-red-600 text-white border-b">
            <div className="flex items-center">
                <img
                    src={selectedUser?.profilePhoto || profilePhoto}
                    alt="User"
                    className="w-12 h-12 object-contain bg-white rounded-full mr-3"
                />
                <div>
                    <p className="font-medium text-xl">{selectedUser?.name || 'Select a user'}</p>
                    <p className="text-sm">{selectedUser ? 'Active' : 'Select a user'}</p>
                </div>
            </div>
            <div className="flex space-x-4 text-gray-200 mr-2 text-xl">
                <i className="fas fa-video cursor-pointer hover:text-white"></i>
                <i className="fas fa-phone cursor-pointer hover:text-white"></i>
                <i className="fas fa-search cursor-pointer hover:text-white"></i>
            </div>
        </div>
    )
}

export default ChatHeader
