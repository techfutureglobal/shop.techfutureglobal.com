import React, { useState, useContext, useMemo } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaSave, FaGlobe } from 'react-icons/fa';
import './Reseller.css';
import { compressImage } from '../../utils/imageHandler';

const ResellerPageEditor = () => {
    const { user, resellerStores, updateResellerStore } = useContext(ShopContext);

    // Get my store config
    const myStore = useMemo(() => {
        return resellerStores.find(s => s.userId === user?.id) || {
            title: 'My Store',
            description: 'The best deals!',
            logo: 'https://placehold.co/100',
            banner: 'https://placehold.co/1200x300/1e293b/white?text=My+Store+Banner',
            slug: 'my-store'
        };
    }, [resellerStores, user]);

    const [storeForm, setStoreForm] = useState(myStore);

    const saveStoreDetails = () => {
        updateResellerStore(user.id, storeForm);
        alert('Store details saved!');
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const url = await compressImage(file, 1000, 0.7);
                setStoreForm({ ...storeForm, [field]: url });
            } catch (error) {
                console.error('Image upload failed', error);
            }
        }
    };

    return (
        <div className="admin-container-inner" style={{ padding: '25px' }}>
            <div className="admin-page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#3b3f5c' }}>Landing Page Designer</h1>
                    <p style={{ color: '#888ea8', fontSize: '14px' }}>Customize your public storefront and branding.</p>
                </div>
                <button className="btn-save-store" onClick={() => window.open(`/shop/${storeForm.slug}`, '_blank')} style={{ background: '#38bdf8', color: 'white', border: 'none', padding: '10px 20px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaGlobe /> View Live Shop
                </button>
            </div>

            <div className="split-view">
                <div className="editor-form">
                    <div className="admin-card">
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Store Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={storeForm.title}
                                onChange={(e) => setStoreForm({ ...storeForm, title: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Store Slug (URL Path)</label>
                            <div className="slug-input" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                                <span style={{ padding: '0 15px', color: '#64748b' }}>/shop/</span>
                                <input
                                    type="text"
                                    value={storeForm.slug}
                                    onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                                    style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Short Description</label>
                            <textarea
                                className="form-control"
                                value={storeForm.description}
                                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Logo</label>
                            <div className="upload-box" onClick={() => document.getElementById('logo-up').click()} style={{ width: '100px', height: '100px', border: '2px dashed #ddd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                                {storeForm.logo ? <img src={storeForm.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '12px', color: '#999' }}>Upload Logo</span>}
                                <input type="file" id="logo-up" hidden onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Banner Image</label>
                            <div className="upload-box banner-box" onClick={() => document.getElementById('banner-up').click()} style={{ width: '100%', height: '150px', border: '2px dashed #ddd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                                {storeForm.banner ? <img src={storeForm.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '12px', color: '#999' }}>Upload Banner</span>}
                                <input type="file" id="banner-up" hidden onChange={(e) => handleFileUpload(e, 'banner')} accept="image/*" />
                            </div>
                        </div>

                        <button className="btn-save-store" onClick={saveStoreDetails} style={{ width: '100%', padding: '15px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <FaSave /> Save Design Changes
                        </button>
                    </div>
                </div>

                <div className="editor-preview" style={{ flex: 1, marginLeft: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Live Mockup</h3>
                    <div className="preview-mockup" style={{ border: '8px solid #0f172a', borderRadius: '20px', height: '500px', overflow: 'hidden', background: 'white' }}>
                        <div className="mock-header" style={{ background: '#f1f5f9', padding: '10px', display: 'flex', gap: '5px' }}>
                            {[1, 2, 3].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }}></div>)}
                        </div>
                        <div className="mock-content" style={{ height: 'calc(100% - 30px)', overflowY: 'auto' }}>
                            <div className="mock-banner" style={{ height: '120px', background: `url(${storeForm.banner}) center/cover`, position: 'relative' }}>
                                <div className="mock-logo" style={{ position: 'absolute', bottom: '-25px', left: '20px', width: '50px', height: '50px', borderRadius: '50%', border: '3px solid white', overflow: 'hidden', background: 'white' }}>
                                    <img src={storeForm.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            </div>
                            <div className="mock-text" style={{ padding: '35px 20px 20px' }}>
                                <h4 style={{ margin: '0 0 5px' }}>{storeForm.title}</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{storeForm.description}</p>
                            </div>
                            <div className="mock-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '0 20px' }}>
                                {[1, 2, 3].map(i => <div key={i} style={{ aspectRatio: '1', background: '#f1f5f9', borderRadius: '5px' }}></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResellerPageEditor;
