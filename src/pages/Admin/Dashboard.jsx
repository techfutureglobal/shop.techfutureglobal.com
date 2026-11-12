import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { optimizeBase64Image } from '../../utils/imageOptimizer';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    FaShoppingCart, FaUsers, FaBoxOpen, FaWallet,
    FaChartLine, FaArrowUp, FaArrowDown
} from 'react-icons/fa';

const AdminDashboard = () => {
    const { orders, customers, financialStats, loginStats, allProducts, sellers } = useContext(ShopContext);
    const [optStatus, setOptStatus] = useState('');

    const runAutoOptimizer = async () => {
        setOptStatus('Scanning database for heavy images (converting to WebP)...');
        try {
            const snap = await getDocs(collection(db, 'products'));
            const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (products) {
                let updatedCount = 0;
                for (let p of products) {
                    if (p.image && p.image.startsWith('data:image') && p.image.length > 100000 && !p.image.startsWith('data:image/webp')) {
                        setOptStatus(`Optimizing product: ${p.title?.substring(0, 20)}...`);
                        const optimized = await optimizeBase64Image(p.image, 800, 0.6);
                        if (optimized !== p.image && optimized.length < p.image.length) {
                            await updateDoc(doc(db, 'products', p.id), { image: optimized });
                            updatedCount++;
                        }
                    }
                }
                setOptStatus(`Auto-optimization complete! ${updatedCount} heavy images compressed to WebP! Database load times improved.`);
                setTimeout(() => setOptStatus(''), 7000);
            }
        } catch (e) {
            setOptStatus('Error during optimization: ' + e.message);
        }
    };

    // Mock data for charts
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
        <div className="admin-container-inner">
            <div className="admin-page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#3b3f5c' }}>Dashboard</h1>
                    <p style={{ color: '#888ea8', fontSize: '14px' }}>Welcome back! Here's what's happening today.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <button 
                        onClick={runAutoOptimizer} 
                        style={{ background: '#f85606', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Auto-Optimize DB Images (WebP)
                    </button>
                    {optStatus && <small style={{ color: '#f85606', marginTop: '5px' }}>{optStatus}</small>}
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="top-stats-grid">
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Total Orders</h3>
                        <div className="number">{orders?.length || 0}</div>
                    </div>
                    <div className="stat-icon icon-bg-purple">
                        <FaShoppingCart />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Total Customers</h3>
                        <div className="number">{customers?.length || 0}</div>
                    </div>
                    <div className="stat-icon icon-bg-green">
                        <FaUsers />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Total Products</h3>
                        <div className="number">{allProducts?.length || 0}</div>
                    </div>
                    <div className="stat-icon icon-bg-orange">
                        <FaBoxOpen />
                    </div>
                </div>
                <div className="stat-card-simple">
                    <div className="stat-content">
                        <h3>Total Revenue</h3>
                        <div className="number">৳ {financialStats?.totalSales?.toLocaleString() || '0'}</div>
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
                    <h3>Monthly Sales</h3>
                    <div className="number">৳ {financialStats?.monthlySales?.toLocaleString() || '0'}</div>
                </div>
                <div className="colored-card bg-green">
                    <FaArrowUp className="card-icon" />
                    <h3>Active Sellers</h3>
                    <div className="number">{sellers?.length || 0}</div>
                </div>
                <div className="colored-card bg-dark">
                    <FaArrowDown className="card-icon" />
                    <h3>Pending Withdrawals</h3>
                    <div className="number">৳ {financialStats?.pendingWithdrawals?.toLocaleString() || '0'}</div>
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
                    <button style={{ color: '#4361ee', border: 'none', background: 'none', fontSize: '14px', cursor: 'pointer' }}>View All</button>
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
                            {orders?.slice(0, 5).map((order) => (
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
                            )) || (
                                    <>
                                        <tr>
                                            <td>#ORD-7752</td>
                                            <td>John Doe</td>
                                            <td>AirPods Pro</td>
                                            <td>৳ 1,200</td>
                                            <td><span className="status-badge success">Delivered</span></td>
                                        </tr>
                                        <tr>
                                            <td>#ORD-7753</td>
                                            <td>Jane Smith</td>
                                            <td>Sneaker Shoes</td>
                                            <td>৳ 2,500</td>
                                            <td><span className="status-badge warning">Pending</span></td>
                                        </tr>
                                    </>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
