import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import {
    FaSave, FaPercentage, FaCheckCircle, FaSpinner, FaMobileAlt,
    FaInfoCircle, FaChartPie, FaShieldAlt, FaEdit, FaBan
} from 'react-icons/fa';

const DEFAULT_COMMISSION = {
    adminPercent: 10,
    sellerPercent: 80,
    resellerPercent: 10,
    resellerDeductFrom: 'both',
    shippingFee: 60,
    codExtraCharge: 0,
};

const FinancialSettings = () => {
    const { user, siteConfig, updateSiteConfig } = useContext(ShopContext);
    const [commission, setCommission] = useState(DEFAULT_COMMISSION);
    const [personalNumbers, setPersonalNumbers] = useState({
        bkash: { number: '', enabled: false, type: 'Personal (Send Money)' },
        nagad: { number: '', enabled: false, type: 'Personal (Send Money)' },
        rocket: { number: '', enabled: false, type: 'Personal (Send Money)' },
        upay: { number: '', enabled: false, type: 'Personal (Send Money)' },
    });
    const [saveStatus, setSaveStatus] = useState('idle');
    const [activeTab, setActiveTab] = useState('commission');

    // Load from siteConfig
    useEffect(() => {
        if (siteConfig?.financialSettings) {
            const fs = siteConfig.financialSettings;
            if (fs.commission) setCommission({ ...DEFAULT_COMMISSION, ...fs.commission });
            if (fs.personalNumbers) setPersonalNumbers(prev => ({ ...prev, ...fs.personalNumbers }));
        }
    }, [siteConfig]);

    if (user?.role !== 'admin') {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#e7515a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FaBan /> Super Admin Only</div>;
    }

    const totalCommission = commission.adminPercent + commission.sellerPercent + commission.resellerPercent;

    // Recalculate on any change to keep sum at 100
    const handleCommissionChange = (field, val) => {
        const num = Math.max(0, Math.min(100, Number(val)));
        setCommission(prev => {
            const updated = { ...prev, [field]: num };
            const fields = ['adminPercent', 'sellerPercent', 'resellerPercent'];
            const others = fields.filter(f => f !== field);

            const totalOthersPrev = prev[others[0]] + prev[others[1]];
            const remaining = 100 - num;

            if (totalOthersPrev > 0) {
                // Proportional adjustment
                updated[others[0]] = Math.round((prev[others[0]] / totalOthersPrev) * remaining);
                updated[others[1]] = 100 - num - updated[others[0]];
            } else {
                // Equal split if others were zero
                updated[others[0]] = Math.floor(remaining / 2);
                updated[others[1]] = 100 - num - updated[others[0]];
            }
            return updated;
        });
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            const newConfig = {
                ...siteConfig,
                financialSettings: {
                    commission,
                    personalNumbers,
                }
            };
            await updateSiteConfig(newConfig);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const getSaveBtn = () => {
        if (saveStatus === 'saving') return { text: 'Saving...', icon: <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />, bg: '#6c757d' };
        if (saveStatus === 'saved') return { text: 'Saved Successfully!', icon: <FaCheckCircle />, bg: '#1abc9c' };
        if (saveStatus === 'error') return { text: 'Save Failed!', icon: <FaShieldAlt />, bg: '#e7515a' };
        return { text: 'Save Financial Settings', icon: <FaSave />, bg: '#4361ee' };
    };
    const btn = getSaveBtn();

    const tabStyle = (tab) => ({
        padding: '10px 20px',
        border: 'none',
        borderBottom: activeTab === tab ? '3px solid #4361ee' : '3px solid transparent',
        background: 'none',
        cursor: 'pointer',
        fontWeight: activeTab === tab ? '700' : '500',
        color: activeTab === tab ? '#4361ee' : '#555',
        fontSize: '15px',
        transition: 'all 0.2s',
    });

    return (
        <div className="fade-in">
            <h1 className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaChartPie style={{ color: '#4361ee' }} /> Financial & Payment Settings
            </h1>
            <p style={{ color: '#888', marginBottom: '25px', fontSize: '14px' }}>
                রিভেনিউ ভাগ এবং পেমেন্ট নম্বর এখান থেকে কনফিগার করুন
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e0e6ed', marginBottom: '25px' }}>
                <button style={tabStyle('commission')} onClick={() => setActiveTab('commission')}>
                    <FaPercentage style={{ marginRight: '6px' }} /> Revenue Split
                </button>
                <button style={tabStyle('personal')} onClick={() => setActiveTab('personal')}>
                    <FaMobileAlt style={{ marginRight: '6px' }} /> Personal Payment Numbers
                </button>
            </div>

            {/* ── TAB 1: COMMISSION SPLIT ── */}
            {activeTab === 'commission' && (
                <div>
                    {/* Visual Pie Preview */}
                    <div className="admin-card" style={{ marginBottom: '25px', background: 'linear-gradient(135deg, #f8f9ff, #eef2ff)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#3b3f5c' }}>
                            Revenue Distribution Preview (Normal Orders)
                        </h3>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ display: 'flex', height: '30px', flex: 1, minWidth: '200px', borderRadius: '15px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                                <div style={{ width: `${commission.adminPercent}%`, background: '#4361ee', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>{commission.adminPercent > 5 ? `${commission.adminPercent}%` : ''}</div>
                                <div style={{ width: `${commission.sellerPercent}%`, background: '#1abc9c', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>{commission.sellerPercent > 5 ? `${commission.sellerPercent}%` : ''}</div>
                                <div style={{ width: `${commission.resellerPercent}%`, background: '#f59e0b', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>{commission.resellerPercent > 5 ? `${commission.resellerPercent}%` : ''}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                    <span style={{ width: '12px', height: '12px', background: '#4361ee', borderRadius: '50%', display: 'inline-block' }}></span>
                                    Admin: <b>{commission.adminPercent}%</b>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                    <span style={{ width: '12px', height: '12px', background: '#1abc9c', borderRadius: '50%', display: 'inline-block' }}></span>
                                    Seller: <b>{commission.sellerPercent}%</b>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                    <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>
                                    Reseller: <b>{commission.resellerPercent}%</b>
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px', fontSize: '13px', color: '#856404' }}>
                            <FaInfoCircle style={{ marginRight: '6px' }} />
                            <b>কমিশন বণ্টন নীতি:</b> এই তিনটি পারসেন্টেজ যোগফল সব সময় ১০০% হবে।
                            <br />
                            <b>উদাহরণ: ১০০০৳ প্রফিট →</b> Reseller: {Math.round(1000 * commission.resellerPercent / 100)}৳ | Seller: {Math.round(1000 * commission.sellerPercent / 100)}৳ | Admin: {Math.round(1000 * commission.adminPercent / 100)}৳
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>

                        {/* Admin Commission */}
                        <div className="admin-card" style={{ borderTop: '4px solid #4361ee' }}>
                            <h4 style={{ color: '#4361ee', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Admin Commission
                                <span style={{ fontSize: '28px', fontWeight: '800', color: '#4361ee' }}>{commission.adminPercent}%</span>
                            </h4>
                            <input
                                type="range"
                                min="0" max="100" step="1"
                                value={commission.adminPercent}
                                onChange={(e) => handleCommissionChange('adminPercent', e.target.value)}
                                style={{ width: '100%', accentColor: '#4361ee' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '5px' }}>
                                <span>0%</span><span>50%</span><span>100%</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                                প্রতিটি ডেলিভারি হওয়া অর্ডার থেকে Admin এর কমিশন
                            </p>
                        </div>

                        {/* Seller Share */}
                        <div className="admin-card" style={{ borderTop: '4px solid #1abc9c' }}>
                            <h4 style={{ color: '#1abc9c', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Seller Share
                                <span style={{ fontSize: '28px', fontWeight: '800', color: '#1abc9c' }}>{commission.sellerPercent}%</span>
                            </h4>
                            <input
                                type="range"
                                min="0" max="100" step="1"
                                value={commission.sellerPercent}
                                onChange={(e) => handleCommissionChange('sellerPercent', e.target.value)}
                                style={{ width: '100%', accentColor: '#1abc9c' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '5px' }}>
                                <span>0%</span><span>50%</span><span>100%</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                                সেলারের শেয়ার বাড়লে অ্যাডমিন ও রিসেলার শেয়ার স্বয়ংক্রিয়ভাবে ব্যালেন্স হবে
                            </p>
                        </div>

                        {/* Reseller Commission */}
                        <div className="admin-card" style={{ borderTop: '4px solid #f59e0b' }}>
                            <h4 style={{ color: '#f59e0b', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Reseller Commission
                                <span style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>{commission.resellerPercent}%</span>
                            </h4>
                            <input
                                type="range"
                                min="0" max="100" step="1"
                                value={commission.resellerPercent}
                                onChange={(e) => handleCommissionChange('resellerPercent', e.target.value)}
                                style={{ width: '100%', accentColor: '#f59e0b' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '5px' }}>
                                <span>0%</span><span>50%</span><span>100%</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                                Reseller এর অর্ডারে Reseller এর কমিশন (মোট থেকে কাটা হবে)
                            </p>
                        </div>

                        {/* Shipping Fee */}
                        <div className="admin-card" style={{ borderTop: '4px solid #e7515a' }}>
                            <h4 style={{ color: '#e7515a', marginBottom: '15px' }}>Default Shipping Fee (৳)</h4>
                            <input
                                type="number"
                                value={commission.shippingFee}
                                onChange={(e) => setCommission(prev => ({ ...prev, shippingFee: Number(e.target.value) }))}
                                style={{ width: '100%', padding: '12px', fontSize: '20px', fontWeight: '700', borderRadius: '8px', border: '2px solid #e7515a', textAlign: 'center', boxSizing: 'border-box' }}
                            />
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                                Checkout পেজে প্রতিটি অর্ডারে এই Delivery Charge যোগ হবে
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 2: PERSONAL NUMBERS ── */}
            {activeTab === 'personal' && (
                <div>
                    <div className="admin-card" style={{ marginBottom: '20px', background: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                        <p style={{ color: '#2e7d32', margin: 0, fontSize: '14px', lineHeight: '1.7' }}>
                            <b>🟢 Personal Number Payment কী?</b><br />
                            Customer checkout এ আপনার Personal bKash/Nagad নম্বর দেখবে, সেখানে টাকা পাঠিয়ে <b>Transaction ID (TxID)</b> দেবে।
                            আপনি Admin Orders এ গিয়ে TxID যাচাই করে Order Confirm করবেন।
                            <br /><br />
                            <b>UddoktaPay চালু থাকলে</b>, UddoktaPay দিয়ে Payment হবে। UddoktaPay বন্ধ থাকলে এই Personal Number দেখাবে।
                        </p>
                    </div>

                    {['bkash', 'nagad', 'rocket'].map(method => {
                        const colors = { bkash: '#d12053', nagad: '#f85606', rocket: '#8c3494' };
                        const color = colors[method];
                        const data = personalNumbers[method] || { number: '', enabled: false };

                        return (
                            <div key={method} className="admin-card" style={{ borderTop: `4px solid ${color}`, marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ color, margin: 0, fontSize: '18px', textTransform: 'capitalize' }}>
                                        <FaMobileAlt style={{ marginRight: '8px' }} />
                                        {method.charAt(0).toUpperCase() + method.slice(1)} Personal Number
                                    </h4>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={data.enabled || false}
                                            onChange={(e) => setPersonalNumbers(prev => ({
                                                ...prev,
                                                [method]: { ...prev[method], enabled: e.target.checked }
                                            }))}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <FaMobileAlt style={{ color, fontSize: '20px', flexShrink: 0 }} />
                                    <input
                                        type="tel"
                                        value={data.number || ''}
                                        onChange={(e) => setPersonalNumbers(prev => ({
                                            ...prev,
                                            [method]: { ...prev[method], number: e.target.value }
                                        }))}
                                        placeholder={`আপনার Personal ${method.charAt(0).toUpperCase() + method.slice(1)} নম্বর (01XXXXXXXXX)`}
                                        disabled={!data.enabled}
                                        style={{
                                            flex: 1,
                                            padding: '12px 15px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            border: `2px solid ${data.enabled ? color : '#e0e6ed'}`,
                                            transition: 'all 0.2s',
                                            background: data.enabled ? '#fff' : '#f8f9fa',
                                            color: data.enabled ? '#333' : '#aaa'
                                        }}
                                    />
                                </div>

                                {data.enabled && data.number && (
                                    <div style={{ marginTop: '12px', padding: '10px 15px', background: '#f0fdf4', border: `1px solid ${color}44`, borderRadius: '8px', fontSize: '13px', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaCheckCircle style={{ color: '#2e7d32' }} /> Checkout এ Customer দেখবে: <b>"Send ৳[amount] to {data.number} ({method.charAt(0).toUpperCase() + method.slice(1)})"</b>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                        padding: '14px 32px', background: btn.bg, color: 'white',
                        border: 'none', borderRadius: '10px',
                        cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                        fontSize: '15px', fontWeight: '700',
                        boxShadow: '0 4px 15px rgba(67,97,238,0.3)',
                        transition: 'all 0.3s'
                    }}
                >
                    {btn.icon} {btn.text}
                </button>
            </div>

            <style>{`
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; }
                input:checked + .slider { background-color: #1abc9c; }
                input:checked + .slider:before { transform: translateX(20px); }
                .slider.round { border-radius: 24px; }
                .slider.round:before { border-radius: 50%; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default FinancialSettings;
