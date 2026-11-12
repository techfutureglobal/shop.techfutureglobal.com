import React, { useState, useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaThLarge, FaStore, FaBoxOpen, FaList, FaChevronLeft, FaMoneyBillWave, FaShippingFast, FaCommentDots } from 'react-icons/fa';
import { ShopContext } from '../../context/ShopContext';
import '../Admin/Admin.css';

const SellerLayout = () => {
    const { user, logout } = useContext(ShopContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!user || user.role !== 'seller') {
        window.location.href = '/'; // Fallback if ProtectedRoute fails
        return null;
    }

    return (
        <div className="admin-container">
            {/* Mobile Hamburger Header */}
            <div className="admin-mobile-header">
                <h2>Seller Center</h2>
                <button onClick={toggleSidebar}>
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <h2>Ebaybd</h2>
                </div>
                <nav>
                    <div className="nav-category">Analytics</div>
                    <NavLink to="/seller" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaThLarge /> Dashboard
                    </NavLink>
                    <NavLink
                        to={`/store/${user?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-link"
                        style={{ color: '#00b5ff', fontWeight: 'bold' }}
                    >
                        <FaStore /> Preview Landing Page
                    </NavLink>
                    <NavLink to="/seller/store" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaStore /> My Shop
                    </NavLink>
                    <NavLink to="/seller/chats" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaCommentDots /> Messages
                    </NavLink>

                    <div className="nav-category">Shop</div>
                    <NavLink to="/seller/products" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaBoxOpen /> Product
                    </NavLink>
                    <NavLink to="/seller/categories" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaList /> Categories
                    </NavLink>
                    <NavLink to="/seller/stock" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaThLarge /> Stock Management
                    </NavLink>
                    <NavLink to="/seller/orders" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaShippingFast /> Orders
                    </NavLink>
                    <NavLink to="/seller/withdrawals" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaMoneyBillWave /> Withdrawals
                    </NavLink>
                    <NavLink to="/seller/payments" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaMoneyBillWave /> Payment Settings
                    </NavLink>

                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        <NavLink to="/" onClick={() => setIsSidebarOpen(false)}>
                            <FaChevronLeft /> Back to Site
                        </NavLink>
                        <div onClick={() => { logout(); window.location.href = '/'; }} style={{ display: 'flex', alignItems: 'center', padding: '12px 25px', color: '#e7515a', cursor: 'pointer', fontSize: '15px' }}>
                            <FaChevronLeft style={{ marginRight: '10px' }} /> Logout
                        </div>
                    </div>
                </nav>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default SellerLayout;
