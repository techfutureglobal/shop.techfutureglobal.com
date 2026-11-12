import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { FaCommentDots, FaTimes, FaPaperPlane, FaUserCircle, FaWhatsapp, FaRobot } from 'react-icons/fa';
import { generateAIResponse } from '../lib/gemini';
import './ChatWidget.css';

const ChatWidget = () => {
    const { user, siteConfig, allProducts } = useContext(ShopContext);
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [guestName, setGuestName] = useState(localStorage.getItem('chat_guest_name') || '');
    const [nameInput, setNameInput] = useState('');
    const [sessionId, setSessionId] = useState(localStorage.getItem('chat_session_id') || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && sessionId) {
            fetchMessages();
            const unsubscribe = subscribeToMessages();
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [isOpen, sessionId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // When a user logs in, link their session
    useEffect(() => {
        if (user && !sessionId && guestName) {
            startChatSession(user.id, user.full_name || user.name);
        }
    }, [user]);


    const startChatSession = async (customerId = null, customerNameStr = '') => {
        setIsConnecting(true);
        try {
            let existingSession = null;

            if (customerId) {
                const q = query(
                    collection(db, 'chat_sessions'),
                    where('customer_id', '==', customerId),
                    where('seller_id', '==', null),
                    orderBy('updated_at', 'desc'),
                    limit(1)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    existingSession = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                }
            } else if (sessionId) {
                const docSnap = await getDocs(query(collection(db, 'chat_sessions'), where('__name__', '==', sessionId)));
                if (!docSnap.empty) existingSession = { id: docSnap.docs[0].id, ...docSnap.docs[0].data() };
            }

            if (existingSession) {
                setSessionId(existingSession.id);
                try { localStorage.setItem('chat_session_id', existingSession.id); } catch (e) { console.warn(e); }
            } else {
                if (!customerId && !customerNameStr.trim()) {
                    setIsConnecting(false);
                    return;
                }

                // Create new session
                const docRef = await addDoc(collection(db, 'chat_sessions'), {
                    customer_id: customerId,
                    customer_name: customerNameStr,
                    seller_id: null,
                    updated_at: new Date().toISOString()
                });

                const data = { id: docRef.id };
                setSessionId(data.id);
                try { localStorage.setItem('chat_session_id', data.id); } catch (e) { console.warn(e); }

                // Welcome message
                await addDoc(collection(db, 'chat_messages'), {
                    session_id: data.id,
                    sender_type: 'admin',
                    message: `হ্যালো ${customerNameStr}! Ebaybd-এ আপনাকে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি?`,
                    created_at: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error starting chat session:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const fetchMessages = async () => {
        if (!sessionId) return;
        const q = query(collection(db, 'chat_messages'), where('session_id', '==', sessionId), orderBy('created_at', 'asc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data) setMessages(data);
    };

    const subscribeToMessages = () => {
        const q = query(collection(db, 'chat_messages'), where('session_id', '==', sessionId), orderBy('created_at', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const newMsg = { id: change.doc.id, ...change.doc.data() };
                    setMessages(prev => {
                        // Avoid duplicate keys if message arrives twice or overlaps with fetch
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        // Remove optimistic UI message to replace with real one
                        const filtered = prev.filter(m => !m.id.toString().startsWith('temp-'));
                        return [...filtered, newMsg];
                    });
                }
            });
        });
        return unsubscribe;
    };

    const handleStartChat = (e) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        setGuestName(nameInput);
        try { localStorage.setItem('chat_guest_name', nameInput); } catch (e) { console.warn(e); }
        startChatSession(user?.id || null, nameInput);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !sessionId) return;

        const msgText = newMessage;
        setNewMessage(''); // optimistic clear

        // Optimistic UI update
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            session_id: sessionId,
            sender_id: user?.id || null,
            sender_type: 'customer',
            message: msgText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await addDoc(collection(db, 'chat_messages'), {
                session_id: sessionId,
                sender_id: user?.id || null,
                sender_type: 'customer',
                message: msgText,
                created_at: new Date().toISOString()
            });

            // Update session last message
            await updateDoc(doc(db, 'chat_sessions', sessionId), {
                last_message: msgText,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // AUTO-REPLY LOGIC: First message from customer
            const isFirstCustomerMessage = !messages.some(m => m.sender_type === 'customer' && !m.id.toString().startsWith('temp-'));

            if (isFirstCustomerMessage) {
                setTimeout(async () => {
                    await addDoc(collection(db, 'chat_messages'), {
                        session_id: sessionId,
                        sender_type: 'admin',
                        message: "একটু অপেক্ষা করুন, Ebaybd AI আপনার উত্তরটি প্রসেস করছে...",
                        created_at: new Date().toISOString()
                    });
                }, 1000);
            }

            // Trigger Gemini AI Reply Function
            try {
                // Background async task so the UI does not freeze
                generateAIResponse(msgText, allProducts, siteConfig?.aiPrompt, 0, siteConfig?.aiApiKey).then(async (aiReplyText) => {
                    if (aiReplyText) {
                        await addDoc(collection(db, 'chat_messages'), {
                            session_id: sessionId,
                            sender_type: 'admin',
                            message: aiReplyText,
                            created_at: new Date().toISOString()
                        });
                        
                        // Update session
                        await updateDoc(doc(db, 'chat_sessions', sessionId), {
                            last_message: aiReplyText.substring(0, 35) + '...',
                            last_message_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });
                    }
                });
            } catch (aiErr) {
                console.error("AI Error:", aiErr);
            }

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Auto-start for logged in users if no session
    useEffect(() => {
        if (isOpen && user && !sessionId && !isConnecting) {
            startChatSession(user.id, user.full_name || user.name || 'Customer');
        }
    }, [isOpen, user]);

    // Don't show this widget on admin/seller dashboards
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller') || location.pathname.startsWith('/reseller')) {
        return null;
    }

    return (
        <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <>
                    {siteConfig?.whatsappNumber && (
                        <a
                            href={`https://wa.me/${siteConfig.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-toggle-btn"
                            title="Chat on WhatsApp"
                        >
                            <FaWhatsapp />
                            <span className="tooltip">WhatsApp!</span>
                        </a>
                    )}
                    <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                        <FaCommentDots />
                        <span className="tooltip">Chat with us!</span>
                    </button>
                </>
            )}

            {isOpen && (
                <div className="chat-box fade-in-up">
                    <div className="chat-header">
                        <div>
                            <h4 style={{ margin: 0, fontSize: '15px' }}>Ebaybd Support</h4>
                            <span style={{ fontSize: '11px', opacity: 0.8 }}>We usually reply instantly</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="close-btn"><FaTimes /></button>
                    </div>

                    <div className="chat-body">
                        {(!sessionId && !user && !guestName) ? (
                            <div className="chat-welcome">
                                <FaUserCircle style={{ fontSize: '40px', color: '#e0e6ed', marginBottom: '15px' }} />
                                <h5>Welcome!</h5>
                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
                                    Please enter your name to start chatting with our support team.
                                </p>
                                <form onSubmit={handleStartChat} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        required
                                        className="chat-name-input"
                                    />
                                    <button type="submit" className="chat-start-btn" disabled={isConnecting}>
                                        {isConnecting ? 'Connecting...' : 'Start Chat'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="messages-container">
                                {messages.map((msg) => {
                                    const isCustomer = msg.sender_type === 'customer';
                                    return (
                                        <div key={msg.id} className={`message-bubble-wrapper ${isCustomer ? 'right' : 'left'}`}>
                                            <div className={`message-bubble ${isCustomer ? 'customer' : 'admin'}`}>
                                                {msg.message}
                                            </div>
                                            <div className="message-time">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {(sessionId || user || guestName) && (
                        <div className="chat-footer">
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="chat-msg-input"
                                />
                                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
