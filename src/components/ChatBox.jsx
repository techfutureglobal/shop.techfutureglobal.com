import React, { useState, useContext, useEffect, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { IoSend, IoClose } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';
import './ChatBox.css';

const ChatBox = ({ sellerId, sellerName, onClose }) => {
    const { user, sendMessage, messages, fetchMessages, subscribeToMessages } = useContext(ShopContext);
    const [input, setInput] = useState('');
    const [guestName, setGuestName] = useState('');
    const [isNaming, setIsNaming] = useState(!user);
    const scrollRef = useRef();

    useEffect(() => {
        if (user || guestName) {
            const userId = user ? user.id : guestName;
            fetchMessages(userId);
            const unsubscribe = subscribeToMessages(user?.id || guestName);
            return () => unsubscribe();
        }
    }, [user, guestName, sellerId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageData = {
            sender_id: user ? user.id : guestName,
            sender_name: user ? user.name : guestName,
            receiver_id: sellerId,
            content: input,
            created_at: new Date().toISOString()
        };

        const res = await sendMessage(messageData);
        if (res.success) {
            setInput('');
        }
    };

    if (isNaming) {
        return (
            <div className="chat-box-container">
                <div className="chat-header">
                    <span>Chat with {sellerName}</span>
                    <IoClose onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>
                <div className="chat-naming-body">
                    <p>Please enter your name to start chatting:</p>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                    />
                    <button onClick={() => { if (guestName) setIsNaming(false) }}>Start Chat</button>
                    <p style={{ fontSize: '11px', marginTop: '10px', color: '#888' }}>Or log in for a better experience.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-box-container">
            <div className="chat-header">
                <div className="header-user">
                    <FaUserCircle />
                    <span>{sellerName}</span>
                </div>
                <IoClose onClick={onClose} style={{ cursor: 'pointer' }} />
            </div>

            <div className="chat-messages" ref={scrollRef}>
                {messages.filter(m =>
                    (m.sender_id === (user?.id || guestName) && m.receiver_id === sellerId) ||
                    (m.sender_id === sellerId && m.receiver_id === (user?.id || guestName))
                ).map((msg, i) => (
                    <div key={i} className={`msg-bubble ${msg.sender_id === (user?.id || guestName) ? 'sent' : 'received'}`}>
                        <div className="msg-content">{msg.content}</div>
                        <div className="msg-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                ))}
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit"><IoSend /></button>
            </form>
        </div>
    );
};

export default ChatBox;
