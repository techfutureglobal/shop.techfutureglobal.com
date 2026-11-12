import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoGridOutline, IoChatbubbleOutline, IoCartOutline, IoPersonOutline } from 'react-icons/io5';
import { ShopContext } from '../context/ShopContext';
import './BottomNav.css';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, user } = useContext(ShopContext);

    const accountPath = user 
        ? (user.role === 'seller' ? '/seller/dashboard' : user.role === 'reseller' ? '/reseller/dashboard' : user.role === 'customer' ? '/customer/dashboard' : '/admin') 
        : '/login';

    const navItems = [
        { id: 'home', label: 'Home', icon: <IoHomeOutline />, path: '/' },
        { id: 'categories', label: 'Categories', icon: <IoGridOutline />, path: '/categories' },
        { id: 'messenger', label: 'Messenger', icon: <IoChatbubbleOutline />, path: 'chat' },
        { id: 'cart', label: 'Cart', icon: <IoCartOutline />, path: '/checkout', badge: cart?.length || 0 },
        { id: 'account', label: 'My Ebaybd', icon: <IoPersonOutline />, path: accountPath }
    ];

    const handleNav = (item) => {
        if (item.id === 'messenger') {
            const chatBtn = document.querySelector('.chat-toggle-btn');
            if (chatBtn) {
                chatBtn.click();
            }
            return;
        }
        navigate(item.path);
    };

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <div
                    key={item.id}
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNav(item)}
                >
                    <div className="nav-icon">
                        {item.icon}
                        {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                    </div>
                    <span className="nav-label">{item.label}</span>
                </div>
            ))}
        </nav>
    );
};

export default BottomNav;
