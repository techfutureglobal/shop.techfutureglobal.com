import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { IoMenuOutline } from 'react-icons/io5';
import { FiShoppingBag, FiHeart, FiChevronDown, FiUser, FiMoreVertical } from 'react-icons/fi';
import CategoriesMenu from './CategoriesMenu';
import MobileDrawer from './MobileDrawer';
import { ShopContext } from '../context/ShopContext';
import './Header.css';
import './MobileUI.css';

import { useNavigate } from 'react-router-dom';

// Header Component: Contains the Top Bar and the Main Search Bar area
const Header = () => {
  const { user, logout, siteConfig, cart, categories, allProducts, getMenuByLocation, openCart } = useContext(ShopContext);
  const { header } = siteConfig || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Cart totals
  const cartItemCount = cart?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;
  const cartTotal = cart?.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0) || 0;

  // Selected category label
  const selectedCatLabel = selectedCategory === 'all'
    ? 'SELECT CATEGORY'
    : (categories?.find(c => String(c.id) === String(selectedCategory))?.name || 'SELECT CATEGORY');

  // Get dynamic links from menu system
  const finalTopLinks = getMenuByLocation('topBar');

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0 && allProducts) {
      let filtered = allProducts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Filter by selected category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => String(p.category_id) === String(selectedCategory));
      }
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, selectedCategory, allProducts]);

  const openAuth = (mode) => {
    navigate(mode === 'signup' ? '/signup' : '/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const query = `/shop?search=${encodeURIComponent(searchTerm.trim())}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''
        }`;
      navigate(query);
      setShowSuggestions(false);
      setIsCatDropdownOpen(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const dashboardLink = user?.role === 'seller' ? '/seller/dashboard' : user?.role === 'reseller' ? '/reseller/dashboard' : user?.role === 'customer' ? '/customer/dashboard' : '/admin';


  return (
    <>
      {/* Mobile Header Improvements: Two-Row Layout */}
      <div className={`mobile-search-area ${isSticky ? 'sticky' : ''}`}>
        {/* Row 1: Logo & Icons */}
        <div className="mobile-header-row-top">
          <div className="mobile-logo-side">
            <button className="mobile-hamburger" onClick={() => setIsDrawerOpen(true)}>
              <IoMenuOutline size={28} />
            </button>
            <Link to="/" className="mobile-logo">
              {header?.logoImage ? (
                <img src={header.logoImage} alt="Logo" style={{ height: '32px' }} />
              ) : (
                <h1 style={{ fontSize: '20px', color: 'var(--primary-color)', margin: 0, fontWeight: '800' }}>{(header?.logoText || 'EbayBD')}</h1>
              )}
            </Link>
          </div>

          <div className="mobile-header-right-icons">
             {/* User Icon for Mobile */}
            {user ? (
               <Link to={dashboardLink} className="mobile-icon-link">
                 <FiUser size={24} />
               </Link>
            ) : (
               <button className="mobile-icon-link" onClick={() => openAuth('login')}>
                 <FiUser size={24} />
               </button>
            )}

            <button className="mobile-cart-btn" onClick={openCart} aria-label="Open Cart">
              <FiShoppingBag size={24} />
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </button>
          </div>
        </div>

        {/* Row 2: Full Width Search Bar with Category Select */}
        <div className="mobile-header-row-bottom">
          <div className="mobile-search-bar">
            {/* Mobile Category Trigger */}
            <div 
              className="mobile-cat-trigger"
              onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
            >
              <span className="mobile-cat-tag">
                {selectedCategory === 'all' ? 'ALL' : (categories?.find(c => String(c.id) === String(selectedCategory))?.name?.substring(0, 4) || 'CAT')}
              </span>
              <FiChevronDown size={12} className={isCatDropdownOpen ? 'rotate-180' : ''} />
            </div>

            {isCatDropdownOpen && (
              <div className="mobile-cat-dropdown-overlay" onClick={() => setIsCatDropdownOpen(false)}>
                <ul className="mobile-cat-list" onClick={e => e.stopPropagation()}>
                  <li 
                    className={selectedCategory === 'all' ? 'active' : ''}
                    onClick={() => { setSelectedCategory('all'); setIsCatDropdownOpen(false); }}
                  >
                    All Categories
                  </li>
                  {categories?.map(cat => (
                    <li 
                      key={cat.id}
                      className={String(selectedCategory) === String(cat.id) ? 'active' : ''}
                      onClick={() => { setSelectedCategory(String(cat.id)); setIsCatDropdownOpen(false); }}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mobile-search-inner">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.trim().length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
              />
              <button onClick={handleSearch} className="mobile-search-confirm">
                <BsSearch size={18} />
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions mobile-suggestions">
                {suggestions.map(p => (
                  <div key={p.id} className="suggestion-item" onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(p.id); }}>
                    <img src={p.image} alt={p.title} />
                    <div className="suggestion-info">
                      <span className="suggestion-title">{p.title}</span>
                      <span className="suggestion-price">৳{p.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        menus={finalTopLinks}
        categories={categories || []}
      />

      <header className="header">

        {/* Main Header Area */}
        <div className="main-header">
          <div className="container flex justify-between align-center">
            {/* Logo Section */}
            <div className="logo-section">
              <Link to="/" className="logo">
                {header?.logoImage ? (
                  <img src={header.logoImage} alt={header.logoText} className="header-logo-img" />
                ) : (
                  <h1 className="ebaybd-logo-text">{header?.logoText || 'EbayBD'}</h1>
                )}
              </Link>
              <Link to="/shop" className="desktop-shop-link">
                Shop
              </Link>
            </div>

            {/* Search Bar Section */}
            <div className="search-bar-container">
              <form className="search-bar" onSubmit={handleSearch}>
                <div className="typing-bubbles" id="typing-bubbles"></div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search for products"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    const container = document.getElementById('typing-bubbles');
                    if (container) {
                      for (let i = 0; i < 3; i++) {
                        const bubble = document.createElement('div');
                        bubble.className = 'bubble';
                        const size = Math.random() * 20 + 5;
                        bubble.style.width = `${size}px`;
                        bubble.style.height = `${size}px`;
                        bubble.style.left = `${Math.random() * 90 + 5}%`;
                        bubble.style.animationDelay = `${Math.random() * 0.5}s`;
                        container.appendChild(bubble);
                        setTimeout(() => bubble.remove(), 2500);
                      }
                    }
                  }}
                  onFocus={() => searchTerm.trim().length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                />

                {/* Category Divider + Dropdown */}
                <div className="search-cat-divider" />
                <div
                  className="search-cat-dropdown"
                  onClick={() => setIsCatDropdownOpen(prev => !prev)}
                  onBlur={() => setTimeout(() => setIsCatDropdownOpen(false), 200)}
                  tabIndex={0}
                >
                  <span className="search-cat-label">{selectedCatLabel}</span>
                  <FiChevronDown size={14} className={`cat-chevron${isCatDropdownOpen ? ' open' : ''}`} />

                  {isCatDropdownOpen && (
                    <ul className="cat-dropdown-list">
                      <li
                        className={selectedCategory === 'all' ? 'active' : ''}
                        onMouseDown={() => { setSelectedCategory('all'); setIsCatDropdownOpen(false); }}
                      >
                        All Categories
                      </li>
                      {categories?.map(cat => (
                        <li
                          key={cat.id}
                          className={String(selectedCategory) === String(cat.id) ? 'active' : ''}
                          onMouseDown={() => { setSelectedCategory(String(cat.id)); setIsCatDropdownOpen(false); }}
                        >
                          {cat.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Search Button */}
                <button type="submit" className="search-btn">
                  <BsSearch color="white" size={20} />
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map(p => (
                    <div key={p.id} className="suggestion-item" onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(p.id); }}>
                      <img src={p.image} alt={p.title} />
                      <div className="suggestion-info">
                        <span className="suggestion-title">{p.title}</span>
                        <div className="suggestion-meta">
                          <span className="suggestion-price">৳{p.price}</span>
                          {p.discount && <span className="suggestion-discount">-{p.discount}%</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="suggestion-footer" onMouseDown={(e) => { e.preventDefault(); handleSearch(e); }}>
                    See all results for "{searchTerm}"
                  </div>
                </div>
              )}
            </div>


            {/* Right Actions: Login + Wishlist + Cart */}
            <div className="header-actions">

              {/* Login / Register */}
              {user ? (
                <div className="user-profile-menu">
                  <Link to={dashboardLink} className="header-action-btn">
                    <FiUser size={20} />
                    <span className="header-action-label">MY DASHBOARD</span>
                  </Link>
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <span>Logged in as:</span>
                      <strong>{user.full_name || 'User'}</strong>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link to={dashboardLink} className="user-dropdown-item">
                      My Dashboard
                    </Link>
                    <button 
                      onClick={async () => { await logout(); window.location.href = '/'; }}
                      className="user-dropdown-item logout-btn"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="header-action-btn">
                  <FiUser size={20} />
                  <span className="header-action-label">LOGIN / REGISTER</span>
                </Link>
              )}

              {/* Wishlist */}
              <button className="header-action-btn">
                <div className="header-icon-wrap">
                  <FiHeart size={22} />
                  <span className="header-icon-badge">0</span>
                </div>
                <span className="header-action-label">WISHLIST</span>
              </button>

              {/* Cart — bag icon + price + count */}
              <button className="header-cart-btn" onClick={openCart} aria-label="Open Cart">
                <div className="header-cart-icon-wrap">
                  <FiShoppingBag size={26} />
                  {cartItemCount > 0 && (
                    <span className="header-cart-badge">{cartItemCount}</span>
                  )}
                </div>
                <div className="header-cart-info">
                  <span className="header-cart-price">৳{cartTotal.toLocaleString()}</span>
                  <span className="header-cart-count">{cartItemCount} items</span>
                </div>
              </button>

            </div>

            {/* Removed Mobile Download Banner */}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
