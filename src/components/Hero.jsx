import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ShopContext } from '../context/ShopContext';
import { IoChevronForwardOutline } from 'react-icons/io5';
import { FaHeadset, FaShoppingBag } from 'react-icons/fa';
import './Hero.css';

const DEFAULT_SLIDES = [
    { id: 'slide_1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=450', url: '/shop' },
    { id: 'slide_2', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=1200&h=450', url: '/shop' },
    { id: 'slide_3', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200&h=450', url: '/shop' },
];

const DEFAULT_HERO_AD = {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500&h=600',
    url: '/shop'
};

const Hero = () => {
    const { heroSlider, heroAd, categories, siteConfig } = useContext(ShopContext);
    const [activeCategory, setActiveCategory] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const slides = (heroSlider && heroSlider.length > 0 && heroSlider.some(s => s.image)) ? heroSlider : DEFAULT_SLIDES;
    const activeHeroAd = (heroAd && heroAd.image) ? heroAd : DEFAULT_HERO_AD;

    const handleCatClick = (catName) => {
        navigate(`/shop?category=${encodeURIComponent(catName)}`);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setActiveCategory(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="hero-wrapper">
            {/* Secondary Nav Bar */}
            <div className="secondary-nav">
                <div className="container secondary-nav-inner">
                    {/* Browse Categories Button */}
                    <div className="browse-cat-trigger" ref={dropdownRef}>
                        <button className="browse-cat-btn">
                            <span className="browse-hamburger">
                                <span></span><span></span><span></span>
                            </span>
                            BROWSE CATEGORIES
                            <span className="browse-chevron">▾</span>
                        </button>

                        {/* Left Sidebar Category Mega Menu */}
                        <div className="cat-mega-dropdown">
                            <div className="cat-sidebar-list">
                                {(categories || []).map((cat) => (
                                    <div
                                        key={cat.id}
                                        className={`cat-sidebar-item ${activeCategory?.id === cat.id ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveCategory(cat)}
                                        onMouseLeave={() => setActiveCategory(null)}
                                    >
                                        <div
                                            className="cat-sidebar-link"
                                            onClick={() => handleCatClick(cat.name)}
                                        >
                                            {cat.img && <img src={cat.img} alt={cat.name} className="cat-icon-img" />}
                                            <span>{cat.name}</span>
                                            {cat.subcategories?.length > 0 && (
                                                <IoChevronForwardOutline className="cat-arrow" size={13} />
                                            )}
                                        </div>

                                        {/* Submenu Panel */}
                                        {cat.subcategories?.length > 0 && activeCategory?.id === cat.id && (
                                            <div className="cat-submenu-panel">
                                                {cat.subcategories.map((sub, idx) => (
                                                    <div key={idx} className="cat-submenu-col">
                                                        <h4
                                                            className="cat-submenu-heading"
                                                            onClick={() => handleCatClick(sub.title)}
                                                        >
                                                            {sub.title}
                                                        </h4>
                                                        <div className="cat-submenu-links">
                                                            {sub.items?.map((item, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={`/shop?category=${encodeURIComponent(item)}`}
                                                                    className="cat-submenu-link"
                                                                >
                                                                    {item}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="secondary-nav-links">
                        <Link to="/">HOME</Link>
                        <Link to="/shop">SHOP</Link>
                        <Link to="/about-us">ABOUT US</Link>
                        <Link to="/services">SERVICES</Link>
                    </div>

                    {/* Support */}
                    <a
                        href={`tel:${siteConfig?.header?.supportPhone || siteConfig?.whatsappNumber || '+8801700000000'}`}
                        className="secondary-nav-support"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <FaHeadset size={22} className="support-icon" />
                        <div>
                            <div className="support-label">{siteConfig?.header?.supportLabel || '24/7 SUPPORT'}</div>
                            <div className="support-phone">{siteConfig?.header?.supportPhone || '+880 1700-000000'}</div>
                        </div>
                    </a>
                </div>
            </div>

            {/* Hero Main: Left Sidebar + Slider + Right Ad */}
            <section className="hero-section">
                <div className="container hero-layout">

                    {/* Left Category Sidebar (static, always visible on desktop) */}
                    <div className="hero-cat-sidebar">
                        {(categories || []).slice(0, 11).map((cat) => (
                            <div
                                key={cat.id}
                                className={`hero-cat-item ${activeCategory?.id === cat.id ? 'active' : ''}`}
                                onMouseEnter={() => setActiveCategory(cat)}
                                onMouseLeave={() => setActiveCategory(null)}
                            >
                                <div
                                    className="hero-cat-link"
                                    onClick={() => handleCatClick(cat.name)}
                                    style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}
                                >
                                    {cat.img && <img src={cat.img} alt={cat.name} className="hero-cat-icon" />}
                                    <span>{cat.name}</span>
                                    {cat.subcategories?.length > 0 && <IoChevronForwardOutline size={13} className="hero-cat-arrow" />}
                                </div>

                                {/* Submenu Panel (Same as Browse Categories submenu) */}
                                {cat.subcategories?.length > 0 && activeCategory?.id === cat.id && (
                                    <div className="cat-submenu-panel">
                                        {cat.subcategories.map((sub, idx) => (
                                            <div key={idx} className="cat-submenu-col">
                                                <h4
                                                    className="cat-submenu-heading"
                                                    onClick={() => handleCatClick(sub.title)}
                                                >
                                                    {sub.title}
                                                </h4>
                                                <div className="cat-submenu-links">
                                                    {sub.items?.map((item, i) => (
                                                        <a
                                                            key={i}
                                                            href={`/shop?category=${encodeURIComponent(item)}`}
                                                            className="cat-submenu-link"
                                                        >
                                                            {item}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!categories || categories.length === 0) && (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="hero-cat-item skeleton-item">
                                    <span className="skeleton-text"></span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Center Slider */}
                    <div className="hero-slider">
                        {/* Custom Navigation Arrows */}
                        <button className="hero-side-arrow hero-side-prev" aria-label="Previous">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button className="hero-side-arrow hero-side-next" aria-label="Next">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        <Swiper
                            spaceBetween={0}
                            centeredSlides={true}
                            autoplay={{ delay: 3500, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            navigation={{
                                prevEl: '.hero-side-prev',
                                nextEl: '.hero-side-next',
                            }}
                            modules={[Autoplay, Pagination, Navigation]}
                            className="mySwiper"
                        >
                            {slides.map((slide, index) => (
                                <SwiperSlide key={slide.id || index}>
                                    <a href={slide.url || '#'}>
                                        {slide.image ? (
                                            <img
                                                src={slide.image}
                                                alt={`Banner ${index + 1}`}
                                                style={{ width: '100%', display: 'block', height: '300px', objectFit: 'cover', objectPosition: 'center', backgroundColor: '#e0e0e0' }}
                                            />
                                        ) : (
                                            <div className={slide.isSkeleton ? "shimmer-dark" : ""} style={{ width: '100%', height: '300px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '14px' }}>
                                                {slide.isSkeleton ? '' : 'No Banner Image'}
                                            </div>
                                        )}
                                    </a>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Right Ad Banner */}
                    <div className="hero-ad">
                        <a href={activeHeroAd?.url || '#'}>
                            {activeHeroAd?.image ? (
                                <img src={activeHeroAd.image} alt="Advertisement" />
                            ) : (
                                <div className="hero-ad-placeholder shimmer-dark">
                                    <div className="hero-ad-placeholder-inner" style={{ opacity: 0.6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaShoppingBag size={34} style={{ color: 'var(--primary-color)', marginBottom: '8px' }} />
                                        <p style={{ margin: 0, fontWeight: '600' }}>Promo Banner</p>
                                        <small style={{ color: '#888' }}>Set in Site Editor</small>
                                    </div>
                                </div>
                            )}
                        </a>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Hero;
