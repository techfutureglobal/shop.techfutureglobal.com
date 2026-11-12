import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { compressImage } from '../../utils/imageHandler';
import { FaPlus, FaTrash, FaLink, FaImage, FaSave } from 'react-icons/fa';

const EmergencyServiceManager = () => {
    const { siteConfig, updateSiteConfig } = useContext(ShopContext);
    const [services, setServices] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (siteConfig?.emergencyServices) {
            setServices(siteConfig.emergencyServices);
        }
    }, [siteConfig]);

    const handleAddService = () => {
        const newService = {
            id: Date.now(),
            name: '',
            img: 'https://img.icons8.com/flat-round/200/plus.png',
            url: '#'
        };
        setServices([...services, newService]);
    };

    const handleRemoveService = (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            setServices(services.filter(s => s.id !== id));
        }
    };

    const handleChange = (id, field, value) => {
        setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleImageUpload = async (id, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 400, 0.8);
                handleChange(id, 'img', compressed);
            } catch (err) {
                console.error('Image upload error:', err);
                alert('Failed to upload image.');
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const newConfig = { ...siteConfig, emergencyServices: services };
            await updateSiteConfig(newConfig);
            alert('Emergency Services updated successfully!');
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="section-header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1>Emergency Service Manager</h1>
                    <p style={{ color: '#666' }}>Manage the "All Emergency Services" section on the homepage.</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaSave /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Service List</h3>
                    <button className="btn btn-secondary btn-sm" onClick={handleAddService}>
                        <FaPlus /> Add New Service
                    </button>
                </div>

                <div className="services-grid-admin" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {services.map((service, index) => (
                        <div key={service.id} className="service-item-card" style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', background: '#f9f9f9', position: 'relative' }}>
                            <button 
                                onClick={() => handleRemoveService(service.id)} 
                                style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Delete Service"
                            >
                                <FaTrash size={12} />
                            </button>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ width: '80px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'white', border: '1px solid #ddd', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={service.img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                                    </div>
                                    <label className="upload-label" style={{ display: 'block', textAlign: 'center', fontSize: '11px', color: '#f85606', cursor: 'pointer' }}>
                                        <FaImage /> Change
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(service.id, e)} />
                                    </label>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600' }}>Service Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={service.name} 
                                            onChange={(e) => handleChange(service.id, 'name', e.target.value)}
                                            placeholder="e.g. MEDICAL"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '12px', fontWeight: '600' }}>Target Link (URL)</label>
                                        <div style={{ position: 'relative' }}>
                                            <FaLink style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                style={{ paddingLeft: '30px' }}
                                                value={service.url} 
                                                onChange={(e) => handleChange(service.id, 'url', e.target.value)}
                                                placeholder="e.g. /medical-page or https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {services.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No services added yet. Click "Add New Service" to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyServiceManager;
