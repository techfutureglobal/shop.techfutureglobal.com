import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { IoChevronForwardOutline, IoListOutline } from 'react-icons/io5';
import './CategoriesMenu.css';

const CategoriesMenu = () => {
    const { categories, getMenuByLocation, siteConfig } = useContext(ShopContext);
    const [activeCategory, setActiveCategory] = useState(null);
    const { header } = siteConfig || {};
    const navigate = useNavigate();

    const handleCatClick = (catName) => {
        navigate(`/shop?category=${encodeURIComponent(catName)}`);
    };


    // Get dynamic links from menu system
    const finalPrimaryLinks = getMenuByLocation('primary');

    return (
        <div className="categories-nav">
            <div className="container">
                <div className="mega-menu-container">
                    {/* The Trigger Button */}
                    <div className="categories-trigger">
                        <IoListOutline size={20} />
                        <span>Categories</span>

                        {/* The Actual Dropdown Mega Menu */}
                        <div className="mega-menu-dropdown">
                            <div className="sidebar-main">
                                {Array.from(new Map((categories || []).map(cat => [cat.id, cat])).values()).map((cat) => (
                                    <div
                                        key={cat.id}
                                        className={`cat-item ${activeCategory?.id === cat.id ? 'curr' : ''}`}
                                        onMouseEnter={() => setActiveCategory(cat)}
                                    >
                                        <div className="cat-link" onClick={() => handleCatClick(cat.name)} style={{ cursor: 'pointer' }}>
                                            <span>{cat.name}</span>
                                            {cat.subcategories && <IoChevronForwardOutline className="arrow" size={14} />}
                                        </div>

                                        {/* Nested Mega Panel */}
                                        {cat.subcategories && (
                                            <div className="mega-panel">
                                                <div className="mega-content-grid">
                                                    {cat.subcategories.map((sub, idx) => (
                                                        <div key={idx} className="mega-column">
                                                            <h4 className="mega-heading" onClick={() => handleCatClick(sub.title)} style={{ cursor: 'pointer' }}>{sub.title}</h4>
                                                            <div className="mega-links">
                                                                {sub.items.map((item, i) => (
                                                                    <a key={i} href={`/shop?category=${encodeURIComponent(item)}`} className="mega-link-item">
                                                                        {item}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="mega-promotion-banner">
                                                        <div className="promo-card">
                                                            <span>Special Offer</span>
                                                            <h3>{cat.name}</h3>
                                                            <button onClick={() => handleCatClick(cat.name)}>Shop Now</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Other Nav Links (Optional Daraz Style) */}
                    <div className="other-nav-links">
                        {finalPrimaryLinks.map((link, idx) => (
                            <a key={link.id || idx} href={link.url}>{link.text}</a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesMenu;
