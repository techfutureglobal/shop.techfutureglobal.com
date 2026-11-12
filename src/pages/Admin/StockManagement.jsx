import React, { useContext, useMemo } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaBoxes, FaExclamationTriangle, FaChartLine, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const StockManagement = () => {
    const { user, allProducts: contextAllProducts } = useContext(ShopContext);

    // Filter products based on user role
    const allProducts = useMemo(() => {
        if (!user) return [];
        if (user.role === 'admin') return contextAllProducts;
        return contextAllProducts.filter(p => p.sellerId === user.id);
    }, [contextAllProducts, user]);

    // Analytics
    const lowStockThreshold = 10;
    const lowStockProducts = allProducts.filter(p => (p.stock || 0) <= lowStockThreshold && (p.stock || 0) > 0);
    const outOfStockProducts = allProducts.filter(p => (p.stock || 0) === 0);

    // Sort by sold count for High/Low selling
    const highSellingProducts = [...allProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
    const lowSellingProducts = [...allProducts].sort((a, b) => (a.sold || 0) - (b.sold || 0)).slice(0, 5);

    // Helper for stock status color
    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: '#e7515a', bg: 'rgba(231, 81, 90, 0.1)' };
        if (stock <= 10) return { label: 'Low Stock', color: '#e2a03f', bg: 'rgba(226, 160, 63, 0.1)' };
        return { label: 'In Stock', color: '#1abc9c', bg: 'rgba(26, 188, 156, 0.1)' };
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1>Stock & Sales Management</h1>
                    <div style={{ fontSize: '14px', color: '#888ea8' }}>Monitor inventory levels and sales performance</div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(231, 81, 90, 0.1)', color: '#e7515a' }}>
                        <FaExclamationTriangle />
                    </div>
                    <div className="stat-info">
                        <h3>{outOfStockProducts.length}</h3>
                        <p>Out of Stock</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(226, 160, 63, 0.1)', color: '#e2a03f' }}>
                        <FaBoxes />
                    </div>
                    <div className="stat-info">
                        <h3>{lowStockProducts.length}</h3>
                        <p>Low Stock Items</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' }}>
                        <FaChartLine />
                    </div>
                    <div className="stat-info">
                        <h3>{allProducts.length}</h3>
                        <p>Total Products</p>
                    </div>
                </div>
            </div>

            <div className="grid-responsive-2" style={{ marginTop: '30px' }}>
                {/* Low Stock Alerts */}
                <div className="admin-card">
                    <div className="card-header" style={{ borderBottom: '1px solid #e0e6ed', paddingBottom: '15px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaExclamationTriangle color="#e2a03f" /> Stock Alerts
                        </h3>
                    </div>
                    <div className="table-wrapper-scroll" style={{ maxHeight: '300px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                            <thead>
                                <tr style={{ color: '#888ea8', fontSize: '12px', borderBottom: '1px solid #eee' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Product</th>
                                    <th style={{ textAlign: 'center', padding: '10px' }}>Stock</th>
                                    <th style={{ textAlign: 'center', padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...outOfStockProducts, ...lowStockProducts].map(p => {
                                    const status = getStockStatus(p.stock || 0);
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px dashed #eee' }}>
                                            <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                                                <div style={{ fontWeight: '500', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{p.title}</div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.stock || 0}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="status-badge" style={{ background: status.bg, color: status.color, whiteSpace: 'nowrap' }}>{status.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {[...outOfStockProducts, ...lowStockProducts].length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No stock alerts at the moment.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sales Performance (High Selling) */}
                <div className="admin-card">
                    <div className="card-header" style={{ borderBottom: '1px solid #e0e6ed', paddingBottom: '15px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaArrowUp color="#1abc9c" /> Top Selling Products
                        </h3>
                    </div>
                    <div className="table-wrapper-scroll" style={{ maxHeight: '300px' }}>
                        <div style={{ minWidth: '350px' }}>
                            {highSellingProducts.map((p, idx) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderBottom: '1px solid #f9f9f9' }}>
                                    <div style={{ fontWeight: 'bold', color: '#888', width: '20px' }}>{idx + 1}</div>
                                    <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>Price: ৳{p.price}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <div style={{ fontWeight: 'bold', color: '#1abc9c' }}>{p.sold || 0} Sold</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sales Performance (Low Selling) */}
                <div className="admin-card">
                    <div className="card-header" style={{ borderBottom: '1px solid #e0e6ed', paddingBottom: '15px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaArrowDown color="#e7515a" /> Low Selling Products
                        </h3>
                    </div>
                    <div className="table-wrapper-scroll" style={{ maxHeight: '300px' }}>
                        <div style={{ minWidth: '350px' }}>
                            {lowSellingProducts.map((p) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderBottom: '1px solid #f9f9f9' }}>
                                    <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>Price: ৳{p.price}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <div style={{ fontWeight: 'bold', color: '#e7515a' }}>{p.sold || 0} Sold</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* General Stock Overview */}
                <div className="admin-card">
                    <div className="card-header" style={{ borderBottom: '1px solid #e0e6ed', paddingBottom: '15px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>All Product Stock</h3>
                    </div>
                    <div className="table-wrapper-scroll" style={{ maxHeight: '300px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '350px' }}>
                            <thead>
                                <tr style={{ color: '#888ea8', fontSize: '12px', borderBottom: '1px solid #eee' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Product</th>
                                    <th style={{ textAlign: 'center', padding: '10px' }}>Stock Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProducts.map(p => {
                                    const percentage = Math.min(((p.stock || 0) / 100) * 100, 100);
                                    const color = (p.stock || 0) < 10 ? '#e7515a' : (p.stock || 0) < 30 ? '#e2a03f' : '#1abc9c';
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '8px 10px', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{p.title}</td>
                                            <td style={{ padding: '8px 10px', width: '40%', minWidth: '120px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ flex: 1, height: '6px', background: '#eee', borderRadius: '3px' }}>
                                                        <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '3px' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', width: '30px', textAlign: 'right' }}>{p.stock || 0}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StockManagement;
