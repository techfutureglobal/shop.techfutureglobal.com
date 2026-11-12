import React, { useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaClock } from 'react-icons/fa';

const CustomerDashboard = () => {
    const { user, orders } = useContext(ShopContext);

    // Get user's orders based on ID
    const myOrders = orders.filter(o => o.customer_id === user?.id);

    const totalOrders = myOrders.length;
    const pendingOrders = myOrders.filter(o => o.status === 'Pending').length;
    const shippedOrders = myOrders.filter(o => o.status === 'Shipped').length;
    const deliveredOrders = myOrders.filter(o => o.status === 'Delivered').length;

    return (
        <div className="dashboard-content fade-in">
            <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="page-header" style={{ margin: 0 }}>My Orders Dashboard</h1>
                <div className="user-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                    Customer Account
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card premium-shadow" style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease' }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', padding: '18px', borderRadius: '12px', fontSize: '28px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}><FaBoxOpen /></div>
                    <div>
                        <div style={{ color: '#888', fontSize: '15px', fontWeight: '500' }}>Total Orders</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-color)' }}>{totalOrders}</div>
                    </div>
                </div>
                <div className="stat-card premium-shadow" style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease' }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', color: 'white', padding: '18px', borderRadius: '12px', fontSize: '28px', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)' }}><FaClock /></div>
                    <div>
                        <div style={{ color: '#888', fontSize: '15px', fontWeight: '500' }}>Pending</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-color)' }}>{pendingOrders}</div>
                    </div>
                </div>
                <div className="stat-card premium-shadow" style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease' }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', color: 'white', padding: '18px', borderRadius: '12px', fontSize: '28px', boxShadow: '0 10px 15px -3px rgba(56, 189, 248, 0.3)' }}><FaShippingFast /></div>
                    <div>
                        <div style={{ color: '#888', fontSize: '15px', fontWeight: '500' }}>Shipped</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-color)' }}>{shippedOrders}</div>
                    </div>
                </div>
                <div className="stat-card premium-shadow" style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease' }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', color: 'white', padding: '18px', borderRadius: '12px', fontSize: '28px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}><FaCheckCircle /></div>
                    <div>
                        <div style={{ color: '#888', fontSize: '15px', fontWeight: '500' }}>Delivered</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-color)' }}>{deliveredOrders}</div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="admin-card fade-in-up" style={{ padding: '25px', borderRadius: '15px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '20px', fontWeight: '700' }}>Recent Order Activities</h3>
                    <button onClick={() => window.location.reload()} style={{ background: 'none', border: '1px solid var(--border-color)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#888' }}>
                        Refresh Data
                    </button>
                </div>

                {myOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                        <FaBoxOpen style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.2 }} />
                        <h3>No orders found</h3>
                        <p>When you place an order, it will appear here for realtime tracking.</p>
                        <a href="/shop" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>Start Shopping</a>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Tracking Number</th>
                                    <th>Current Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: '600' }}>#{order.id.split('-').pop().toUpperCase()}</td>
                                        <td>{new Date(order.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>৳{order.amount?.toLocaleString() || (order.totalAmount?.toLocaleString())}</td>
                                        <td>
                                            {order.tracking_id || order.trackingId ? (
                                                <code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{order.tracking_id || order.trackingId}</code>
                                            ) : (
                                                <span style={{ color: '#ccc', fontStyle: 'italic' }}>Pending Assignment</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
