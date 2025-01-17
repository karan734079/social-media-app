/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
    setMessages,
    addMessage,
} from '../utils/chatSlice';
import { supabase } from '../utils/supaBase';

const ChatArea = () => {
    const [wantToDelete, setWantToDelete] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [lastFetchMessage, setLastFetchMessage] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingMessageText, setEditingMessageText] = useState('');

    const endRef = useRef(null);
    const chatRef = useRef(null);
    const dispatch = useDispatch();
    const { id } = useParams();
    const currentUserId = id;
    const {
        messages,
        selectedUser,
    } = useSelector((state) => state.chat);

    useEffect(() => {
            if(selectedUser) fetchMessages();
        }, [selectedUser, dispatch, currentUserId]);
    
    
        const fetchMessages = async (isPaginated = false) => {
            if (!selectedUser || (!isPaginated && loadingMore)) return;
    
            setLoadingMore(true);
    
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                    .order('created_at', { ascending: false })
                    .limit(10)
                    .lt('created_at', lastFetchMessage || new Date().toISOString());
    
                if (error) {
                    console.error('Error fetching messages:', error.message);
                    return;
                }
    
                if (data.length > 0) {
                    const fetchedMessages = data.reverse().map((msg) => ({
                        ...msg,
                        isSender: msg.sender_id === currentUserId,
                    }));
    
                    // Filter out duplicate messages based on unique IDs
                    const uniqueMessages = fetchedMessages.filter(
                        (newMsg) => !messages.some((existingMsg) => existingMsg.id === newMsg.id)
                    );
    
                    const updatedMessages = isPaginated
                        ? [...uniqueMessages, ...messages]
                        : [...uniqueMessages];
    
                    setLastFetchMessage(data[data.length - 1]?.created_at || null);
                    dispatch(setMessages(updatedMessages));
                } else {
                    setHasMoreMessages(false);
                }
            } catch (err) {
                console.error('Error fetching messages:', err.message);
            } finally {
                setLoadingMore(false);
            }
        };
    
    
        useEffect(() => {
            if (endRef.current && messages.length > 0) {
                endRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, [messages]);
    
    
        useEffect(() => {
            const handleScroll = () => {
                if (chatRef.current.scrollTop === 0 && hasMoreMessages && !loadingMore) {
                    const currentScrollHeight = chatRef.current.scrollHeight;
                    fetchMessages(true).then(() => {
                        const newScrollHeight = chatRef.current.scrollHeight;
                        chatRef.current.scrollTop = newScrollHeight - currentScrollHeight;
                    });
                }
            };
    
            const chatDiv = chatRef.current;
            if (chatDiv) {
                chatDiv.addEventListener('scroll', handleScroll);
                return () => chatDiv.removeEventListener('scroll', handleScroll);
            }
        }, [hasMoreMessages, loadingMore]);
    
    
        useEffect(() => {
            const channel = supabase
                .channel('messages')
                .on('postgres_changes', { event: 'INSERT', table: 'messages' }, (payload) => {
                    if (
                        payload.new.receiver_id === currentUserId ||
                        payload.new.sender_id === currentUserId
                    ) {
                        const incomingMessage = {
                            id: payload.new.id,
                            text: payload.new.text,
                            isSender: payload.new.sender_id === currentUserId,
                            sender_id: payload.new.sender_id,
                            receiver_id: payload.new.receiver_id,
                            image_url:payload.new.image_url,
                        };
    
                        dispatch(addMessage(incomingMessage));
                    }
                })
                .subscribe();
    
            return () => {
                channel.unsubscribe(); 
            };
        }, [dispatch, currentUserId]); 
    
        const handleDeleteMessage = async (messageId, imageUrl) => {
            try {
                const { error: deleteError } = await supabase
                    .from('messages')
                    .delete()
                    .eq('id', messageId);
    
                if (deleteError) {
                    console.error('Error deleting message:', deleteError.message);
                    return;
                }
    
                if (imageUrl) {
                    const fileName = imageUrl.split('/').pop();
    
                    const { error: storageError } = await supabase.storage
                        .from('images')
                        .remove([fileName]);
    
                    if (storageError) {
                        console.error('Error deleting image from storage:', storageError.message);
                        return;
                    }
    
                    console.log('Image deleted from storage successfully');
                }
    
                dispatch(setMessages(messages.filter((msg) => msg.id !== messageId)));
    
            } catch (err) {
                console.error('Error deleting message or image:', err.message);
            }
        };
    
    
        const handleDeleteButtonClick = (messageId, imageUrl) => {
            setWantToDelete(true);
            handleDeleteMessage(messageId, imageUrl);
        };
    
    
        const handleUpdateMessage = async () => {
            if (!editingMessageText.trim()) return;
    
            try {
                const { error } = await supabase.from('messages').update({ text: editingMessageText }).eq('id', editingMessageId);
    
                if (error) {
                    console.error("error updating message", error.message);
                }
    
                const updatedMessages = messages.map((msg) => msg.id === editingMessageId ? { ...msg, text: editingMessageText } : msg);
                dispatch(setMessages(updatedMessages));
    
                setEditingMessageId(null);
                setEditingMessageText("");
            } catch (err) {
                console.error("error updating message", err.message);
            }
        }

    return (

        <div className="flex-1 p-4 overflow-y-auto scroll-bar bg-white" ref={chatRef}>
            {loadingMore && (
                <div className="text-center text-gray-600 my-4">Loading previous messages...</div>
            )}

            <div className="flex flex-col justify-end h-screen">
                {messages
                    .filter(
                        (msg) =>
                            (msg.sender_id === currentUserId && msg.receiver_id === selectedUser?._id) ||
                            (msg.receiver_id === currentUserId && msg.sender_id === selectedUser?._id)
                    ).map((msg, index) => (
                        <div
                            key={index}
                            className={`relative items-end group flex mb-4 ${msg.isSender ? 'justify-end' : 'justify-start'}`}
                        >

                            <div className={`absolute top-0 hidden -my-5 mx-1 group-hover:block`}>
                                <button
                                    className="text-gray-500 hover:text-gray-800"
                                    onClick={() => {
                                        setWantToDelete((prev) => (prev === msg.id ? null : msg.id));
                                    }}
                                >
                                    {msg.isSender && <i className="fas fa-ellipsis-v"></i>}
                                </button>
                            </div>

                            {wantToDelete === msg.id && msg.sender_id === currentUserId && (
                                <div className="absolute top-0 text-xl w-32 text-center right-0 mt-1 bg-white border border-gray-300 shadow-lg rounded-md z-10">
                                    <ul className="text-sm">
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                                setEditingMessageId(msg.id);
                                                setEditingMessageText(msg.text);
                                                setWantToDelete(false);
                                            }}
                                        >
                                            Update
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer hover:text-red-600"
                                            onClick={() => {
                                                handleDeleteButtonClick(msg.id, msg.image_url);
                                            }}
                                        >
                                            Delete
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {/* Message Bubble */}
                            {editingMessageId === msg.id ? (
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={editingMessageText}
                                        onChange={(e) => setEditingMessageText(e.target.value)}
                                        className="p-2 rounded-lg bg-red-200 outline-none border-gray-300 flex-1"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleUpdateMessage}
                                        className="ml-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-800"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingMessageId(null);
                                            setEditingMessageText('');
                                        }}
                                        className="ml-2 px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`p-2 rounded-lg cursor-pointer inline-block ${msg.isSender ? 'bg-red-200 text-right' : 'bg-gray-300 text-left'}`}
                                    style={{
                                        maxWidth: '75%',
                                        width: 'fit-content',
                                    }}
                                >
                                    {msg.text && <p>{msg.text}</p>}
                                    {msg.image_url && (
                                        <img
                                            src={msg.image_url}
                                            alt="message content"
                                            className="mt-2 w-full max-w-xs rounded-lg"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
            </div>
            {/* End ref for auto-scrolling */}
            <div ref={endRef}></div>
        </div>
    )
}

export default ChatArea
