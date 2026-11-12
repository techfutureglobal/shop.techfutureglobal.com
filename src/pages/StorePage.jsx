import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBox from '../components/ChatBox';
import { FaCheckCircle, FaStar, FaUserPlus, FaComments } from 'react-icons/fa';

import './StorePage.css';

const StorePage = () => {
    const { sellerId } = useParams();
    const { allProducts, sellers, user } = useContext(ShopContext);
    const [seller, setSeller] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [activeFilter, setActiveFilter] = useState('popular');

    useEffect(() => {
        const fetchStoreData = async () => {
            setLoading(true);
            try {
                const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
                const isOfficial = !sellerId || sellerId === 'null' || sellerId === 'undefined' || sellerId === 'official';
                let foundSeller = null;

                if (isOfficial) {
                    // Try connecting to the Super Admin's profile from context
                    foundSeller = sellers?.find(s => s.role === 'admin');

                    // Fallback to fetch from DB
                    if (!foundSeller) {
                        const q = query(collection(db, 'profiles'), where('role', '==', 'admin'));
                        const snap = await getDocs(q);
                        if (!snap.empty) {
                            foundSeller = { id: snap.docs[0].id, ...snap.docs[0].data() };
                        }
                    }

                    // Ultimate Fallback if no admin is configured yet
                    if (!foundSeller) {
                        foundSeller = {
                            id: 'official',
                            store_name: 'Ebaybd Official',
                            store_logo: 'https://via.placeholder.com/150',
                            store_banner: 'https://via.placeholder.com/1500x300',
                            rating: 4.9,
                            followers: 5000
                        };
                    }
                } else {
                    // 1. Try finding in context first (Sellers or User context)
                    foundSeller = sellers?.find(s => s.id === sellerId);

                    // If the logged in user is the seller we're looking for, use their data
                    if (!foundSeller && user?.id === sellerId) {
                        foundSeller = user;
                    }

                    // 2. If still not found and it's a valid ID, fetch from Firestore
                    if (!foundSeller && isUUID(sellerId)) {
                        const docSnap = await getDoc(doc(db, 'profiles', sellerId));
                        if (docSnap.exists()) foundSeller = { id: docSnap.id, ...docSnap.data() };
                    }
                }

                if (foundSeller) {
                    setSeller(foundSeller);

                    // Filter products belonging to this store
                    const filtered = (allProducts || []).filter(p => {
                        const pSellerId = p.seller_id || p.sellerId;
                        if (isOfficial) {
                            return !pSellerId || pSellerId === 'null' || pSellerId === 'undefined' || pSellerId === foundSeller.id;
                        }
                        return pSellerId === sellerId;
                    });
                    setSellerProducts(filtered);
                } else {
                    console.warn(`Seller with ID ${sellerId} not found.`);
                    setSeller(null);
                }
            } catch (err) {
                console.error('Error fetching store data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [sellerId, sellers, allProducts, user]);

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Store...</div>;


    if (!seller) return <div style={{ padding: '100px', textAlign: 'center' }}>Store not found.</div>;

    return (
        <div className="store-page-wrapper">
            <Header />

            <div className="store-banner" style={{ backgroundImage: `url(${seller.store_banner || 'https://via.placeholder.com/1500x300'})` }}>
                <div className="banner-overlay"></div>
                <div className="container">
                    <div className="store-info-flex">
                        <div className="store-logo-wrap">
                            <img src={seller.store_logo || 'https://via.placeholder.com/150'} alt={seller.store_name} />
                        </div>
                        <div className="store-details">
                            <h1>
                                {seller.store_name || 'Store'} <FaCheckCircle style={{ fontSize: '20px', color: '#00c3ff' }} />
                            </h1>
                            <div className="store-stats">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaStar style={{ color: '#f85606' }} />
                                    <span>{seller.rating || 0} Positive Ratings</span>
                                </div>
                                <span>|</span>
                                <span>{seller.followers || 0} Followers</span>
                            </div>
                        </div>
                        <div className="store-actions">
                            <button className="btn-follow">
                                <FaUserPlus /> FOLLOW
                            </button>
                            <button onClick={() => setShowChat(true)} className="btn-chat">
                                <FaComments /> CHAT
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="store-content container">
                <div className="store-content-header">
                    <h2 style={{ fontSize: '24px', color: '#333', margin: 0 }}>All Products</h2>
                    <div className="store-filters">
                        <span
                            className={`filter-item ${activeFilter === 'popular' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('popular')}
                        >
                            Popular
                        </span>
                        <span
                            className={`filter-item ${activeFilter === 'new' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('new')}
                        >
                            Arrival Products
                        </span>
                        <span
                            className={`filter-item ${activeFilter === 'price' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('price')}
                        >
                            Price: Low to High
                        </span>
                    </div>
                </div>

                {sellerProducts.length > 0 ? (
                    <div className="products-grid">
                        {sellerProducts.map(product => (
                            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                                <div className="store-product-card-inner">
                                    <img src={product.image} alt={product.title} />
                                    <div className="store-product-info">
                                        <h4>{product.title}</h4>
                                        <div className="store-product-price">৳ {product.price}</div>
                                        {product.originalPrice && (
                                            <div className="store-product-old-price">৳ {product.originalPrice}</div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                        No products found for this store.
                    </div>
                )}
            </div>

            {showChat && seller && (
                <ChatBox
                    sellerId={seller.id}
                    sellerName={seller.store_name || seller.storeName}
                    onClose={() => setShowChat(false)}
                />
            )}
            <Footer />
        </div>
    );
};

export default StorePage;
