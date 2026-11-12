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

const SellerDashboard = () => {
    const { user, orders, allProducts, wallets, financialStats } = useContext(ShopContext);
    const userId = user?.id;

    // Filter data for this specific seller
    const myProducts = (allProducts || []).filter(p => p.sellerId === userId);

    // Filter orders where at least one item belongs to this seller
    const myOrders = (orders || []).filter(o =>
        (o.items || []).some(item => (item.sellerId || item.seller_id) === userId)
    );

    // Calculate revenue for THIS seller's items across all their orders
    const totalRevenue = (orders || [])
        .filter(o => o.status === 'Delivered')
        .reduce((acc, o) => {
            const sellerItems = (o.items || []).filter(item => (item.sellerId || item.seller_id) === userId);
            const total = sellerItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
            return acc + total;
        }, 0);

    // Get current wallet balance
    const myWallet = (wallets || []).find(w => w.user_id === userId);

    const salesData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 5000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
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
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#3b3f5c' }}>{user?.store_name || user?.storeName || 'Seller Dashboard'}</h1>
                    <p style={{ color: '#888ea8', fontSize: '14px' }}>Welcome back! Here's your shop overview today.</p>
                </div>
                <a
                    href={`/store/${user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ background: '#00b5ff', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaStore /> Preview My Shop
                </a>
            </div>

            {/* Top Stats Grid */}
            <div className="top-stats-grid">
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>My Orders</h3>
                        <div className="number">{myOrders.length}</div>
                    </div>
                    <div className="stat-icon icon-bg-purple">
                        <FaShoppingCart />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>My Customers</h3>
                        <div className="number">{new Set(myOrders.map(o => o.customer_id)).size}</div>
                    </div>
                    <div className="stat-icon icon-bg-green">
                        <FaUsers />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>My Products</h3>
                        <div className="number">{myProducts.length}</div>
                    </div>
                    <div className="stat-icon icon-bg-orange">
                        <FaBoxOpen />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Total Revenue</h3>
                        <div className="number">৳ {totalRevenue.toLocaleString()}</div>
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
                {/* Sales Overview Chart */}
                <div className="admin-card" style={{ height: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Sales Overview</h4>
                        <div style={{ fontSize: '12px', color: '#888ea8' }}>Current Week</div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#805dca" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#805dca" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e6ed" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888ea8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888ea8', fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="sales" stroke="#805dca" fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Categories Chart */}
                <div className="admin-card" style={{ height: '400px' }}>
                    <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Sales by Category</h4>
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
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                        {categoryData.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx] }}></div>
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Recent Orders</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders?.slice(0, 5).map((order) => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: '500' }}>#{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.items?.[0]?.title || 'Product'}</td>
                                    <td>৳ {order.totalAmount}</td>
                                    <td>
                                        <span className={`status-badge ${order.status?.toLowerCase() === 'delivered' ? 'success' : 'warning'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {myOrders.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No orders yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
