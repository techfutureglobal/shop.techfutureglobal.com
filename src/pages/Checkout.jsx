import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { IoCheckmarkCircle, IoLocationOutline, IoCardOutline, IoTrashOutline } from 'react-icons/io5';
import { FaMobileAlt, FaCopy, FaCheckCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Checkout.css';

const Checkout = () => {
    const { cart, removeFromCart, updateCartQuantity, placeOrder, clearCart, user, siteConfig, adminPaymentMethods } = useContext(ShopContext);
    const navigate = useNavigate();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [lastOrderId, setLastOrderId] = useState('');
    const [txId, setTxId] = useState(''); // Personal payment TxID input
    const [copied, setCopied] = useState(false);
    const [isPlacing, setIsPlacing] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        name: user?.full_name || user?.name || '',
        phone: '',
        address: '',
        city: '',
        zone: ''
    });

    // Dynamic shipping fee from admin settings
    const dynamicShippingFee = siteConfig?.financialSettings?.commission?.shippingFee ?? 60;

    // Calculate totals
    const subtotal = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const shippingFee = subtotal > 0 ? dynamicShippingFee : 0;
    const total = subtotal + shippingFee;

    // Personal payment numbers from admin
    const personalNumbers = siteConfig?.financialSettings?.personalNumbers || {};

    // Determine payment flow for current method
    const isMobileBanking = ['bkash', 'nagad', 'rocket'].includes(paymentMethod);
    const isUddoktaPayActive = adminPaymentMethods?.uddoktapay?.isActive;
    const isPersonalEnabled = isMobileBanking && personalNumbers[paymentMethod]?.enabled && personalNumbers[paymentMethod]?.number;
    const showPersonalPayment = isMobileBanking && !isUddoktaPayActive && isPersonalEnabled;

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const copyNumber = (num) => {
        navigator.clipboard.writeText(num);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePlaceOrder = async () => {
        if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
            alert('সব প্রয়োজনীয় তথ্য পূরণ করুন (নাম, ফোন, ঠিকানা)।');
            return;
        }

        // Personal payment: require txId
        if (showPersonalPayment && !txId.trim()) {
            alert(`${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} তে টাকা পাঠিয়ে Transaction ID (TxID) লিখুন।`);
            return;
        }

        setIsPlacing(true);
        const res = await placeOrder({
            total,
            paymentMethod,
            shippingInfo,
            txId: txId || null,
            paymentNote: showPersonalPayment ? `Personal ${paymentMethod} - TxID: ${txId}` : null,
        });

        if (res?.success) {
            const isSpecificMerchantActive = adminPaymentMethods?.[paymentMethod]?.isActive && adminPaymentMethods?.[paymentMethod]?.type === 'Merchant';

            // Try UddoktaPay redirect
            if (isMobileBanking && isUddoktaPayActive) {
                try {
                    const auth = (await import('../lib/firebase')).auth;
                    const token = await auth.currentUser?.getIdToken();

                    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ebaybd-dee4d';
                    const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/createPayment`;

                    const response = await fetch(functionUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ amount: total, orderId: res.orderId, method: paymentMethod, gateway: 'uddoktapay' })
                    });
                    const data = await response.json();
                    if (data.paymentUrl) {
                        window.location.href = data.paymentUrl;
                        return;
                    }
                } catch (e) {
                    console.error('UddoktaPay error:', e);
                }
            }

            setLastOrderId(res.orderId);
            setOrderPlaced(true);
        } else {
            alert('অর্ডার দেওয়া যায়নি। আবার চেষ্টা করুন।');
        }
        setIsPlacing(false);
    };

    // ── ORDER SUCCESS ──
    if (orderPlaced) {
        return (
            <>
                <Header />
                <div className="checkout-wrapper">
                    <div className="container success-container">
                        <div className="success-card">
                            <div className="success-icon-wrapper">
                                <IoCheckmarkCircle className="success-icon" />
                            </div>
                            <h1>অর্ডার সফল হয়েছে!</h1>
                            <div className="order-id">Order ID: #{lastOrderId}</div>
                            <p className="success-msg">
                                আপনার অর্ডার গ্রহণ করা হয়েছে!{' '}
                                {showPersonalPayment && txId && (
                                    <span>আপনার TxID <b>{txId}</b> যাচাই করার পর অর্ডার নিশ্চিত করা হবে।</span>
                                )}
                                আমরা {shippingInfo.phone} নম্বরে যোগাযোগ করব।
                            </p>
                            <div className="success-actions">
                                <button className="btn-primary" onClick={() => navigate('/')}>কেনাকাটা চালিয়ে যান</button>
                                <button className="btn-secondary" onClick={() => navigate('/customer/dashboard')}>আমার অর্ডার দেখুন</button>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const methodColors = { bkash: '#d12053', nagad: '#f85606', rocket: '#8c3494' };

    return (
        <>
            <Header />
            <div className="checkout-wrapper">
                <div className="container checkout-container">

                    {/* Stepper */}
                    <div className="checkout-stepper">
                        <div className="step active"><div className="step-circle">1</div><span className="step-label">Cart</span></div>
                        <div className="step-line"></div>
                        <div className="step active"><div className="step-circle">2</div><span className="step-label">Shipping</span></div>
                        <div className="step-line"></div>
                        <div className="step active"><div className="step-circle">3</div><span className="step-label">Payment</span></div>
                    </div>

                    <div className="checkout-layout">
                        <div className="checkout-main">

                            {/* Cart Items */}
                            <div className="card-box" style={{ marginBottom: '20px' }}>
                                <div className="card-header">
                                    <h3><IoCheckmarkCircle /> Order Items ({cart?.length || 0})</h3>
                                </div>
                                <div className="cart-items-list">
                                    {cart?.length === 0 ? (
                                        <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                                            কার্ট খালি আছে।
                                            <div style={{ marginTop: '15px' }}>
                                                <button className="btn-secondary" onClick={() => navigate('/')} style={{ padding: '10px 25px', border: 'none', cursor: 'pointer' }}>
                                                    কেনাকাটা করুন
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        cart?.map((item, idx) => (
                                            <div key={idx} className="checkout-item">
                                                <div className="item-img">
                                                    <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} />
                                                </div>
                                                <div className="item-info">
                                                    <div className="item-title">{item.title || item.name}</div>
                                                    <div className="item-seller">Seller: {item.storeName || siteConfig?.header?.logoText || 'Ebaybd'}</div>
                                                    {item.selectedVariant && (
                                                        <div style={{ fontSize: '12px', color: '#f85606', fontWeight: '500', marginTop: '4px' }}>
                                                            {item.selectedVariant.type}: {item.selectedVariant.name}
                                                        </div>
                                                    )}
                                                    <div className="item-price-mobile">৳{item.price}</div>
                                                </div>
                                                <div className="item-qty-control">
                                                    <button onClick={() => updateCartQuantity(item.cartItemId || item.id, Math.max(1, item.quantity - 1))}>-</button>
                                                    <input type="text" value={item.quantity} readOnly />
                                                    <button onClick={() => updateCartQuantity(item.cartItemId || item.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <div className="item-subtotal">
                                                    <span className="price-label">৳{(item.price * item.quantity).toLocaleString()}</span>
                                                    <button className="remove-item" onClick={() => removeFromCart(item.cartItemId || item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                        <IoTrashOutline />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {cart?.length > 0 && (
                                <>
                                    {/* Shipping Form */}
                                    <div className="card-box" style={{ marginBottom: '20px' }}>
                                        <div className="card-header">
                                            <h3><IoLocationOutline /> শিপিং তথ্য</h3>
                                        </div>
                                        <div className="shipping-grid">
                                            <div className="form-group">
                                                <label>পূর্ণ নাম *</label>
                                                <input type="text" name="name" value={shippingInfo.name} onChange={handleShippingChange} placeholder="আপনার পূর্ণ নাম" />
                                            </div>
                                            <div className="form-group">
                                                <label>ফোন নম্বর *</label>
                                                <input type="text" name="phone" value={shippingInfo.phone} onChange={handleShippingChange} placeholder="01XXXXXXXXX" />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>ডেলিভারি ঠিকানা *</label>
                                                <textarea name="address" value={shippingInfo.address} onChange={handleShippingChange} placeholder="সম্পূর্ণ ঠিকানা লিখুন"></textarea>
                                            </div>
                                            <div className="form-group">
                                                <label>শহর</label>
                                                <input type="text" name="city" value={shippingInfo.city} onChange={handleShippingChange} placeholder="শহর" />
                                            </div>
                                            <div className="form-group">
                                                <label>এলাকা</label>
                                                <input type="text" name="zone" value={shippingInfo.zone} onChange={handleShippingChange} placeholder="এলাকা" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="card-box">
                                        <div className="card-header">
                                            <h3><IoCardOutline /> পেমেন্ট পদ্ধতি বেছে নিন</h3>
                                        </div>
                                        <div className="payment-grid">
                                            {['bkash', 'nagad', 'rocket'].map(m => (
                                                <label key={m} className={`payment-method ${paymentMethod === m ? 'active' : ''}`}>
                                                    <input type="radio" name="payment" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                                                    <div className="method-content">
                                                        <div className="method-icon mobile-pay" style={{ textTransform: 'capitalize', color: methodColors[m], fontWeight: 'bold' }}>
                                                            {m}
                                                        </div>
                                                        <div className="method-text">
                                                            <span className="method-name">{m.charAt(0).toUpperCase() + m.slice(1)} দিয়ে পেমেন্ট</span>
                                                            <span className="method-desc">
                                                                {isUddoktaPayActive ? 'UddoktaPay Gateway' :
                                                                    personalNumbers[m]?.enabled && personalNumbers[m]?.number
                                                                        ? `Personal: ${personalNumbers[m].number}`
                                                                        : 'Payment pending verification'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                            <label className={`payment-method ${paymentMethod === 'cod' ? 'active' : ''}`}>
                                                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                                <div className="method-content">
                                                    <div className="method-icon"><IoCardOutline /></div>
                                                    <div className="method-text">
                                                        <span className="method-name">Cash on Delivery</span>
                                                        <span className="method-desc">পণ্য পেলে টাকা দিন</span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        {/* ── PERSONAL PAYMENT INSTRUCTIONS ── */}
                                        {showPersonalPayment && (
                                            <div style={{
                                                marginTop: '20px',
                                                padding: '20px',
                                                background: `${methodColors[paymentMethod]}11`,
                                                border: `2px solid ${methodColors[paymentMethod]}44`,
                                                borderRadius: '12px',
                                                animation: 'fadeIn 0.3s ease'
                                            }}>
                                                <h4 style={{ color: methodColors[paymentMethod], margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FaMobileAlt /> {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} এ পেমেন্ট করুন
                                                </h4>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: 'white', borderRadius: '8px', marginBottom: '15px', border: `1px solid ${methodColors[paymentMethod]}33` }}>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>নিচের নম্বরে টাকা পাঠান ({paymentMethod.toUpperCase()} Personal):</p>
                                                        <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '800', color: methodColors[paymentMethod], letterSpacing: '2px' }}>
                                                            {personalNumbers[paymentMethod]?.number}
                                                        </p>
                                                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
                                                            পরিমাণ: <b style={{ color: methodColors[paymentMethod] }}>৳{total.toLocaleString()}</b>
                                                            &nbsp;(Delivery চার্জ সহ)
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => copyNumber(personalNumbers[paymentMethod]?.number)}
                                                        style={{ padding: '10px 15px', background: copied ? '#1abc9c' : methodColors[paymentMethod], color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', whiteSpace: 'nowrap' }}
                                                    >
                                                        {copied ? <><FaCheckCircle /> Copied!</> : <><FaCopy /> নম্বর কপি</>}
                                                    </button>
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                                                        টাকা পাঠানোর পর Transaction ID (TxID) লিখুন: *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={txId}
                                                        onChange={(e) => setTxId(e.target.value)}
                                                        placeholder={`${paymentMethod.toUpperCase()} Transaction ID দিন (যেমন: 8AB1234XY)`}
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            borderRadius: '8px',
                                                            border: `2px solid ${txId ? methodColors[paymentMethod] : '#e0e6ed'}`,
                                                            letterSpacing: '1px',
                                                            boxSizing: 'border-box',
                                                            transition: 'border-color 0.2s',
                                                            textTransform: 'uppercase',
                                                        }}
                                                    />
                                                    <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                                                        📌 TxID ছাড়া অর্ডার Confirm হবে না। টাকা পাঠানোর পর {paymentMethod.toUpperCase()} থেকে SMS এ TxID পাবেন।
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="checkout-sidebar">
                            <div className="card-box sticky-summary">
                                <div className="card-header">
                                    <h3>অর্ডার সারসংক্ষেপ</h3>
                                </div>
                                <div className="voucher-section">
                                    <div className="voucher-input">
                                        <input type="text" placeholder="ভাউচার কোড দিন" />
                                        <button onClick={() => alert('Invalid or Expired Voucher Code')}>APPLY</button>
                                    </div>
                                </div>
                                <div className="summary-details">
                                    <div className="summary-row">
                                        <span>পণ্যের মোট ({cart?.length || 0})</span>
                                        <span>৳{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>ডেলিভারি চার্জ</span>
                                        <span>৳{shippingFee}</span>
                                    </div>
                                    <div className="summary-divider"></div>
                                    <div className="summary-total">
                                        <span>মোট:</span>
                                        <span className="total-price">৳{total.toLocaleString()}</span>
                                    </div>
                                    <div className="vat-hint">VAT প্রযোজ্য ক্ষেত্রে অন্তর্ভুক্ত</div>

                                    <button
                                        className="btn-place-order"
                                        onClick={handlePlaceOrder}
                                        disabled={!cart || cart.length === 0 || isPlacing}
                                        style={{ opacity: isPlacing ? 0.7 : 1 }}
                                    >
                                        {isPlacing ? 'অর্ডার দেওয়া হচ্ছে...' : 'অর্ডার দিন'}
                                    </button>
                                    <button className="btn-back-to-cart" onClick={() => navigate(-1)}>
                                        ফিরে যান
                                    </button>
                                </div>
                            </div>

                            <div className="trust-footer">
                                <p><IoCheckmarkCircle /> ১০০% আসল পণ্য</p>
                                <p><IoCheckmarkCircle /> ১৪ দিনে রিটার্ন</p>
                                <p><IoCheckmarkCircle /> নিরাপদ পেমেন্ট</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </>
    );
};

export default Checkout;
