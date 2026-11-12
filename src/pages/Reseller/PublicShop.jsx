import React, { useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { FaTruck, FaShieldAlt, FaUndoAlt, FaStar, FaShoppingCart, FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaBars, FaTimes } from 'react-icons/fa';
import './Reseller.css';

const PublicShop = () => {
    const { idOrSlug } = useParams();
    const navigate = useNavigate();
    const { allProducts, resellerStores, addToCart } = useContext(ShopContext);

    // Find the store by ID or Slug
    const store = useMemo(() => {
        return resellerStores.find(s => s.slug === idOrSlug || s.id === idOrSlug || s.userId === idOrSlug) || resellerStores?.[0];
    }, [idOrSlug, resellerStores]);

    // Find products for this reseller (stored in products table with reseller id)
    const myProducts = useMemo(() => {
        if (!store) return [];
        return (allProducts || []).filter(p => p.sellerId === store.id || p.sellerId === store.userId);
    }, [store, allProducts]);

    return (
        <div className="premium-landing">
            <style>{`
                .premium-landing {
                    font-family: 'Inter', sans-serif;
                    background: #fff;
                    color: #1a1a1a;
                }
                .sticky-nav {
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    padding: 20px 5%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                }
                .brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                }
                .brand-logo img {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                }
                .brand-logo h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .hero-section {
                    height: 500px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-align: center;
                    background-size: cover;
                    background-position: center;
                    margin-bottom: 80px;
                }
                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7));
                }
                .hero-content {
                    position: relative;
                    z-index: 10;
                    max-width: 800px;
                    padding: 0 20px;
                }
                .hero-content h1 {
                    font-size: 56px;
                    font-weight: 900;
                    margin-bottom: 20px;
                    letter-spacing: -1px;
                }
                .hero-content p {
                    font-size: 18px;
                    opacity: 0.9;
                    margin-bottom: 30px;
                }
                .shop-now-btn {
                    padding: 15px 40px;
                    background: #f85606;
                    color: white;
                    border-radius: 50px;
                    font-weight: 700;
                    text-decoration: none;
                    transition: transform 0.2s;
                    display: inline-block;
                }
                .shop-now-btn:hover {
                    transform: scale(1.05);
                }

                .products-container {
                    max-width: 1200px;
                    margin: 0 auto 100px;
                    padding: 0 20px;
                }
                .section-header {
                    text-align: center;
                    margin-bottom: 50px;
                }
                .section-header h2 {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 15px;
                }
                .section-header .line {
                    width: 60px;
                    height: 5px;
                    background: #f85606;
                    margin: 0 auto;
                    border-radius: 10px;
                }

                .premium-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 30px;
                }
                .premium-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid #f1f5f9;
                    transition: all 0.3s;
                }
                .premium-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                }
                .img-holder {
                    height: 300px;
                    overflow: hidden;
                }
                .img-holder img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }
                .premium-card:hover .img-holder img {
                    transform: scale(1.1);
                }
                .card-details {
                    padding: 24px;
                }
                .card-details h3 {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    color: #1e293b;
                }
                .stars {
                    color: #fbbf24;
                    display: flex;
                    gap: 2px;
                    margin-bottom: 15px;
                }
                .price-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .p-price {
                    font-size: 24px;
                    font-weight: 900;
                    color: #0f172a;
                }
                .buy-btn {
                    padding: 10px 20px;
                    background: #0f172a;
                    color: white;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .features-bar {
                    background: #f8fafc;
                    padding: 80px 5%;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 40px;
                    margin-bottom: 80px;
                }
                .feature-item {
                    text-align: center;
                }
                .feature-item svg {
                    font-size: 48px;
                    color: #f85606;
                    margin-bottom: 20px;
                }
                .feature-item h4 {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .feature-item p {
                    color: #64748b;
                    font-size: 15px;
                }

                .premium-footer {
                    background: #0f172a;
                    color: white;
                    padding: 100px 5% 50px;
                    text-align: center;
                }
                .footer-brand h2 {
                    font-size: 32px;
                    font-weight: 900;
                    margin-bottom: 20px;
                }
                .footer-brand p {
                    opacity: 0.6;
                    max-width: 600px;
                    margin: 0 auto 40px;
                }
                .socials {
                    display: flex;
                    justify-content: center;
                    gap: 25px;
                    margin-bottom: 60px;
                }
                .socials a {
                    color: white;
                    font-size: 24px;
                    transition: color 0.2s;
                }
                .socials a:hover { color: #f85606; }
                .copy {
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 30px;
                    font-size: 14px;
                    opacity: 0.4;
                }

                @media (max-width: 768px) {
                    .hero-content h1 { font-size: 36px; }
                    .features-bar { grid-template-columns: 1fr; }
                    .premium-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
                    .img-holder { height: 180px; }
                    .card-details { padding: 15px; }
                    .p-price { font-size: 18px; }
                    .buy-btn span { display: none; }
                }
            `}</style>

            <nav className="sticky-nav">
                <Link to="/" className="brand-logo">
                    <img src={store?.logo || 'https://placehold.co/100'} alt="" />
                    <h2>{store?.title || "Exclusive Shop"}</h2>
                </Link>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <Link to="/checkout" className="buy-btn" style={{ textDecoration: 'none' }}>
                        <FaShoppingCart /> <span>Cart</span>
                    </Link>
                </div>
            </nav>

            <header className="hero-section" style={{ backgroundImage: `url(${store?.banner || 'https://placehold.co/1200x600/1e293b/white?text=Premium+Collection'})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>{store?.title || "Elevate Your Lifestyle"}</h1>
                    <p>{store?.description || "Handpicked premium products delivered directly to your doorstep with love and care."}</p>
                    <a href="#collection" className="shop-now-btn">Explore Collection</a>
                </div>
            </header>

            <div className="features-bar">
                <div className="feature-item">
                    <FaTruck />
                    <h4>Fast & Reliable Shipping</h4>
                    <p>We ensure your premium picks reach you in record time, anywhere.</p>
                </div>
                <div className="feature-item">
                    <FaShieldAlt />
                    <h4>Secure Transactions</h4>
                    <p>Your data and payments are protected with top-tier encryption.</p>
                </div>
                <div className="feature-item">
                    <FaUndoAlt />
                    <h4>Hassle-Free Returns</h4>
                    <p>Not satisfied? Our 7-day return policy has you covered.</p>
                </div>
            </div>

            <main className="products-container" id="collection">
                <div className="section-header">
                    <h2>Our Featured Products</h2>
                    <div className="line"></div>
                </div>

                <div className="premium-grid">
                    {myProducts.map((p, i) => (
                        <div key={i} className="premium-card">
                            <div className="img-holder">
                                <img src={p.image} alt={p.title} />
                            </div>
                            <div className="card-details">
                                <h3>{p.title}</h3>
                                <div className="stars">
                                    {[...Array(5)].map((_, j) => <FaStar key={j} />)}
                                </div>
                                <div className="price-box">
                                    <span className="p-price">৳{p.price}</span>
                                    <button
                                        className="buy-btn"
                                        onClick={() => {
                                            addToCart(p, 1);
                                            navigate('/checkout');
                                        }}
                                    >
                                        <FaShoppingCart /> <span>Buy Now</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {myProducts.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                            <p>This store is currently preparing its curated collection. Check back soon!</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="premium-footer">
                <div className="footer-brand">
                    <h2>{store?.title}</h2>
                    <p>{store?.description}</p>
                </div>
                <div className="socials">
                    <a href="#"><FaFacebook /></a>
                    <a href="#"><FaTwitter /></a>
                    <a href="#"><FaInstagram /></a>
                    <a href="#"><FaWhatsapp /></a>
                </div>
                <div className="copy">
                    &copy; 2026 {store?.title}. All rights reserved. Powered by Reseller Network.
                </div>
            </footer>
        </div>
    );
};

export default PublicShop;
