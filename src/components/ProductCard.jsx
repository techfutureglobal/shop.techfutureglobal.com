import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { FaStar, FaShoppingCart, FaSearch, FaExchangeAlt, FaHeart } from 'react-icons/fa';
import './ProductCard.css';

const PLACEHOLDER = 'https://placehold.co/300x300/f5f5f5/999?text=No+Image';

const ProductCard = ({ product }) => {
    const { categories, addToCart, addToWishlist } = useContext(ShopContext);
    const navigate = useNavigate();
    const [wishlistActive, setWishlistActive] = useState(false);
    const [cartClicked, setCartClicked] = useState(false);

    const {
        id,
        image,
        title,
        price,
        originalPrice,
        original_price,
        discount,
        category_id,
        is_new_arrival,
        rating
    } = product;

    const displayOriginalPrice = originalPrice || original_price;
    const category = categories?.find(c => c.id === category_id);
    const categoryName = category ? category.name : 'Uncategorized';
    const stars = rating || 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (addToCart) addToCart(product);
        setCartClicked(true);
        setTimeout(() => setCartClicked(false), 1200);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlistActive(prev => !prev);
        if (addToWishlist) addToWishlist(product);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${id}`);
    };

    const handleCompare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // compare logic placeholder
    };

    return (
        <Link to={`/product/${id}`} className="product-card-link">
            <div className="product-card">

                {/* ── Image Area ── */}
                <div className="product-image">

                    {/* Badges */}
                    {is_new_arrival && <span className="badge badge-new">NEW</span>}
                    {discount > 0 && <span className="badge badge-discount">-{discount}%</span>}

                    <img
                        src={image || PLACEHOLDER}
                        alt={title || 'Product'}
                        loading="lazy"
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />

                    {/* Hover Toolbar – right side vertical (exact Jhotpot/WoodMart clone) */}
                    <div className="product-hover-toolbar">
                        <button
                            className={`toolbar-btn${cartClicked ? ' active' : ''}`}
                            title="Add to Cart"
                            onClick={handleAddToCart}
                        >
                            <FaShoppingCart />
                            <span className="toolbar-tooltip">Add to Cart</span>
                        </button>

                        <button
                            className="toolbar-btn"
                            title="Quick View"
                            onClick={handleQuickView}
                        >
                            <FaSearch />
                            <span className="toolbar-tooltip">Quick View</span>
                        </button>

                        <button
                            className="toolbar-btn"
                            title="Compare"
                            onClick={handleCompare}
                        >
                            <FaExchangeAlt />
                            <span className="toolbar-tooltip">Compare</span>
                        </button>

                        <button
                            className={`toolbar-btn wishlist-btn${wishlistActive ? ' wishlisted' : ''}`}
                            title="Add to Wishlist"
                            onClick={handleWishlist}
                        >
                            <FaHeart />
                            <span className="toolbar-tooltip">Wishlist</span>
                        </button>
                    </div>
                </div>

                {/* ── Info Area ── */}
                <div className="product-info">
                    <h4 className="product-title">{title}</h4>
                    <p className="product-category">{categoryName}</p>

                    {/* Stars */}
                    <div className="product-stars">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                size={11}
                                color={i < stars ? '#ffc107' : '#e4e5e9'}
                            />
                        ))}
                    </div>

                    {/* Price */}
                    <div className="product-price">
                        <span className="price-current">৳ {price}</span>
                        {displayOriginalPrice && (
                            <span className="price-original">৳ {displayOriginalPrice}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
