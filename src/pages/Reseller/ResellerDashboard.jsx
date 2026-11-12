import React, { useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    FaShoppingCart, FaUsers, FaBoxOpen, FaWallet,
    FaChartLine, FaArrowUp, FaArrowDown, FaStore
} from 'react-icons/fa';

const ResellerDashboard = () => {
    const { user, orders, allProducts, wallets } = useContext(ShopContext);
    const userId = user?.id;

    // Filter my reseller items (stored in products table with reseller as seller_id)
    const myManagedProducts = (allProducts || []).filter(p => p.sellerId === userId);

    // Filter orders where this user is the reseller
    const myOrders = (orders || []).filter(o => o.reseller_id === userId || o.resellerId === userId);

    // Calculate earnings from delivered orders
    const totalEarnings = myOrders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + (Number(o.totalAmount || 0) * 0.1), 0);

    // Get current wallet balance
    const myWallet = (wallets || []).find(w => w.user_id === userId);

    const salesData = [
        { name: 'Mon', sales: 400 },
        { name: 'Tue', sales: 300 },
        { name: 'Wed', sales: 500 },
        { name: 'Thu', sales: 278 },
        { name: 'Fri', sales: 189 },
        { name: 'Sat', sales: 239 },
        { name: 'Sun', sales: 349 },
    ];

    const categoryData = [
        { name: 'Electronics', value: 400 },
        { name: 'Fashion', value: 300 },
        { name: 'Home', value: 300 },
        { name: 'Groceries', value: 200 },
    ];

    const COLORS = ['#805dca', '#00b5ff', '#1abc9c', '#e2a03f'];

    return (
        <div className="admin-container-inner" style={{ padding: '25px' }}>
            <div className="admin-page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#3b3f5c' }}>Reseller Dashboard</h1>
                    <p style={{ color: '#888ea8', fontSize: '14px' }}>Welcome back, {user?.full_name || 'Reseller'}! Here's your business overview.</p>
                </div>
                <a
                    href={`/shop/${user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ background: '#00b5ff', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaStore /> Preview Landing Page
                </a>
            </div>

            {/* Top Stats Grid */}
            <div className="top-stats-grid">
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Total Referral Sales</h3>
                        <div className="number">{myOrders.length}</div>
                    </div>
                    <div className="stat-icon icon-bg-purple">
                        <FaShoppingCart />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Delivered Orders</h3>
                        <div className="number">{myOrders.filter(o => o.status === 'Delivered').length}</div>
                    </div>
                    <div className="stat-icon icon-bg-green">
                        <FaUsers />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>My Products</h3>
                        <div className="number">{myManagedProducts.length}</div>
                    </div>
                    <div className="stat-icon icon-bg-orange">
                        <FaBoxOpen />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Total Earnings</h3>
                        <div className="number">৳ {totalEarnings.toLocaleString()}</div>
                    </div>
                    <div className="stat-icon icon-bg-pink">
                        <FaWallet />
                    </div>
                </div>
            </div>

            {/* Middle colored cards */}
            <div className="middle-stats-grid">
                <div className="colored-card bg-blue">
                    <FaChartLine className="card-icon" />
                    <h3>Wallet Balance</h3>
                    <div className="number">৳ {myWallet?.balance?.toLocaleString() || '0'}</div>
                </div>
                <div className="colored-card bg-green">
                    <FaArrowUp className="card-icon" />
                    <h3>Pending Balance</h3>
                    <div className="number">৳ {myWallet?.pending?.toLocaleString() || '0'}</div>
                </div>
                <div className="colored-card bg-dark">
                    <FaArrowDown className="card-icon" />
                    <h3>Total Withdrawn</h3>
                    <div className="number">৳ {myWallet?.total_withdrawn?.toLocaleString() || '0'}</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                <div className="admin-card" style={{ height: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Earning Analytics</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#805dca" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#805dca" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e6ed" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888ea8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888ea8', fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="sales" stroke="#805dca" fillOpacity={1} fill="url(#colorEarnings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="admin-card" style={{ height: '400px' }}>
                    <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Niche Performance</h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Table */}
            <div className="admin-card">
                <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>My Referral Orders</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>My Commission</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders?.slice(0, 5).map((order) => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: '500' }}>#{order.id}</td>
                                    <td>{order.date}</td>
                                    <td>৳ {order.totalAmount}</td>
                                    <td style={{ color: '#00ab55', fontWeight: '700' }}>৳ {(order.totalAmount * 0.1).toFixed(0)}</td>
                                    <td>
                                        <span className={`status-badge ${order.status?.toLowerCase() === 'delivered' ? 'success' : 'warning'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {myOrders.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No orders recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResellerDashboard;
