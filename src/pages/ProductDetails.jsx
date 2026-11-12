
import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BsStarFill, BsStarHalf, BsPlus, BsDash } from 'react-icons/bs';
import { FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa';
import ProductSliderSection from '../components/ProductSliderSection';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { allProducts, addToCart, sellers } = useContext(ShopContext);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImg, setActiveImg] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        // Find product in allProducts
        const found = allProducts?.find(p => p.id === id);
        if (found) {
            setProduct(found);
            setActiveImg(found.image);
        }
        window.scrollTo(0, 0);
    }, [id, allProducts]);

    if (!product) {
        return (
            <div className="shop-page">
                <Header />
                <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                    <h2>Product not found</h2>
                    <Link to="/" style={{ color: 'var(--primary-color)' }}>Back to Home</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const seller = sellers?.find(s => s.id === product.sellerId) || sellers?.[0];


    const handleAddToCart = () => {
        if (product.has_variants && !selectedVariant) {
            alert('দয়া করে একটি অপশন নির্বাচন করুন।');
            return;
        }
        addToCart(product, quantity, selectedVariant);
    };

    const handleBuyNow = () => {
        if (product.has_variants && !selectedVariant) {
            alert('দয়া করে একটি অপশন নির্বাচন করুন।');
            return;
        }
        addToCart(product, quantity, selectedVariant);
        navigate('/checkout');
    };

    return (
        <div className="pdp-container">
            <Header />

            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Home</Link> <span>/</span>
                    <Link to="/shop">Products</Link> <span>/</span>
                    <span className="active">{product.title}</span>
                </div>

                <div className="product-main-section">
                    <div className="pdp-gallery">
                        <img src={activeImg} alt={product.title} className="main-image" />
                        <div className="thumbnail-list">
                            {[product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean).map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    className={`thumb-img ${activeImg === img ? 'active' : ''}`}
                                    onClick={() => setActiveImg(img)}
                                    alt="thumb"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pdp-info">
                        <h1 className="pdp-title">{product.title}</h1>
                        <div className="pdp-ratings">
                            <div className="stars">
                                <BsStarFill /> <BsStarFill /> <BsStarFill /> <BsStarFill /> <BsStarHalf />
                            </div>
                            <span className="rating-count">4.5/5 Rating</span>
                            <span className="separator">|</span>
                            <span className="sold-count">{product.sold || '150+'} sold</span>
                        </div>
                        <div className="pdp-brand">
                            Brand: <Link to="#">No Brand</Link> | <Link to="#">More from Store</Link>
                        </div>

                        <div className="price-section">
                            <div className="pdp-price">৳ {selectedVariant?.price ? Number(selectedVariant.price) : product.price}</div>
                            {product.originalPrice && (
                                <div className="pdp-original">
                                    <span className="pdp-old-price">৳ {product.originalPrice}</span>
                                    <span className="pdp-discount">{product.discount}</span>
                                </div>
                            )}
                            <div className="promotions">
                                Promotions: <span className="promotion-tag">Min.Spend ৳ 500</span>
                            </div>
                        </div>

                        {product.has_variants && (
                            <div className="variant-selection" style={{ margin: '20px 0' }}>
                                <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '14px', color: '#555' }}>
                                    {product.variant_config?.attributes?.[0] || 'Options'}:
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                if (v.image) setActiveImg(v.image);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                border: selectedVariant?.id === v.id ? '2px solid #f85606' : '1px solid #ddd',
                                                background: selectedVariant?.id === v.id ? '#fff' : '#f9f9f9',
                                                color: selectedVariant?.id === v.id ? '#f85606' : '#333',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: selectedVariant?.id === v.id ? '700' : '400',
                                                transition: 'all 0.2s',
                                                minWidth: '60px'
                                            }}
                                        >
                                            {v.name}
                                            {v.price && <span style={{ display: 'block', fontSize: '10px', color: '#888' }}>৳{v.price}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="quantity-selector">
                            <span className="qty-label">Quantity</span>
                            <div className="qty-btn-group">
                                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}><BsDash /></button>
                                <input type="text" className="qty-input" value={quantity} readOnly />
                                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}><BsPlus /></button>
                            </div>
                            <span style={{ fontSize: '12px', color: '#999' }}>
                                {selectedVariant ? (
                                    <>Only {selectedVariant.stock || 0} items left</>
                                ) : (
                                    <>Only {product.stock || 5} items left</>
                                )}
                            </span>
                        </div>

                        <div className="action-buttons">
                            <div className="pdp-action-icons d-md-none">
                                <Link to={`/store/${product.seller_id || product.sellerId}`} className="action-icon-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                    <span>Store</span>
                                </Link>
                                <div
                                    className="action-icon-btn"
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: { sellerId: product.seller_id || product.sellerId, storeName: product.profiles?.store_name || product.store_name || 'Store' } }))}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    <span>Chat</span>
                                </div>
                            </div>
                            <button className="btn-buy-now" onClick={handleBuyNow}>Buy Now</button>
                            <button className="btn-add-cart" onClick={handleAddToCart}>Add to Cart</button>
                        </div>

                        {/* Social Contact Buttons */}
                        <div className="social-contact-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <a 
                                href="https://wa.me/8801700000000" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#369843', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}
                            >
                                <FaWhatsapp size={18} />
                                WhatsApp Us
                            </a>
                            <a 
                                href="https://m.me/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#2d5c9e', color: '#fff', padding: '12px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}
                            >
                                <FaFacebookMessenger size={18} />
                                chat with us
                            </a>
                        </div>
                    </div>


                </div>

                <div className="product-details-bottom">
                    <div className="section-title">Product Details</div>
                    <div className="details-content">
                        {product.description ? (
                            <div
                                style={{ lineHeight: '1.8', color: '#444', fontSize: '14px', whiteSpace: 'pre-wrap' }}
                                dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }}
                            />
                        ) : (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>এই পণ্যের কোনো বিস্তারিত বিবরণ যোগ করা হয়নি।</p>
                        )}
                    </div>
                </div>

                {/* Related Products Slider */}
                <div style={{ marginTop: '40px', marginBottom: '40px' }}>
                    <ProductSliderSection
                        id="related-products"
                        title="Related Products"
                        products={allProducts?.filter(p => p.category === product.category && p.id !== product.id).slice(0, 12)}
                        viewAllLink={`/shop?category=${product.category}`}
                        viewAllLabel="VIEW MORE"
                    />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetails;
