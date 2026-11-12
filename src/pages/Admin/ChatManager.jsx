import React, { useState, useEffect, useRef, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { FaPaperPlane, FaUserCircle, FaSearch, FaCommentDots } from 'react-icons/fa';

const ChatManager = () => {
    const { user } = useContext(ShopContext);
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchText, setSearchText] = useState('');

    const messagesEndRef = useRef(null);

    // Fetch chat sessions based on role
    const fetchSessions = async () => {
        if (!user) return;

        let q = query(collection(db, 'chat_sessions'), orderBy('updated_at', 'desc'));

        // If it's a seller, only get chats specifically directed to them
        if (user.role === 'seller' || user.role === 'reseller') {
            q = query(collection(db, 'chat_sessions'), where('seller_id', '==', user.id), orderBy('updated_at', 'desc'));
        } else if (user.role === 'admin') {
            q = query(collection(db, 'chat_sessions'), where('seller_id', '==', null), orderBy('updated_at', 'desc'));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (data) setSessions(data);
    };

    useEffect(() => {
        if (!user) return;
        fetchSessions();

        let q = query(collection(db, 'chat_sessions'), orderBy('updated_at', 'desc'));
        if (user.role === 'seller' || user.role === 'reseller') {
            q = query(collection(db, 'chat_sessions'), where('seller_id', '==', user.id), orderBy('updated_at', 'desc'));
        } else if (user.role === 'admin') {
            q = query(collection(db, 'chat_sessions'), where('seller_id', '==', null), orderBy('updated_at', 'desc'));
        }

        // Subscribe to session updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setSessions(data);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        }
    }, [user]);

    // Fetch messages for active session
    useEffect(() => {
        if (!activeSession) return;

        const fetchMessages = async () => {
            const q = query(collection(db, 'chat_messages'), where('session_id', '==', activeSession.id), orderBy('created_at', 'asc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (data) setMessages(data);
        };

        fetchMessages();

        const q = query(collection(db, 'chat_messages'), where('session_id', '==', activeSession.id), orderBy('created_at', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const newMsg = { id: change.doc.id, ...change.doc.data() };
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        const filtered = prev.filter(m => !m.id.toString().startsWith('temp-'));
                        return [...filtered, newMsg];
                    });
                    setTimeout(scrollToBottom, 100);
                }
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [activeSession]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeSession) return;

        const msgText = newMessage;
        setNewMessage('');

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            session_id: activeSession.id,
            sender_id: user.id,
            sender_type: user.role === 'admin' ? 'admin' : 'seller',
            message: msgText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await addDoc(collection(db, 'chat_messages'), {
                session_id: activeSession.id,
                sender_id: user.id,
                sender_type: user.role === 'admin' ? 'admin' : 'seller',
                message: msgText,
                created_at: new Date().toISOString()
            });

            await updateDoc(doc(db, 'chat_sessions', activeSession.id), {
                last_message: msgText,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        } catch (err) {
            console.error(err);
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.customer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        s.id.includes(searchText)
    );

    return (
        <div className="fade-in" style={{ height: 'calc(100vh - 120px)', minHeight: '600px' }}>
            <h1 className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCommentDots style={{ color: '#4361ee' }} /> Messages
            </h1>

            <div className="admin-card" style={{ padding: 0, height: '90%', display: 'flex', overflow: 'hidden' }}>

                {/* ---------- LEFT: CHAT LIST ---------- */}
                <div style={{ width: '320px', borderRight: '1px solid #e0e6ed', display: 'flex', flexDirection: 'column', background: '#f8f9ff' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #e0e6ed' }}>
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', top: '12px', left: '12px', color: '#aaa' }} />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredSessions.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No chats found.</div>
                        ) : (
                            filteredSessions.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => setActiveSession(session)}
                                    style={{
                                        padding: '15px 20px',
                                        borderBottom: '1px solid #e0e6ed',
                                        cursor: 'pointer',
                                        background: activeSession?.id === session.id ? 'white' : 'transparent',
                                        borderLeft: activeSession?.id === session.id ? '4px solid #4361ee' : '4px solid transparent',
                                        transition: '0.2s'
                                    }}
                                >
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#333' }}>{session.customer_name || 'Guest'}</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {session.last_message || 'New chat started'}
                                    </p>
                                    <span style={{ fontSize: '10px', color: '#aaa' }}>
                                        {new Date(session.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ---------- RIGHT: ACTIVE CHAT ---------- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                    {!activeSession ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                            <FaCommentDots style={{ fontSize: '60px', opacity: 0.2, marginBottom: '20px' }} />
                            <h3>Select a chat to start messaging</h3>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '15px 25px', borderBottom: '1px solid #e0e6ed', background: '#f8f9ff', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FaUserCircle style={{ fontSize: '30px', color: '#4361ee' }} />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px' }}>{activeSession.customer_name}</h3>
                                    <span style={{ fontSize: '11px', color: '#888' }}>ID: {activeSession.id.split('-')[0]}</span>
                                </div>
                            </div>

                            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {messages.map(msg => {
                                    // Admin/Seller messages are on the right, Customer on the left
                                    const isMe = msg.sender_type !== 'customer';
                                    return (
                                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                            <div style={{
                                                padding: '12px 18px',
                                                borderRadius: '1.5rem',
                                                background: isMe ? '#4361ee' : '#f0f4f8',
                                                color: isMe ? 'white' : '#333',
                                                borderBottomRightRadius: isMe ? '4px' : '1.5rem',
                                                borderBottomLeftRadius: !isMe ? '4px' : '1.5rem',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                            }}>
                                                {msg.message}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px', textAlign: isMe ? 'right' : 'left' }}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div style={{ padding: '20px', borderTop: '1px solid #e0e6ed', background: 'white' }}>
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '15px' }}>
                                    <input
                                        type="text"
                                        placeholder="Type your reply here..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        style={{ flex: 1, padding: '15px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none', fontSize: '15px' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        style={{
                                            width: '50px', height: '50px', borderRadius: '50%', background: '#4361ee',
                                            color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                            opacity: newMessage.trim() ? 1 : 0.6
                                        }}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatManager;
