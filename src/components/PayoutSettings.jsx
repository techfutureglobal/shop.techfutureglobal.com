import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { FaMobileAlt, FaUniversity, FaSave, FaCheckCircle } from 'react-icons/fa';

const PayoutSettings = ({ isAdmin = false }) => {
    const { user, adminPaymentMethods, updateAdminPaymentMethod, updateUserWithdrawalAccounts } = useContext(ShopContext);

    // Determine which data to use based on role
    const initialData = isAdmin
        ? adminPaymentMethods
        : (user?.withdrawalAccounts || {
            bkash: { number: '', type: 'Personal' },
            nagad: { number: '', type: 'Personal' },
            rocket: { number: '', type: 'Personal' }
        });

    const [formData, setFormData] = useState(initialData);
    const [saved, setSaved] = useState(false);

    const handleChange = (method, field, value) => {
        setFormData(prev => ({
            ...prev,
            [method]: { ...prev[method], [field]: value }
        }));
        setSaved(false);
    };

    const handleSave = () => {
        if (isAdmin) {
            Object.keys(formData).forEach(method => {
                updateAdminPaymentMethod(method, formData[method]);
            });
        } else {
            updateUserWithdrawalAccounts(formData);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="payout-settings-card" style={{ background: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #e0e6ed', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#3b3f5c' }}>
                    {isAdmin ? 'Payment Receiving Accounts' : 'Withdrawal Accounts'}
                </h3>
                {saved && (
                    <span style={{ color: '#1abc9c', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaCheckCircle /> Saved Successfully
                    </span>
                )}
            </div>

            <p style={{ color: '#888', fontSize: '14px', marginBottom: '25px' }}>
                {isAdmin
                    ? 'Configure the accounts where customers will send payments. These will be shown on the checkout page.'
                    : 'Set up your mobile banking accounts to receive payouts from the platform.'}
            </p>

            <div className="payout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* bKash */}
                <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#fff9fb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#d12053', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <FaMobileAlt />
                        </div>
                        <span style={{ fontWeight: '700', color: '#d12053' }}>bKash</span>
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.bkash?.number || ''}
                            onChange={(e) => handleChange('bkash', 'number', e.target.value)}
                            placeholder="017XXXXXXXX"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e0e6ed' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Account Type</label>
                        <select
                            className="form-control"
                            value={formData.bkash?.type || 'Personal'}
                            onChange={(e) => handleChange('bkash', 'type', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e0e6ed', background: 'white' }}
                        >
                            <option value="Personal">Personal</option>
                            <option value="Agent">Agent</option>
                            <option value="Merchant">Merchant</option>
                        </select>
                    </div>
                </div>

                {/* Nagad */}
                <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#fff9f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#f85606', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <FaMobileAlt />
                        </div>
                        <span style={{ fontWeight: '700', color: '#f85606' }}>Nagad</span>
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.nagad?.number || ''}
                            onChange={(e) => handleChange('nagad', 'number', e.target.value)}
                            placeholder="017XXXXXXXX"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e0e6ed' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Account Type</label>
                        <select
                            className="form-control"
                            value={formData.nagad?.type || 'Personal'}
                            onChange={(e) => handleChange('nagad', 'type', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e0e6ed', background: 'white' }}
                        >
                            <option value="Personal">Personal</option>
                            <option value="Agent">Agent</option>
                        </select>
                    </div>
                </div>

                {/* Rocket */}
                <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8f5ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#8c3494', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <FaMobileAlt />
                        </div>
                        <span style={{ fontWeight: '700', color: '#8c3494' }}>Rocket</span>
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.rocket?.number || ''}
                            onChange={(e) => handleChange('rocket', 'number', e.target.value)}
                            placeholder="017XXXXXXXXX"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e0e6ed' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Account Type</label>
                        <select
                            className="form-control"
                            value={formData.rocket?.type || 'Personal'}
                            onChange={(e) => handleChange('rocket', 'type', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e0e6ed', background: 'white' }}
                        >
                            <option value="Personal">Personal</option>
                            <option value="Agent">Agent</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                style={{
                    marginTop: '25px',
                    padding: '12px 25px',
                    background: '#4361ee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <FaSave /> Save {isAdmin ? 'Admin' : 'Account'} Settings
            </button>
        </div>
    );
};

export default PayoutSettings;
