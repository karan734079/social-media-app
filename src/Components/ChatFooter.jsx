import React, { useEffect, useState } from 'react'
import EmojiPicker from 'emoji-picker-react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supaBase';


const ChatFooter = () => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { id } = useParams();
    const currentUserId = id;

    const {
        selectedUser,
    } = useSelector((state) => state.chat);

    const onEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };

    const handleSendMessage = async () => {
        if (message.trim()) {
            const newMessage = {
                id: uuidv4(),
                text: message,
                isSender: true,
                sender_id: currentUserId,
                receiver_id: selectedUser?._id,
                image_url: "",
                is_read: false,
            };

            try {
                const { error } = await supabase
                    .from('messages')
                    .insert([
                        {
                            id: newMessage.id,
                            text: newMessage.text,
                            is_sender: newMessage.isSender,
                            sender_id: newMessage.sender_id,
                            receiver_id: newMessage.receiver_id,
                            image_url: newMessage.image_url,
                            is_read:newMessage.is_read,
                        },
                    ]);

                if (error) {
                    console.error('Supabase error:', error.message);
                    return;
                }
                setMessage('');
            } catch (err) {
                console.error('Error sending message:', err.message);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleFileChange = (file) => {
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setSelectedImage(file);
        setImagePreview(previewUrl);
    };


    const handleSendImage = async () => {
        if (!selectedImage) return;

        try {
            const fileName = `${uuidv4()}-${selectedImage.name}`;
            console.log('Uploading file:', fileName);

            const { data, error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, selectedImage);

            if (uploadError) {
                console.error('Error uploading file:', uploadError.message);
                return;
            }

            console.log('Upload successful:', data);

            const { data: publicData, error: urlError } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            if (urlError) {
                console.error('Error getting public URL:', urlError.message);
                return;
            }

            console.log('Public URL:', publicData.publicUrl);

            const newMessage = {
                id: uuidv4(),
                text: '',
                is_sender: true,
                sender_id: currentUserId,
                receiver_id: selectedUser?._id,
                image_url: publicData.publicUrl,
            };

            const { error: insertError } = await supabase
                .from('messages')
                .insert([newMessage]);

            if (insertError) {
                console.error('Error saving message:', insertError.message);
                return;
            }
            setSelectedImage(null);
            setImagePreview(null);
            console.log('Image sent successfully!');
        } catch (err) {
            console.error('Error sending image:', err.message);
        }
    };

    return (
        <form
            className="p-4 flex items-center space-x-3 border-t"
            onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
            }}
        >
            <label htmlFor="file" className="text-red-600 cursor-pointer">
                <i className="fas fa-image text-2xl"></i>
            </label>
            <input
                type="file"
                id="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
            />

            {imagePreview && (
                <div className="flex flex-col items-center space-y-2">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 absolute -my-24  h-24 object-contain bg-white rounded-md border"
                    />
                    <button
                        type="button"
                        className="px-4 py-2 text-white rounded-md"
                        onClick={handleSendImage}
                    >
                        <i className="fas fa-paper-plane text-lg text-red-600"></i>
                    </button>
                </div>
            )}

            <div className="relative text-red-600 cursor-pointer">
                <i
                    className="fas fa-face-smile text-2xl"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                ></i>
                {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-50">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                )}
            </div>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="p-2 w-full bg-white rounded-lg outline-none border border-gray-300"
            />

            <button type="submit" className="text-red-600">
                <i className="fas fa-paper-plane text-2xl"></i>
            </button>
        </form>
    )
}

export default ChatFooter
