import React, { useState, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { FaBox, FaShippingFast, FaCheck, FaTimes, FaTrash, FaMobileAlt, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';

const statusColors = {
    'Pending': { bg: '#fff3cd', color: '#856404', border: '#ffc107' },
    'Processing': { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' },
    'Shipped': { bg: '#e0e7ff', color: '#3730a3', border: '#6366f1' },
    'Delivered': { bg: '#d4edda', color: '#155724', border: '#28a745' },
    'Cancelled': { bg: '#f8d7da', color: '#721c24', border: '#dc3545' },
};

const paymentStatusColors = {
    'TxID Submitted': { bg: '#fff3cd', color: '#856404' },
    'Paid': { bg: '#d4edda', color: '#155724' },
    'Pending Verification': { bg: '#f5f5f5', color: '#666' },
    'Confirmed': { bg: '#d4edda', color: '#155724' },
    'Rejected': { bg: '#f8d7da', color: '#721c24' },
};

const OrderManager = () => {
    const { user, orders, couriers, assignCourier, deleteOrder, markOrderAsDelivered, trackOrderRealtime, createPathaoOrder, createSteadfastOrder, fetchData } = useContext(ShopContext);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [courierForm, setCourierForm] = useState({ courierId: '', trackingId: '' });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [confirmingTxId, setConfirmingTxId] = useState(null);

    // Filter orders based on user role
    const userOrders = orders.filter(order => {
        if (user?.role === 'admin') return true;
        if (user?.role === 'seller') return order.items?.some(item => item.sellerId === user.id || item.seller_id === user.id);
        if (user?.role === 'reseller') return order.resellerId === user.id || order.reseller_id === user.id;
        return false;
    });

    const filteredOrders = userOrders.filter(o => {
        const matchSearch = !search || o.id?.toLowerCase().includes(search.toLowerCase()) ||
            o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            o.transaction_id?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Orders waiting for TxID confirmation
    const pendingTxOrders = userOrders.filter(o => o.payment_status === 'TxID Submitted' && o.status === 'Pending');

    const handleDeleteOrder = (id) => {
        if (window.confirm('এই অর্ডারটি মুছে ফেলবেন?')) deleteOrder(id);
    };

    const handleAssignClick = (order) => {
        setAssigningOrder(order);
        setCourierForm({ courierId: couriers[0]?.id || '', trackingId: '' });
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        const selectedCourier = couriers.find(c => c.id === courierForm.courierId);
        let trackingId = courierForm.trackingId;

        // Automatically sync with API if it's a provider
        if (selectedCourier?.type === 'pathao') {
            const res = await createPathaoOrder(assigningOrder);
            if (res.success) {
                trackingId = res.trackingId;
            } else {
                alert(`Pathao Error: ${res.error}`);
                return;
            }
        } else if (selectedCourier?.type === 'steadfast') {
            const res = await createSteadfastOrder(assigningOrder);
            if (res.success) {
                trackingId = res.trackingId;
            } else {
                alert(`Steadfast Error: ${res.error}`);
                return;
            }
        }

        const res = await assignCourier(assigningOrder.id, courierForm.courierId, trackingId);
        if (res.success) {
            alert('অর্ডারটি সাফল্যের সাথে শিপ করা হয়েছে।');
            setAssigningOrder(null);
        } else {
            alert(`Error: ${res.error}`);
        }
    };

    // ✅ Confirm TxID & mark as Processing
    const handleConfirmPayment = async (orderId) => {
        setConfirmingTxId(orderId);
        try {
            await updateDoc(doc(db, 'orders', orderId), { payment_status: 'Confirmed', status: 'Processing' });
            alert(`Order #${orderId} এর পেমেন্ট নিশ্চিত হয়েছে এবং Processing এ গেছে।`);
            if (typeof fetchData === 'function') fetchData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
        setConfirmingTxId(null);
    };

    // Reject TxID
    const handleRejectPayment = async (orderId) => {
        if (!window.confirm('এই অর্ডারের পেমেন্ট Reject করবেন?')) return;
        try {
            await updateDoc(doc(db, 'orders', orderId), { payment_status: 'Rejected', status: 'Cancelled' });
            alert(`Order #${orderId} Cancelled হয়েছে।`);
            if (typeof fetchData === 'function') fetchData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const getCourierName = (id) => couriers.find(c => c.id === id)?.name || 'Unknown';

    return (
        <div className="fade-in">
            <h1 className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBox style={{ color: '#4361ee' }} /> Order Management
            </h1>

            {/* Pending TxID Alert */}
            {pendingTxOrders.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                    border: '2px solid #ffc107',
                    borderRadius: '12px',
                    padding: '15px 20px',
                    marginBottom: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <FaMobileAlt style={{ color: '#f59e0b', fontSize: '22px', flexShrink: 0 }} />
                    <div>
                        <b style={{ color: '#856404', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaExclamationTriangle /> {pendingTxOrders.length}টি অর্ডারে TxID যাচাই বাকি!
                        </b>
                        <br />
                        <span style={{ fontSize: '13px', color: '#856404' }}>
                            Customer রা Personal বিকাশ/নগদে টাকা পাঠিয়ে TxID দিয়েছেন। নিচে "TxID" কলামে দেখুন এবং যাচাই করুন।
                        </span>
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Order ID, Customer নাম বা TxID দিয়ে খুঁজুন..."
                        style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #e0e6ed', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #e0e6ed', fontSize: '14px', background: 'white' }}
                >
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: '#f8f9ff', border: '1px solid #e0e6ed', borderRadius: '8px', fontSize: '13px', color: '#555' }}>
                    <FaFilter /> মোট: {filteredOrders.length} অর্ডার
                </div>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper table-wrapper-scroll">
                    <table className="admin-table" style={{ fontSize: '13px' }}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>তারিখ</th>
                                <th>Customer</th>
                                <th>পরিমাণ</th>
                                <th>Payment Method</th>
                                <th style={{ background: '#fffbeb' }}>TxID / Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => {
                                const st = statusColors[order.status] || statusColors['Pending'];
                                const pt = paymentStatusColors[order.payment_status] || paymentStatusColors['Pending Verification'];
                                const hasTxId = order.transaction_id || order.payment_note;
                                const needsVerification = order.payment_status === 'TxID Submitted';

                                return (
                                    <tr key={order.id} style={{ background: needsVerification ? '#fffef0' : 'white' }}>
                                        <td>
                                            <span
                                                style={{ fontWeight: '700', color: '#4361ee', cursor: 'pointer', textDecoration: 'underline' }}
                                                onClick={() => setViewingOrder(order)}
                                            >
                                                #{order.id}
                                            </span>
                                        </td>
                                        <td style={{ color: '#666' }}>{order.date || new Date(order.created_at).toLocaleDateString('bn-BD')}</td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{order.customerName || order.customer || 'Guest'}</div>
                                            <div style={{ fontSize: '11px', color: '#888' }}>{order.shipping_info?.phone || ''}</div>
                                        </td>
                                        <td style={{ fontWeight: '700', color: '#1abc9c' }}>৳{(order.amount || order.totalAmount || 0).toLocaleString()}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
                                                background: order.payment_method === 'cod' ? '#f0f4f8' : '#e8f5e9',
                                                color: order.payment_method === 'cod' ? '#555' : '#1b5e20',
                                                fontWeight: '600', textTransform: 'uppercase'
                                            }}>
                                                {order.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ background: needsVerification ? '#fffde7' : 'transparent' }}>
                                            {hasTxId ? (
                                                <div>
                                                    <div style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '13px', color: '#d12053', letterSpacing: '1px' }}>
                                                        {order.transaction_id || '—'}
                                                    </div>
                                                    <div style={{
                                                        display: 'inline-block', fontSize: '11px', padding: '2px 8px',
                                                        borderRadius: '10px', fontWeight: '600',
                                                        background: pt.bg, color: pt.color, marginTop: '3px'
                                                    }}>
                                                        {order.payment_status || 'Pending'}
                                                    </div>
                                                    {needsVerification && user?.role === 'admin' && (
                                                        <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
                                                            <button
                                                                onClick={() => handleConfirmPayment(order.id)}
                                                                disabled={confirmingTxId === order.id}
                                                                title="পেমেন্ট নিশ্চিত করুন"
                                                                style={{
                                                                    padding: '4px 10px', background: '#1abc9c', color: 'white',
                                                                    border: 'none', borderRadius: '5px', cursor: 'pointer',
                                                                    fontSize: '11px', fontWeight: '700',
                                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                                }}
                                                            >
                                                                <FaCheckCircle /> Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectPayment(order.id)}
                                                                title="Reject করুন"
                                                                style={{
                                                                    padding: '4px 10px', background: '#e7515a', color: 'white',
                                                                    border: 'none', borderRadius: '5px', cursor: 'pointer',
                                                                    fontSize: '11px', fontWeight: '700',
                                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                                }}
                                                            >
                                                                <FaTimesCircle /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#aaa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {order.payment_method === 'cod' ? <><FaMoneyBillWave /> Cash on Delivery</> : '—'}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                                                fontSize: '12px', fontWeight: '700',
                                                background: st.bg, color: st.color, border: `1px solid ${st.border}`
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {/* Ship Button for Pending or Processing */}
                                                {(order.status === 'Pending' || order.status === 'Processing') && !order.courierId && (
                                                    <button
                                                        onClick={() => handleAssignClick(order)}
                                                        title="Courier এ পাঠান"
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: 'linear-gradient(135deg, #4361ee, #1e3a8a)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            boxShadow: '0 2px 4px rgba(67, 97, 238, 0.3)'
                                                        }}
                                                    >
                                                        <FaShippingFast /> কুরিয়ারে পাঠান
                                                    </button>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <button
                                                        onClick={() => markOrderAsDelivered(order.id)}
                                                        title="Delivered"
                                                        style={{ padding: '5px 10px', background: '#1abc9c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <FaCheck /> Delivered
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setViewingOrder(order)}
                                                    style={{ padding: '5px 10px', background: '#f8f9ff', color: '#4361ee', border: '1px solid #e0e6ed', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                                >
                                                    Details
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        style={{ padding: '5px 8px', background: '#fee2e2', color: '#e7515a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                                        কোনো অর্ডার পাওয়া যায়নি।
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── ORDER DETAIL MODAL ── */}
            {viewingOrder && (
                <div className="modal-overlay" onClick={() => setViewingOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#3b3f5c' }}>Order #{viewingOrder.id}</h2>
                            <button onClick={() => setViewingOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#888' }}><FaTimes /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ padding: '15px', background: '#f8f9ff', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 10px', color: '#4361ee' }}>শিপিং তথ্য</h4>
                                <p style={{ margin: '3px 0', fontSize: '14px' }}><b>নাম:</b> {viewingOrder.shipping_info?.name || viewingOrder.customerName}</p>
                                <p style={{ margin: '3px 0', fontSize: '14px' }}><b>ফোন:</b> {viewingOrder.shipping_info?.phone}</p>
                                <p style={{ margin: '3px 0', fontSize: '14px' }}><b>ঠিকানা:</b> {viewingOrder.shipping_info?.address}, {viewingOrder.shipping_info?.city}</p>
                            </div>

                            {viewingOrder.transaction_id && (
                                <div style={{ padding: '15px', background: '#fffde7', border: '2px solid #ffc107', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 10px', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaMobileAlt /> পেমেন্ট তথ্য
                                    </h4>
                                    <p style={{ margin: '3px 0', fontSize: '14px' }}><b>TxID:</b> <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#d12053', fontSize: '16px', letterSpacing: '1px' }}>{viewingOrder.transaction_id}</span></p>
                                    <p style={{ margin: '3px 0', fontSize: '14px' }}><b>Method:</b> {viewingOrder.payment_method?.toUpperCase()}</p>
                                    <p style={{ margin: '3px 0', fontSize: '14px' }}><b>Status:</b> {viewingOrder.payment_status}</p>
                                    {viewingOrder.payment_note && <p style={{ margin: '3px 0', fontSize: '13px', color: '#666' }}>{viewingOrder.payment_note}</p>}

                                    {viewingOrder.payment_status === 'TxID Submitted' && user?.role === 'admin' && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                            <button
                                                onClick={() => { handleConfirmPayment(viewingOrder.id); setViewingOrder(null); }}
                                                style={{ flex: 1, padding: '10px', background: '#1abc9c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                            >
                                                <FaCheckCircle /> পেমেন্ট নিশ্চিত করুন
                                            </button>
                                            <button
                                                onClick={() => { handleRejectPayment(viewingOrder.id); setViewingOrder(null); }}
                                                style={{ flex: 1, padding: '10px', background: '#e7515a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                            >
                                                <FaTimesCircle /> Reject করুন
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ padding: '15px', background: '#f8f9ff', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 10px', color: '#4361ee' }}>পণ্য সমূহ</h4>
                                {(viewingOrder.items || []).map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e0e6ed', fontSize: '13px' }}>
                                        <span>{item.title || item.name} × {item.quantity}</span>
                                        <span style={{ fontWeight: '700' }}>৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: '800', fontSize: '15px', color: '#1abc9c' }}>
                                    <span>মোট:</span>
                                    <span>৳{(viewingOrder.amount || viewingOrder.totalAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ASSIGN COURIER MODAL ── */}
            {assigningOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Courier Assign — #{assigningOrder.id}</h2>
                            <button onClick={() => setAssigningOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAssignSubmit}>
                            <div style={{ background: '#f8f9ff', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>অর্ডার আইডি: <b>#{assigningOrder.id}</b> | পরিমাণ: <b>৳{assigningOrder.amount}</b></div>

                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', fontSize: '14px' }}>কুরিয়ার সার্ভিস বেছে নিন</label>
                                    <select
                                        value={courierForm.courierId}
                                        onChange={e => setCourierForm({ ...courierForm, courierId: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e6ed', fontSize: '14px', background: 'white' }}
                                    >
                                        <option value="">সিলেক্ট করুন...</option>
                                        {couriers.map(c => <option key={c.id} value={c.id}>{c.name} (Delivery Charge: ৳{c.rate})</option>)}
                                    </select>
                                </div>

                                {courierForm.courierId && couriers.find(c => c.id === courierForm.courierId)?.type === 'manual' && (
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tracking ID (ম্যানুয়াল কুরিয়ারের জন্য)</label>
                                        <input
                                            type="text"
                                            placeholder="ট্র্যাকিং নাম্বার দিন"
                                            value={courierForm.trackingId}
                                            onChange={e => setCourierForm({ ...courierForm, trackingId: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e6ed', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                )}

                                {courierForm.courierId && couriers.find(c => c.id === courierForm.courierId)?.type !== 'manual' && (
                                    <div style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaCheckCircle /> এপিআই এর মাধ্যমে অটোমেটিক বুকিং করা হবে এবং ট্র্যাকিং আইডি জেনারেট হবে।
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setAssigningOrder(null)}
                                    style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={!courierForm.courierId}
                                    style={{
                                        flex: 2, padding: '12px',
                                        background: courierForm.courierId ? 'linear-gradient(135deg, #4361ee, #1e3a8a)' : '#ccc',
                                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: courierForm.courierId ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <FaShippingFast style={{ marginRight: '8px' }} /> কনফার্ম ও শিপ করুন
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
