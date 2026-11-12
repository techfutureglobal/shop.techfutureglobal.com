import React, { useState, useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaBoxOpen, FaChevronLeft } from 'react-icons/fa';
import { ShopContext } from '../../context/ShopContext';
import '../Admin/Admin.css'; // Reuse admin styling

const CustomerLayout = () => {
    const { user, logout } = useContext(ShopContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!user) {
        window.location.href = '/login';
        return null;
    }

    return (
        <div className="admin-container">
            {/* Mobile Hamburger Header */}
            <div className="admin-mobile-header">
                <h2>My Dashboard</h2>
                <button onClick={toggleSidebar}>
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <h2>{user.full_name || user.name || 'Customer'}</h2>
                </div>
                <nav>
                    <div className="nav-category">Orders</div>
                    <NavLink to="/customer/dashboard" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaBoxOpen /> Order Tracking
                    </NavLink>

                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', paddingBottom: '20px' }}>
                        <NavLink to="/" onClick={() => setIsSidebarOpen(false)}>
                            <FaChevronLeft /> Back to Site
                        </NavLink>
                        <div onClick={async () => { await logout(); window.location.href = '/'; }} style={{ padding: '12px 25px', color: '#e7515a', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '15px' }}>
                            <FaChevronLeft style={{ marginRight: '12px' }} /> Logout
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

export default CustomerLayout;
