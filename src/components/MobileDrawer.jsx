import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaList, FaLink, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { ShopContext } from '../context/ShopContext';
import './MobileDrawer.css';

const MobileDrawer = ({ isOpen, onClose, menus, categories }) => {
    const { getMenuByLocation, siteConfig } = React.useContext(ShopContext);
    const { header } = siteConfig || {};
    const [activeTab, setActiveTab] = React.useState('menus'); // 'menus' | 'categories'
    const [expandedCats, setExpandedCats] = React.useState({});
    const [expandedSubCats, setExpandedSubCats] = React.useState({});
    const navigate = useNavigate();

    const toggleCat = (e, id) => {
        e.stopPropagation();
        setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCatClick = (catName) => {
        navigate(`/shop?category=${encodeURIComponent(catName)}`);
        onClose();
    };

    const handleSubItemClick = (itemName) => {
        navigate(`/shop?category=${encodeURIComponent(itemName)}`);
        onClose();
    };

    const toggleSubCat = (e, catId, subIdx) => {
        e.stopPropagation();
        const key = `${catId}-${subIdx}`;
        setExpandedSubCats(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const dynamicMiddleLinks = getMenuByLocation('primary');
    const configMiddleLinks = header?.middleBarLinks || [];

    let finalMiddleLinks = [];
    if (dynamicMiddleLinks.length > 0) {
        finalMiddleLinks = dynamicMiddleLinks;
    } else if (configMiddleLinks.length > 0) {
        finalMiddleLinks = configMiddleLinks;
    } else {
        finalMiddleLinks = [
            { text: 'Offer Products', url: '/shop?type=flash' },
            { text: 'Ebaybd Mall', url: '#' },
            { text: 'Voucher', url: '#' },
            { text: 'Global Collection', url: '#' }
        ];
    }

    return (
        <div className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`mobile-drawer-content ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <div className="drawer-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'menus' ? 'active' : ''}`}
                            onClick={() => setActiveTab('menus')}
                        >
                            Menus
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            Categories
                        </button>
                    </div>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="drawer-body">
                    {activeTab === 'menus' ? (
                        <div className="drawer-nav-list">
                            {/* Primary Navigation Links */}
                            <a href="/shop" className="drawer-nav-item highlight-item" onClick={(e) => { e.preventDefault(); navigate('/shop'); onClose(); }}>
                                <span className="icon-wrap"><FaLink /></span>
                                Shop All Products
                                <FaChevronRight className="arrow" />
                            </a>

                            {finalMiddleLinks.map((link, idx) => (
                                <a key={link.id || idx} href={link.url} className="drawer-nav-item" onClick={(e) => { e.preventDefault(); navigate(link.url); onClose(); }}>
                                    <span className="icon-wrap"><FaLink /></span>
                                    {link.text}
                                    <FaChevronRight className="arrow" />
                                </a>
                            ))}

                            <div className="drawer-divider"></div>

                            {/* Dynamic Top Bar Menus */}
                            {menus.map((menu, idx) => (
                                <a key={idx} href={menu.url} className="drawer-nav-item" onClick={(e) => { e.preventDefault(); navigate(menu.url); onClose(); }}>
                                    <span className="icon-wrap"><FaLink /></span>
                                    {menu.text}
                                    <FaChevronRight className="arrow" />
                                </a>
                            ))}

                            {/* Auth & Dashboard for Mobile */}
                            {siteConfig && (
                                <>
                                    <div className="drawer-divider"></div>
                                    {localStorage.getItem('user') ? (
                                        <>
                                            <div className="drawer-user-info" style={{ padding: '15px 20px', color: '#888', fontSize: '14px' }}>
                                                Logged in as: <strong style={{ color: 'var(--text-color)' }}>{JSON.parse(localStorage.getItem('user')).full_name || 'User'}</strong>
                                            </div>
                                            <a href={
                                                JSON.parse(localStorage.getItem('user')).role === 'seller' ? '/seller/dashboard' :
                                                    JSON.parse(localStorage.getItem('user')).role === 'reseller' ? '/reseller/dashboard' :
                                                        JSON.parse(localStorage.getItem('user')).role === 'customer' ? '/customer/dashboard' : '/admin'
                                            } className="drawer-nav-item" style={{ color: '#ff6b00', fontWeight: 'bold' }} onClick={(e) => {
                                                e.preventDefault();
                                                const path = JSON.parse(localStorage.getItem('user')).role === 'seller' ? '/seller/dashboard' :
                                                    JSON.parse(localStorage.getItem('user')).role === 'reseller' ? '/reseller/dashboard' :
                                                        JSON.parse(localStorage.getItem('user')).role === 'customer' ? '/customer/dashboard' : '/admin';
                                                navigate(path);
                                                onClose();
                                            }}>
                                                <span className="icon-wrap"><FaLink /></span>
                                                My Dashboard
                                                <FaChevronRight className="arrow" />
                                            </a>
                                            <div className="drawer-nav-item" onClick={() => { localStorage.removeItem('user'); navigate('/'); onClose(); }} style={{ color: '#e7515a', cursor: 'pointer' }}>
                                                <span className="icon-wrap"><FaLink /></span>
                                                Logout
                                                <FaChevronRight className="arrow" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <a href="/login" className="drawer-nav-item" onClick={(e) => { e.preventDefault(); navigate('/login'); onClose(); }}>
                                                <span className="icon-wrap"><FaLink /></span>
                                                Login
                                                <FaChevronRight className="arrow" />
                                            </a>
                                            <a href="/signup" className="drawer-nav-item" onClick={(e) => { e.preventDefault(); navigate('/signup'); onClose(); }}>
                                                <span className="icon-wrap"><FaLink /></span>
                                                Sign Up
                                                <FaChevronRight className="arrow" />
                                            </a>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="drawer-cat-list">
                            {categories.map((cat) => (
                                <div key={cat.id} className="drawer-cat-item">
                                    <div className="cat-main" onClick={() => handleCatClick(cat.name)}>
                                        {cat.img ? (
                                            <img src={cat.img} alt={cat.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                        ) : (
                                            <FaList className="cat-icon" />
                                        )}
                                        <span>{cat.name}</span>
                                        {cat.subcategories && (
                                            <span className="toggle-arrow" onClick={(e) => toggleCat(e, cat.id)}>
                                                {expandedCats[cat.id] ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>
                                        )}
                                    </div>

                                    {cat.subcategories && expandedCats[cat.id] && (
                                        <div className="drawer-subcat-list">
                                            {cat.subcategories.map((sub, sidx) => (
                                                <div key={sidx} className="sub-group">
                                                    <div className="sub-title" onClick={(e) => toggleSubCat(e, cat.id, sidx)}>
                                                        {sub.title}
                                                        <span className="toggle-arrow">
                                                            {expandedSubCats[`${cat.id}-${sidx}`] ? <FaChevronDown /> : <FaChevronRight />}
                                                        </span>
                                                    </div>

                                                    {expandedSubCats[`${cat.id}-${sidx}`] && (
                                                        <div className="child-list">
                                                            {sub.items.map((item, iidx) => (
                                                                <div key={iidx} onClick={() => handleSubItemClick(item)} className="sub-item" style={{ cursor: 'pointer' }}>
                                                                    {item}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileDrawer;
