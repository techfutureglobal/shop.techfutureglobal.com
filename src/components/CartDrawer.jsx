import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { IoClose, IoTrashOutline } from 'react-icons/io5';
import { FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';
import './CartDrawer.css';

const PLACEHOLDER = 'https://placehold.co/80x80/f5f5f5/999?text=IMG';

const CartDrawer = () => {
    const { isCartOpen, closeCart, cart, removeFromCart, updateCartQuantity, clearCart } = useContext(ShopContext);
    const navigate = useNavigate();

    const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`cart-drawer-backdrop${isCartOpen ? ' open' : ''}`}
                onClick={closeCart}
            />

            {/* Drawer Panel */}
            <aside className={`cart-drawer${isCartOpen ? ' open' : ''}`} aria-label="Shopping Cart">

                {/* ── Header ── */}
                <div className="cart-drawer-header">
                    <div className="cart-drawer-title">
                        <FiShoppingCart size={20} />
                        <span>Shopping Cart</span>
                        {totalItems > 0 && (
                            <span className="cart-drawer-count">{totalItems}</span>
                        )}
                    </div>
                    <button className="cart-drawer-close" onClick={closeCart} title="Close">
                        <IoClose size={22} />
                    </button>
                </div>

                {/* ── Items ── */}
                <div className="cart-drawer-body">
                    {cart.length === 0 ? (
                        <div className="cart-drawer-empty">
                            <FiShoppingCart size={52} className="empty-icon" />
                            <p>আপনার কার্ট খালি!</p>
                            <span>কিছু পণ্য যোগ করুন</span>
                            <button className="btn-continue-shopping" onClick={closeCart}>
                                কেনাকাটা চালিয়ে যান
                            </button>
                        </div>
                    ) : (
                        <ul className="cart-item-list">
                            {cart.map((item) => (
                                <li key={item.cartItemId || item.id} className="cart-item">
                                    <img
                                        src={item.image || PLACEHOLDER}
                                        alt={item.title}
                                        className="cart-item-img"
                                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                                    />
                                    <div className="cart-item-info">
                                        <p className="cart-item-title">{item.title}</p>
                                        {item.selectedVariant && (
                                            <p className="cart-item-variant">
                                                {item.selectedVariant.label || ''}
                                            </p>
                                        )}
                                        <p className="cart-item-price">৳ {item.price}</p>

                                        {/* Qty Controls */}
                                        <div className="cart-item-qty">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateCartQuantity(item.cartItemId || item.id, (item.quantity || 1) - 1)}
                                                disabled={(item.quantity || 1) <= 1}
                                            >
                                                <FiMinus size={12} />
                                            </button>
                                            <span className="qty-value">{item.quantity || 1}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateCartQuantity(item.cartItemId || item.id, (item.quantity || 1) + 1)}
                                            >
                                                <FiPlus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Item Total + Remove */}
                                    <div className="cart-item-right">
                                        <span className="cart-item-total">
                                            ৳ {(item.price * (item.quantity || 1)).toLocaleString()}
                                        </span>
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => removeFromCart(item.cartItemId || item.id)}
                                            title="Remove"
                                        >
                                            <IoTrashOutline size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ── Footer ── */}
                {cart.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-subtotal-row">
                            <span>সাবটোটাল ({totalItems} পণ্য)</span>
                            <span className="cart-subtotal-amount">৳ {subtotal.toLocaleString()}</span>
                        </div>
                        <p className="cart-shipping-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <FaTruck style={{ color: 'var(--primary-color)' }} /> শিপিং চার্জ চেকআউটে যোগ হবে
                        </p>
                        <button className="btn-checkout" onClick={handleCheckout}>
                            চেকআউট করুন →
                        </button>
                        <button className="btn-clear-cart" onClick={clearCart}>
                            কার্ট খালি করুন
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default CartDrawer;
