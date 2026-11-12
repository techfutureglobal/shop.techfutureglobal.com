import React, { useState, useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaThLarge, FaStore, FaBoxOpen, FaList, FaUsers, FaUserFriends, FaEdit, FaChevronLeft, FaMoneyBillWave, FaShippingFast, FaFileAlt, FaChartPie, FaCommentDots, FaAmbulance, FaIdCard } from 'react-icons/fa';
import { ShopContext } from '../../context/ShopContext';
import AdminLogin from './AdminLogin';
import './Admin.css';

const AdminLayout = () => {
    const { user } = useContext(ShopContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!user || user.role !== 'admin') {
        return <AdminLogin />;
    }

    return (
        <div className="admin-container">
            {/* Mobile Hamburger Header */}
            <div className="admin-mobile-header">
                <h2>Admin</h2>
                <button onClick={toggleSidebar}>
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <h2>EbayBD</h2>
                </div>
                <nav>
                    <div className="nav-category">Analytics</div>
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaThLarge /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/store" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaStore /> My Shop
                    </NavLink>

                    <div className="nav-category">Users</div>
                    <NavLink to="/admin/approvals" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaIdCard /> Registration Approvals
                    </NavLink>
                    <NavLink to="/admin/sellers" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaUsers /> Sellers
                    </NavLink>
                    <NavLink to="/admin/resellers" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaUserFriends /> Resellers
                    </NavLink>
                    <NavLink to="/admin/chats" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaCommentDots /> Messages
                    </NavLink>

                    <div className="nav-category">Shop</div>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaBoxOpen /> Product
                    </NavLink>
                    <NavLink to="/admin/stock" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaThLarge /> Stock Management
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaList /> Categories
                    </NavLink>
                    <NavLink to="/admin/couriers" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaShippingFast /> Courier Settings
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaShippingFast /> Admin Orders
                    </NavLink>
                    <NavLink to="/admin/withdrawals" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaMoneyBillWave /> Withdrawals
                    </NavLink>
                    <NavLink to="/admin/payments" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaMoneyBillWave /> Payment Settings
                    </NavLink>
                    <NavLink to="/admin/financial" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaChartPie /> Financial Settings
                    </NavLink>
                    <NavLink to="/admin/editor" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaEdit /> Site Editor
                    </NavLink>
                    <NavLink to="/admin/menus" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaBars /> Menus
                    </NavLink>
                    <NavLink to="/admin/pages" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaFileAlt /> Pages
                    </NavLink>
                    <NavLink to="/admin/emergency" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                        <FaAmbulance /> Emergency Services
                    </NavLink>

                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', paddingBottom: '20px' }}>
                        <NavLink to="/" onClick={() => setIsSidebarOpen(false)}>
                            <FaChevronLeft /> Back to Site
                        </NavLink>
                        <div onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} style={{ padding: '12px 25px', color: '#e7515a', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '15px' }}>
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

export default AdminLayout;
