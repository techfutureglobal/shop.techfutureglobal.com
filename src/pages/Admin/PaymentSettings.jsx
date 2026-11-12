import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { FaSave, FaMoneyBillWave, FaServer, FaShieldAlt, FaKey, FaDatabase, FaExchangeAlt, FaMobileAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import PayoutSettings from '../../components/PayoutSettings';

const PaymentSettings = () => {
    const { user, adminPaymentMethods, updateAdminPaymentMethod } = useContext(ShopContext);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
    const [showSql, setShowSql] = useState(false);
    const [dbStatus, setDbStatus] = useState({}); // Track which providers exist in DB

    // Load from Firebase DB on mount (for admins only)
    useEffect(() => {
        if (user?.role !== 'admin') return;
        const loadFromDB = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'platform_payment_gateways'));
                const data = snapshot.docs.map(doc => doc.data());
                
                if (data && data.length > 0) {
                    const statusMap = {};
                    data.forEach(row => {
                        statusMap[row.provider] = row.provider;
                    // Merge DB data into state
                    updateAdminPaymentMethod(row.provider, {
                        isActive: row.is_active,
                        mode: row.mode,
                        number: row.merchant_number || '',
                        type: row.account_type || 'Merchant',
                        appKey: row.app_key || '',
                        appSecret: row.app_secret || '',
                        username: row.username || '',
                        password: row.password || '',
                        merchantId: row.merchant_id || '',
                        secretKey: row.secret_key || '',
                        apiKey: row.app_key || '',      // UddoktaPay uses app_key as API key
                        baseUrl: row.base_url || 'https://sandbox.uddoktapay.com',
                    });
                    });
                }
                setDbStatus(statusMap);
                console.log('✅ Payment gateway settings loaded from Firebase DB');
            } catch (error) {
                console.warn('Could not load from DB:', error.message);
            }
        };
        loadFromDB();
    }, [user]);

    // Provide Payout Configuration directly for Seller/Reseller
    if (user?.role !== 'admin') {
        return (
            <div className="fade-in">
                <div className="admin-page-header" style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#3b3f5c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaExchangeAlt style={{ color: '#4361ee' }} /> Withdrawals & Payout Setup
                    </h1>
                    <p style={{ color: '#888ea8', fontSize: '14px' }}>
                        Set up your bKash/Nagad options here to receive automated real-time payouts from the platform once the Super Admin approves your earnings.
                    </p>
                </div>
                <PayoutSettings isAdmin={false} />
            </div>
        );
    }

    const handleChange = (method, field, value) => {
        updateAdminPaymentMethod(method, { [field]: value });
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            const methods = ['bkash', 'nagad', 'rocket', 'uddoktapay'];
            
            await Promise.all(methods.map(async (method) => {
                const d = adminPaymentMethods[method] || {};

                // Only use columns that actually exist
                const row = {
                    provider: method,
                    is_active: d.isActive || false,
                    mode: d.mode || 'sandbox',
                    base_url: d.baseUrl || null,
                    account_type: d.type || 'Merchant',
                    merchant_number: d.number || null,
                    app_key: (method === 'uddoktapay') ? (d.apiKey || d.appKey || null) : (d.appKey || null),
                    app_secret: d.appSecret || null,
                    username: d.username || null,
                    password: d.password || null,
                };
                
                await setDoc(doc(db, 'platform_payment_gateways', method), row, { merge: true });
            }));

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
            console.log('✅ Payment gateway settings saved to Firebase!');
        } catch (err) {
            console.error('❌ Failed to save payment settings:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 4000);
        }
    };

    const methods = ['bkash', 'nagad', 'rocket', 'uddoktapay'];

    const getColors = (method) => {
        if (method === 'bkash') return { base: '#d12053', light: '#fff9fb' };
        if (method === 'nagad') return { base: '#f85606', light: '#fff9f5' };
        if (method === 'rocket') return { base: '#8c3494', light: '#f8f5ff' };
        if (method === 'uddoktapay') return { base: '#00c853', light: '#f1fff6' };
        return { base: '#3b3f5c', light: '#f1f5f9' };
    };

    const getSaveBtn = () => {
        if (saveStatus === 'saving') return { text: 'Saving to Database...', icon: <FaSpinner style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />, bg: '#6c757d' };
        if (saveStatus === 'saved') return { text: 'Saved to Database!', icon: <FaCheckCircle style={{ marginRight: '8px' }} />, bg: '#1abc9c' };
        if (saveStatus === 'error') return { text: 'Save Failed! Check Console', icon: <FaShieldAlt style={{ marginRight: '8px' }} />, bg: '#e7515a' };
        return { text: 'Save to Database', icon: <FaSave style={{ marginRight: '8px' }} />, bg: '#4361ee' };
    };

    const btn = getSaveBtn();

    return (
        <div className="fade-in">
            <h1 className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaServer style={{ color: '#4361ee' }} /> Real-Time PGW & Payout Configurations
            </h1>

            <div className="admin-card" style={{ marginBottom: '30px' }}>
                <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.6', padding: '12px', background: '#f8f9ff', borderRadius: '8px', borderLeft: '4px solid #4361ee' }}>
                    <strong style={{ color: '#4361ee', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FaCheckCircle style={{ color: '#1abc9c' }} /> Database Connected:
                    </strong> Settings are now saved directly to your Firebase <code>platform_payment_gateways</code> collection and will be read by the UddoktaPay Edge Function for real payment processing.
                    <br /><br />
                    <strong style={{ color: '#00c853' }}>UddoktaPay:</strong> Enter your API Key and Base URL (from your UddoktaPay merchant panel). Enable it, then save. The checkout page will automatically redirect customers to UddoktaPay for bKash/Nagad/Rocket payment.
                </p>

                <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
                    {methods.map(method => {
                        const colors = getColors(method);
                        const methodData = adminPaymentMethods[method] || {};

                        return (
                            <div key={method} className="payment-method-card" style={{
                                border: `1px solid ${colors.base}33`,
                                borderTop: `4px solid ${colors.base}`,
                                borderRadius: '12px',
                                padding: '24px',
                                background: colors.light,
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ width: '45px', height: '45px', background: colors.base, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginRight: '15px', fontSize: '20px' }}>
                                            <FaMobileAlt />
                                        </div>
                                        <div>
                                            <h3 style={{ textTransform: 'capitalize', margin: 0, fontSize: '20px', color: colors.base }}>
                                                {method === 'uddoktapay' ? 'UddoktaPay' : `${method.charAt(0).toUpperCase() + method.slice(1)} API`}
                                            </h3>
                                            {dbStatus[method] && (
                                                <span style={{ fontSize: '11px', color: '#1abc9c', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <FaCheckCircle /> Saved in DB
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={methodData.isActive || false}
                                            onChange={(e) => handleChange(method, 'isActive', e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div style={{ opacity: methodData.isActive ? 1 : 0.6, transition: '0.3s' }}>
                                    {method === 'uddoktapay' ? (
                                        <>
                                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '8px', fontWeight: '600' }}>
                                                    <FaKey style={{ marginRight: '5px', color: '#00c853' }} /> API Key *
                                                </label>
                                                <input
                                                    type="password"
                                                    className="admin-input"
                                                    value={methodData.apiKey || ''}
                                                    onChange={(e) => handleChange(method, 'apiKey', e.target.value)}
                                                    placeholder="Paste your UddoktaPay API Key here"
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${methodData.isActive ? '#00c853' : '#cbd5e1'}`, fontSize: '14px', boxSizing: 'border-box' }}
                                                    disabled={!methodData.isActive}
                                                />
                                                <small style={{ color: '#888', fontSize: '11px' }}>Get this from your UddoktaPay Merchant Panel → API Settings</small>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '8px', fontWeight: '600' }}>
                                                    Base URL *
                                                </label>
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    value={methodData.baseUrl || 'https://sandbox.uddoktapay.com'}
                                                    onChange={(e) => handleChange(method, 'baseUrl', e.target.value)}
                                                    placeholder="e.g. https://pay.yourdomain.com"
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${methodData.isActive ? '#00c853' : '#cbd5e1'}`, fontSize: '14px', boxSizing: 'border-box' }}
                                                    disabled={!methodData.isActive}
                                                />
                                                <small style={{ color: '#888', fontSize: '11px' }}>
                                                    Sandbox: <code>https://sandbox.uddoktapay.com</code> | Live: Your merchant domain
                                                </small>
                                            </div>
                                            <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#2e7d32' }}>
                                                <strong>Webhook URL (set in UddoktaPay panel):</strong><br />
                                                <code style={{ wordBreak: 'break-all' }}>
                                                    {`https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ebaybd-dee4d'}.cloudfunctions.net/paymentWebhook`}
                                                </code>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>Environment Mode</label>
                                                    <select
                                                        className="admin-select"
                                                        value={methodData.mode || 'sandbox'}
                                                        onChange={(e) => handleChange(method, 'mode', e.target.value)}
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                        disabled={!methodData.isActive}
                                                    >
                                                        <option value="sandbox">Sandbox (Testing)</option>
                                                        <option value="live">Live (Production)</option>
                                                    </select>
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>Account Type</label>
                                                    <select
                                                        className="admin-select"
                                                        value={methodData.type || 'Merchant'}
                                                        onChange={(e) => handleChange(method, 'type', e.target.value)}
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                        disabled={!methodData.isActive}
                                                    >
                                                        <option value="Merchant">Merchant API</option>
                                                        <option value="Personal">Personal (SMS)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>Store / Merchant Number</label>
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    value={methodData.number || ''}
                                                    onChange={(e) => handleChange(method, 'number', e.target.value)}
                                                    placeholder={`e.g. 017XXXXXX (${method})`}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                    disabled={!methodData.isActive}
                                                />
                                            </div>

                                            {methodData.type === 'Merchant' && (
                                                <>
                                                    {method === 'bkash' ? (
                                                        <>
                                                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                                                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>App Key</label>
                                                                <input type="text" className="admin-input" value={methodData.appKey || ''} onChange={(e) => handleChange(method, 'appKey', e.target.value)} disabled={!methodData.isActive} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e0e6ed', boxSizing: 'border-box' }} />
                                                            </div>
                                                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                                                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>App Secret</label>
                                                                <input type="password" className="admin-input" value={methodData.appSecret || ''} onChange={(e) => handleChange(method, 'appSecret', e.target.value)} disabled={!methodData.isActive} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e0e6ed', boxSizing: 'border-box' }} />
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <div className="form-group" style={{ flex: 1 }}>
                                                                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Username</label>
                                                                    <input type="text" className="admin-input" value={methodData.username || ''} onChange={(e) => handleChange(method, 'username', e.target.value)} disabled={!methodData.isActive} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e0e6ed', boxSizing: 'border-box' }} />
                                                                </div>
                                                                <div className="form-group" style={{ flex: 1 }}>
                                                                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Password</label>
                                                                    <input type="password" className="admin-input" value={methodData.password || ''} onChange={(e) => handleChange(method, 'password', e.target.value)} disabled={!methodData.isActive} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e0e6ed', boxSizing: 'border-box' }} />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                                                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Merchant ID</label>
                                                                <input type="text" className="admin-input" value={methodData.merchantId || ''} onChange={(e) => handleChange(method, 'merchantId', e.target.value)} disabled={!methodData.isActive} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e0e6ed', boxSizing: 'border-box' }} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>{method === 'nagad' ? 'Public / Private Keys' : 'API / Secret Keys'}</label>
                                                                <input type="password" placeholder="Key details..." className="admin-input" value={methodData.secretKey || ''} onChange={(e) => handleChange(method, 'secretKey', e.target.value)} disabled={!methodData.isActive} style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e0e6ed', boxSizing: 'border-box' }} />
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            {methodData.type === 'Personal' && (
                                                <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '6px', fontSize: '12px', marginTop: '10px' }}>
                                                    <b>Note:</b> Personal connections require an "SMS Reader / Forwarder Android App" installed in an Android device to process TrxIDs dynamically inside Firebase.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <button
                        onClick={() => setShowSql(!showSql)}
                        style={{ background: '#3b3f5c', color: 'white', padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                    >
                        <FaDatabase /> Developer SQL & Setup Guide
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: btn.bg, color: 'white', border: 'none', borderRadius: '8px', cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.3s' }}
                    >
                        {btn.icon} {btn.text}
                    </button>
                </div>
            </div>

            {showSql && (
                <div className="admin-card fade-in" style={{ borderLeft: '4px solid #3b3f5c' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#3b3f5c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaDatabase /> Cloud Function Setup (Firebase)
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Deploy this as a Firebase Cloud Function.
                    </p>
                    <pre style={{ background: '#1e293b', color: '#cbd5e1', padding: '20px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                        {`// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

exports.createPayment = functions.https.onRequest(async (req, res) => {
  const { amount, orderId, method, gateway } = req.body;

  // Get gateway credentials from DB
  const docSnap = await db.collection("platform_payment_gateways").doc("uddoktapay").get();
  const gw = docSnap.data();

  if (!gw || !gw.is_active || !gw.app_key) {
    return res.status(400).json({ error: "UddoktaPay not configured" });
  }

  // Call UddoktaPay API
  const uddoktaRes = await fetch(\`\${gw.base_url}/api/checkout-v2\`, {
    method: "POST",
    headers: {
      "RT-UDDOKTAPAY-API-KEY": gw.app_key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: "Customer",
      email: "customer@example.com",
      amount: amount.toString(),
      metadata: { orderId },
      redirect_url: \`https://yourdomain.com/checkout/success\`,
      cancel_url: \`https://yourdomain.com/checkout\`,
      webhook_url: \`https://us-central1-your-project.cloudfunctions.net/paymentWebhook\`,
    }),
  });

  const data = await uddoktaRes.json();
  res.json({ paymentUrl: data.payment_url });
});`}
                    </pre>
                </div>
            )}

            <style>{`
                .admin-input:focus, .admin-select:focus {
                    outline: none;
                    border-color: #4361ee !important;
                    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1) !important;
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #cbd5e1;
                    transition: .3s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px; width: 18px;
                    left: 3px; bottom: 3px;
                    background-color: white;
                    transition: .3s;
                }
                input:checked + .slider { background-color: #1abc9c; }
                input:checked + .slider:before { transform: translateX(20px); }
                .slider.round { border-radius: 24px; }
                .slider.round:before { border-radius: 50%; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PaymentSettings;
