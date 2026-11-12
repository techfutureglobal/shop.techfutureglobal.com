import React, { useContext, useMemo } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaBoxes, FaExclamationTriangle, FaChartLine, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const SellerStockManagement = ({ sellerId }) => {
    const { allProducts } = useContext(ShopContext);

    // Filter products for this seller only
    const sellerProducts = useMemo(() => {
        return (allProducts || []).filter(p => p.sellerId === sellerId);
    }, [allProducts, sellerId]);

    // Analytics
    const lowStockThreshold = 10;
    const lowStockProducts = sellerProducts.filter(p => (p.stock || 0) <= lowStockThreshold && (p.stock || 0) > 0);
    const outOfStockProducts = sellerProducts.filter(p => (p.stock || 0) === 0);

    // Sort by sold count for High/Low selling
    const highSellingProducts = [...sellerProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
    const lowSellingProducts = [...sellerProducts].sort((a, b) => (a.sold || 0) - (b.sold || 0)).slice(0, 5);

    // Helper for stock status color
    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: '#e7515a', bg: 'rgba(231, 81, 90, 0.1)' };
        if (stock <= 10) return { label: 'Low Stock', color: '#e2a03f', bg: 'rgba(226, 160, 63, 0.1)' };
        return { label: 'In Stock', color: '#1abc9c', bg: 'rgba(26, 188, 156, 0.1)' };
    };

    return (
        <div className="seller-stock-management">
            <h2 className="section-title">Stock Management</h2>

            {/* Quick Stats */}
            <div className="stats-cards-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card-premium">
                    <div className="stat-card-left">
                        <div className="icon-box" style={{ background: 'rgba(231, 81, 90, 0.1)', color: '#e7515a' }}>
                            <FaExclamationTriangle />
                        </div>
                        <div className="stat-info">
                            <span>Out of Stock</span>
                            <h2>{outOfStockProducts.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="stat-card-premium">
                    <div className="stat-card-left">
                        <div className="icon-box" style={{ background: 'rgba(226, 160, 63, 0.1)', color: '#e2a03f' }}>
                            <FaBoxes />
                        </div>
                        <div className="stat-info">
                            <span>Low Stock Items</span>
                            <h2>{lowStockProducts.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="stat-card-premium">
                    <div className="stat-card-left">
                        <div className="icon-box" style={{ background: 'rgba(26, 188, 156, 0.1)', color: '#1abc9c' }}>
                            <FaChartLine />
                        </div>
                        <div className="stat-info">
                            <span>Total Products</span>
                            <h2>{sellerProducts.length}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Alerts */}
            <div className="report-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaExclamationTriangle color="#e2a03f" /> Stock Alerts
                </h3>
                <div className="orders-table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Current Stock</th>
                                <th>Sold</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...outOfStockProducts, ...lowStockProducts].map(product => {
                                const status = getStockStatus(product.stock || 0);
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={product.image} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                                <span>{product.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: status.color }}>{product.stock || 0}</td>
                                        <td>{product.sold || 0}</td>
                                        <td>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                background: status.bg,
                                                color: status.color
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {[...outOfStockProducts, ...lowStockProducts].length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888ea8' }}>
                                        No stock alerts. All products are well stocked!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sales Performance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                {/* Top Selling */}
                <div className="report-card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaArrowUp color="#1abc9c" /> Top Selling Products
                    </h3>
                    <div className="orders-table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Sold</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {highSellingProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={product.image} alt={product.title} style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'cover' }} />
                                                <span style={{ fontSize: '13px' }}>{product.title.substring(0, 30)}...</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: '#1abc9c' }}>{product.sold || 0}</td>
                                        <td>{product.stock || 0}</td>
                                    </tr>
                                ))}
                                {highSellingProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888ea8' }}>
                                            No sales data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Selling */}
                <div className="report-card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaArrowDown color="#e7515a" /> Low Selling Products
                    </h3>
                    <div className="orders-table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Sold</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowSellingProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={product.image} alt={product.title} style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'cover' }} />
                                                <span style={{ fontSize: '13px' }}>{product.title.substring(0, 30)}...</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: '#e7515a' }}>{product.sold || 0}</td>
                                        <td>{product.stock || 0}</td>
                                    </tr>
                                ))}
                                {lowSellingProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888ea8' }}>
                                            No sales data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* All Product Stock Overview */}
            <div className="report-card">
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBoxes color="#4361ee" /> All Product Stock
                </h3>
                <div className="orders-table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Stock Level</th>
                                <th>Sold</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellerProducts.map(product => {
                                const status = getStockStatus(product.stock || 0);
                                const stockPercentage = Math.min(((product.stock || 0) / 100) * 100, 100);
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={product.image} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                                <span>{product.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>৳{product.price}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ flex: 1, background: '#e0e6ed', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${stockPercentage}%`,
                                                        height: '100%',
                                                        background: status.color,
                                                        transition: 'width 0.3s'
                                                    }}></div>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '30px' }}>{product.stock || 0}</span>
                                            </div>
                                        </td>
                                        <td>{product.sold || 0}</td>
                                        <td>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                background: status.bg,
                                                color: status.color
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sellerProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888ea8' }}>
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerStockManagement;
