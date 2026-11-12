import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaStore, FaSave } from 'react-icons/fa';
import { compressImage } from '../../utils/imageHandler';

const OfficialStore = () => {
    const { sellers, updateStoreDetails, user } = useContext(ShopContext);
    const [storeForm, setStoreForm] = useState({
        storeName: '',
        logo: '',
        banner: '',
        metaPixelId: '',
        googleAnalyticsId: ''
    });

    const officialStoreId = user?.id; // dynamically get the logged in store ID
    const officialStore = sellers.find(s => s.id === officialStoreId) || user;

    useEffect(() => {
        if (officialStore) {
            setStoreForm({
                storeName: officialStore.store_name || officialStore.storeName || '',
                logo: officialStore.store_logo || officialStore.logo || '',
                banner: officialStore.store_banner || officialStore.banner || '',
                metaPixelId: officialStore.meta_pixel_id || officialStore.metaPixelId || '',
                googleAnalyticsId: officialStore.google_analytics_id || officialStore.googleAnalyticsId || ''
            });
        }
    }, [officialStore]);

    const handleImageUpload = async (field, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const url = await compressImage(file, 1000, 0.7);
                setStoreForm(prev => ({ ...prev, [field]: url }));
            } catch (error) {
                console.error("Image upload failed", error);
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const res = await updateStoreDetails(officialStoreId, storeForm);
        if (res.success) {
            alert('Store settings updated successfully!');
        } else {
            alert('Failed to update store settings. Please check console.');
        }
    };

    if (!officialStore) return <div>Loading...</div>;

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Official Store Settings</h1>
                <a
                    href={user?.role === 'reseller' ? `/shop/${user?.id}` : `/store/${user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#00b5ff', color: 'white', border: 'none' }}
                >
                    <FaStore /> View My Landing Page
                </a>
            </div>

            <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="admin-card">
                    <h3>Store Details</h3>
                    <form onSubmit={handleUpdate} className="store-form">
                        <div className="form-group">
                            <label>Store Name</label>
                            <input
                                type="text"
                                value={storeForm.storeName}
                                onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Banner Image (URL or File Upload)</label>
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                <input
                                    type="text"
                                    value={storeForm.banner}
                                    onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })}
                                    className="form-control"
                                    placeholder="https://example.com/banner.jpg"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    style={{ padding: '6px' }}
                                    onChange={(e) => handleImageUpload('banner', e)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Logo Image (URL or File Upload)</label>
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                <input
                                    type="text"
                                    value={storeForm.logo}
                                    onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                                    className="form-control"
                                    placeholder="https://example.com/logo.jpg"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    style={{ padding: '6px' }}
                                    onChange={(e) => handleImageUpload('logo', e)}
                                />
                            </div>
                        </div>

                        <div className="tracking-section" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <h4>Analytics & Tracking</h4>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Meta Pixel ID</label>
                                    <input
                                        type="text"
                                        value={storeForm.metaPixelId}
                                        onChange={(e) => setStoreForm({ ...storeForm, metaPixelId: e.target.value })}
                                        className="form-control"
                                        placeholder="Enter Pixel ID"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Google Analytics ID</label>
                                    <input
                                        type="text"
                                        value={storeForm.googleAnalyticsId}
                                        onChange={(e) => setStoreForm({ ...storeForm, googleAnalyticsId: e.target.value })}
                                        className="form-control"
                                        placeholder="G-XXXXXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
                            <FaSave /> Save Changes
                        </button>
                    </form>
                </div>

                <div className="admin-card preview-card">
                    <h3>Live Preview</h3>
                    <div className="store-preview" style={{
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '120px',
                            backgroundImage: `url(${storeForm.banner || 'https://placehold.co/600x200'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', bottom: '-20px', left: '20px', padding: '3px', background: 'white', borderRadius: '50%' }}>
                                <img
                                    src={storeForm.logo || 'https://placehold.co/80'}
                                    alt="Logo"
                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '30px 20px 20px 20px' }}>
                            <h4 style={{ margin: 0 }}>{storeForm.storeName || 'Store Name'}</h4>
                            <span className="badge badge-success" style={{ fontSize: '10px', marginTop: '5px', display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px' }}>Official</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficialStore;
