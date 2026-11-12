import React, { useState, useEffect, useRef, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { FaTimes, FaPaperPlane, FaUserCircle, FaStore } from 'react-icons/fa';
import './StoreChatBoxes.css';

const StoreChatBoxes = () => {
    const { user } = useContext(ShopContext);
    const [activeChats, setActiveChats] = useState([]); // Array of { sellerId, sessionId, storeName, isOpen }
    const [messagesMap, setMessagesMap] = useState({}); // { sessionId: [messages] }
    const [inputsMap, setInputsMap] = useState({}); // { sessionId: string }
    const [guestName, setGuestName] = useState(localStorage.getItem('chat_guest_name') || '');

    const messagesEndRefs = useRef({});

    // Listen to "open-chat" event specifically for stores
    useEffect(() => {
        const handleOpenChat = (e) => {
            const targetSeller = e.detail?.sellerId;
            const targetStoreName = e.detail?.storeName || 'Store';

            if (targetSeller) {
                // If this seller's chat is already open, just make sure it's visible
                if (activeChats.find(chat => chat.sellerId === targetSeller)) {
                    setActiveChats(prev => prev.map(chat =>
                        chat.sellerId === targetSeller ? { ...chat, isOpen: true } : chat
                    ));
                } else {
                    // Open a new chat box
                    startStoreSession(targetSeller, targetStoreName);
                }
            }
        };

        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, [activeChats, user, guestName]);


    const startStoreSession = async (targetSellerId, targetStoreName) => {
        const customerId = user?.id || null;
        const customerNameStr = guestName || user?.full_name || user?.name || 'Customer';

        // Add a temporary box while connecting
        const tempId = 'loading-' + targetSellerId;
        setActiveChats(prev => [...prev, { sellerId: targetSellerId, sessionId: tempId, storeName: targetStoreName, isOpen: true, loading: true }]);

        try {
            let existingSession = null;

            if (customerId) {
                // Fetch existing session for this specific seller
                const q = query(
                    collection(db, 'chat_sessions'),
                    where('customer_id', '==', customerId),
                    where('seller_id', '==', targetSellerId),
                    orderBy('updated_at', 'desc'),
                    limit(1)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) existingSession = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            } else {
                // For guests, check localStorage for existing session with this seller
                const savedSessions = JSON.parse(localStorage.getItem('store_chat_sessions') || '{}');
                const savedSessionId = savedSessions[targetSellerId];
                if (savedSessionId) {
                    const docSnap = await getDocs(query(collection(db, 'chat_sessions'), where('__name__', '==', savedSessionId)));
                    if (!docSnap.empty) existingSession = { id: docSnap.docs[0].id, ...docSnap.docs[0].data() };
                }
            }

            let finalSessionId = null;

            if (existingSession) {
                finalSessionId = existingSession.id;
            } else {
                // Create new session
                const docRef = await addDoc(collection(db, 'chat_sessions'), {
                    customer_id: customerId,
                    customer_name: customerNameStr,
                    seller_id: targetSellerId,
                    updated_at: new Date().toISOString()
                });
                finalSessionId = docRef.id;

                // Welcome message from store
                await addDoc(collection(db, 'chat_messages'), {
                    session_id: finalSessionId,
                    sender_type: 'seller',
                    message: `হ্যালো ${customerNameStr}! আপনাকে আমাদের স্টোরে স্বাগতম। এই পণ্যটি সম্পর্কে আপনার কোনো প্রশ্ন আছে কি?`,
                    created_at: new Date().toISOString()
                });
            }

            // Save to local storage for guests
            if (!customerId) {
                const savedSessions = JSON.parse(localStorage.getItem('store_chat_sessions') || '{}');
                savedSessions[targetSellerId] = finalSessionId;
                try { localStorage.setItem('store_chat_sessions', JSON.stringify(savedSessions)); } catch (e) { console.warn(e); }
            }

            // Replace loading box with real session
            setActiveChats(prev => prev.map(c =>
                c.sellerId === targetSellerId
                    ? { sellerId: targetSellerId, sessionId: finalSessionId, storeName: targetStoreName, isOpen: true, loading: false }
                    : c
            ));

            fetchMessages(finalSessionId);

        } catch (error) {
            console.error('Error starting store session:', error);
            // Remove the loading box on error
            closeChat(targetSellerId);
        }
    };

    const fetchMessages = async (sid) => {
        const q = query(collection(db, 'chat_messages'), where('session_id', '==', sid), orderBy('created_at', 'asc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (data) {
            setMessagesMap(prev => ({ ...prev, [sid]: data }));
        }

        // Subscribe Realtime
        onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const newMsg = { id: change.doc.id, ...change.doc.data() };
                    setMessagesMap(prev => {
                        const currentMsgs = prev[sid] || [];
                        if (currentMsgs.find(m => m.id === newMsg.id)) return prev;
                        const filtered = currentMsgs.filter(m => !m.id.toString().startsWith('temp-'));
                        return { ...prev, [sid]: [...filtered, newMsg] };
                    });
                }
            });
        });
    };

    const handleSendMessage = async (e, sid) => {
        e.preventDefault();
        const msgText = inputsMap[sid];
        if (!msgText?.trim() || !sid) return;

        setInputsMap(prev => ({ ...prev, [sid]: '' }));

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            session_id: sid,
            sender_id: user?.id || null,
            sender_type: 'customer',
            message: msgText,
            created_at: new Date().toISOString()
        };

        setMessagesMap(prev => ({ ...prev, [sid]: [...(prev[sid] || []), optimisticMsg] }));

        try {
            await addDoc(collection(db, 'chat_messages'), {
                session_id: sid,
                sender_id: user?.id || null,
                sender_type: 'customer',
                message: msgText,
                created_at: new Date().toISOString()
            });

            await updateDoc(doc(db, 'chat_sessions', sid), {
                last_message: msgText,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const closeChat = (sellerId) => {
        setActiveChats(prev => prev.filter(c => c.sellerId !== sellerId));
    };

    const toggleChat = (sellerId) => {
        setActiveChats(prev => prev.map(c =>
            c.sellerId === sellerId ? { ...c, isOpen: !c.isOpen } : c
        ));
    };

    return (
        <div className="store-chat-boxes-container">
            {activeChats.map(chat => (
                <div key={chat.sellerId} className={`store-chat-box ${chat.isOpen ? 'open' : 'minimized'}`}>
                    <div className="store-chat-header" onClick={() => toggleChat(chat.sellerId)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaStore style={{ fontSize: '14px' }} />
                            <span style={{ fontSize: '13px', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                {chat.storeName}
                            </span>
                        </div>
                        <button className="store-close-btn" onClick={(e) => { e.stopPropagation(); closeChat(chat.sellerId); }}>
                            <FaTimes />
                        </button>
                    </div>

                    {chat.isOpen && (
                        <div className="store-chat-body-wrapper">
                            {chat.loading ? (
                                <div className="store-chat-loading">Connecting to store...</div>
                            ) : (
                                <>
                                    <div className="store-chat-body">
                                        {(messagesMap[chat.sessionId] || []).map(msg => {
                                            const isCustomer = msg.sender_type === 'customer';
                                            return (
                                                <div key={msg.id} className={`message-bubble-wrapper ${isCustomer ? 'right' : 'left'}`}>
                                                    <div className={`message-bubble ${isCustomer ? 'customer' : 'admin'}`}>
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Auto-scroll anchor */}
                                        <div ref={el => { if (el) el.scrollIntoView() }} />
                                    </div>
                                    <div className="store-chat-footer">
                                        <form onSubmit={(e) => handleSendMessage(e, chat.sessionId)} style={{ display: 'flex', width: '100%', gap: '5px' }}>
                                            <input
                                                type="text"
                                                placeholder="Message store..."
                                                value={inputsMap[chat.sessionId] || ''}
                                                onChange={(e) => setInputsMap(prev => ({ ...prev, [chat.sessionId]: e.target.value }))}
                                                className="store-chat-input"
                                            />
                                            <button type="submit" className="store-chat-send" disabled={!(inputsMap[chat.sessionId]?.trim())}>
                                                <FaPaperPlane />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default StoreChatBoxes;
