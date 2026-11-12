import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaTruck, FaSave, FaCheck, FaTimes } from 'react-icons/fa';

const CourierSettings = () => {
    const { user, courierConfig, updateCourierConfig } = useContext(ShopContext);

    if (user?.role !== 'admin') {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '50px' }}>
                <FaTruck style={{ fontSize: '50px', color: '#888ea8', marginBottom: '20px' }} />
                <h2>Access Restricted</h2>
                <p style={{ color: '#888ea8' }}>Only system administrators can configure platform-wide courier API settings.</p>
            </div>
        );
    }

    // Local state for form inputs to avoid direct context updates on every keystroke
    const [config, setConfig] = useState(courierConfig);

    const handleChange = (provider, field, value) => {
        setConfig(prev => ({
            ...prev,
            [provider]: { ...prev[provider], [field]: value }
        }));
    };

    const handleSave = (provider) => {
        updateCourierConfig(provider, config[provider]);
        alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} settings saved successfully!`);
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1>Courier Management</h1>
                    <div style={{ fontSize: '14px', color: '#888ea8' }}>Configure API keys for third-party logistics</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

                {/* Steadfast Courier Settings */}
                <div className="admin-card">
                    <div className="card-header" style={{ borderBottom: '1px solid #e0e6ed', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaTruck color="#e2a03f" /> Steadfast Courier
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '14px', color: config.steadfast.enabled ? '#1abc9c' : '#e7515a', fontWeight: 'bold' }}>
                                {config.steadfast.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={config.steadfast.enabled}
                                    onChange={(e) => handleChange('steadfast', 'enabled', e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Base URL (API Endpoint)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={config.steadfast.baseUrl}
                            onChange={(e) => handleChange('steadfast', 'baseUrl', e.target.value)}
                            placeholder="https://portal.steadfast.com.bd/api/v1"
                        />
                    </div>
                    <div className="form-group">
                        <label>API Key</label>
                        <input
                            type="text"
                            className="form-control"
                            value={config.steadfast.apiKey}
                            onChange={(e) => handleChange('steadfast', 'apiKey', e.target.value)}
                            placeholder="Enter Steadfast API Key"
                        />
                    </div>
                    <div className="form-group">
                        <label>Secret Key</label>
                        <input
                            type="password"
                            className="form-control"
                            value={config.steadfast.secretKey}
                            onChange={(e) => handleChange('steadfast', 'secretKey', e.target.value)}
                            placeholder="Enter Steadfast Secret Key"
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <button className="btn btn-primary" onClick={() => handleSave('steadfast')}>
                            <FaSave style={{ marginRight: '5px' }} /> Save Configuration
                        </button>
                    </div>
                </div>

                {/* Pathao Courier Settings */}
                <div className="admin-card">
                    <div className="card-header" style={{ borderBottom: '1px solid #e0e6ed', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaTruck color="#e7515a" /> Pathao Courier
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '14px', color: config.pathao.enabled ? '#1abc9c' : '#e7515a', fontWeight: 'bold' }}>
                                {config.pathao.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={config.pathao.enabled}
                                    onChange={(e) => handleChange('pathao', 'enabled', e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Base URL</label>
                        <input
                            type="text"
                            className="form-control"
                            value={config.pathao.baseUrl}
                            readOnly
                            style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Client ID / API Key</label>
                        <input
                            type="text"
                            className="form-control"
                            value={config.pathao.apiKey}
                            onChange={(e) => handleChange('pathao', 'apiKey', e.target.value)}
                            placeholder="Enter Pathao Client ID"
                        />
                    </div>
                    <div className="form-group">
                        <label>Client Secret</label>
                        <input
                            type="password"
                            className="form-control"
                            value={config.pathao.secretKey}
                            onChange={(e) => handleChange('pathao', 'secretKey', e.target.value)}
                            placeholder="Enter Pathao Client Secret"
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <button className="btn btn-primary" onClick={() => handleSave('pathao')}>
                            <FaSave style={{ marginRight: '5px' }} /> Save Configuration
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CourierSettings;
