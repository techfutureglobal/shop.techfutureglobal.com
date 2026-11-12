import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { FaCheck, FaTimes, FaUser, FaIdCard, FaPhoneAlt, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';

const RegistrationApprovals = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'profiles'), where('status', '==', 'pending'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingUsers(users);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching pending users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAction = async (userId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        
        setActionLoading(userId);
        try {
            const userRef = doc(db, 'profiles', userId);
            
            if (action === 'approve') {
                await updateDoc(userRef, { status: 'approved' });
            } else if (action === 'reject') {
                await updateDoc(userRef, { status: 'rejected' });
            }
            
        } catch (error) {
            console.error(`Error trying to ${action} user:`, error);
            alert(`Failed to ${action} user. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <FaSpinner className="fa-spin" style={{ fontSize: '30px', color: '#4634ff' }} />
                <p>Loading pending registrations...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '30px' }}>
                <h1>Registration Approvals</h1>
                <div style={{ fontSize: '14px', color: '#888ea8' }}>Review and approve new user registrations</div>
            </div>

            {pendingUsers.length === 0 ? (
                <div className="admin-card" style={{ padding: '40px', textAlign: 'center', color: '#888ea8' }}>
                    <FaIdCard style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.5 }} />
                    <h3>No Pending Approvals</h3>
                    <p>All registration requests have been processed.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User Details</th>
                                <th>Contact & Role</th>
                                <th>Payment Info</th>
                                <th>NID Documents</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(user => (
                                <tr key={user.id} className="hover-row">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888ea8' }}>
                                                <FaUser />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#3b3f5c' }}>{user.full_name}</div>
                                                <div style={{ fontSize: '12px', color: '#888ea8' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b3f5c', marginBottom: '5px' }}>
                                            <FaPhoneAlt size={12} color="#888ea8" /> {user.phone || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b3f5c' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0e6ed', fontSize: '12px', textTransform: 'capitalize' }}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ color: '#3b3f5c', fontWeight: '500', marginBottom: '5px' }}>
                                            <FaMoneyBillWave size={12} color="#888ea8" style={{ marginRight: '5px' }} /> 
                                            {user.payment_method || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#888ea8', maxWidth: '200px', wordBreak: 'break-word' }}>
                                            {user.payment_details || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ color: '#3b3f5c', fontWeight: '500', marginBottom: '5px', fontSize: '13px' }}>
                                            NID No: {user.nid_number || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {user.nid_front_url ? (
                                                <a href={user.nid_front_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#4634ff', textDecoration: 'underline' }}>Front Image</a>
                                            ) : <span style={{ fontSize: '12px', color: '#e7515a' }}>No Front</span>}
                                            
                                            {user.nid_back_url ? (
                                                <a href={user.nid_back_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#4634ff', textDecoration: 'underline' }}>Back Image</a>
                                            ) : <span style={{ fontSize: '12px', color: '#e7515a' }}>No Back</span>}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {actionLoading === user.id ? (
                                            <FaSpinner className="fa-spin" style={{ color: '#4634ff' }} />
                                        ) : (
                                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                <button 
                                                    className="btn btn-primary" 
                                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                                    onClick={() => handleAction(user.id, 'approve')}
                                                >
                                                    <FaCheck style={{ marginRight: '5px' }} /> Approve
                                                </button>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '6px 12px', fontSize: '13px', background: '#ffebee', color: '#e7515a', border: '1px solid #ffcdd2' }}
                                                    onClick={() => handleAction(user.id, 'reject')}
                                                >
                                                    <FaTimes style={{ marginRight: '5px' }} /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RegistrationApprovals;
