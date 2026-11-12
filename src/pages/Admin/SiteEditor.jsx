import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { compressImage } from '../../utils/imageHandler';
import {
    FaPalette, FaImages, FaBullhorn, FaHeading, FaWindowMaximize,
    FaRobot, FaSave, FaPlus, FaTrash, FaCheckCircle, FaSpinner,
    FaFacebook, FaYoutube, FaInstagram, FaTwitter, FaPhoneAlt,
    FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaLink, FaImage, FaAmbulance, FaHeadset
} from 'react-icons/fa';
import './SiteEditor.css';

const SiteEditor = () => {
    const { siteConfig, updateSiteConfig } = useContext(ShopContext);

    const [isLoaded, setIsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'hero' | 'banners' | 'header' | 'footer' | 'ai'
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const [toastMessage, setToastMessage] = useState(null);

    const [sliderItems, setSliderItems] = useState([]);
    const [adData, setAdData] = useState({ image: '', url: '#' });
    const [homeBanners, setHomeBanners] = useState([
        { id: '1', image: '', url: '#' },
        { id: '2', image: '', url: '#' }
    ]);
    const [emergencyBanners, setEmergencyBanners] = useState([
        { id: 'eb1', image: '', url: '#' },
        { id: 'eb2', image: '', url: '#' }
    ]);
    const [config, setConfig] = useState({
        siteTitle: '',
        fontSize: '14px',
        whatsappNumber: '',
        themeColor: '#f2422b',
        buttonColor: '#f2422b',
        favicon: '',
        header: { logoText: '', logoImage: '', supportLabel: '24/7 SUPPORT', supportPhone: '+880 1700-000000', topBarLinks: [], middleBarLinks: [] },
        footer: {
            column1: { title: '', links: [] },
            column2: { title: '', links: [] },
            column3: { title: '', links: [] },
            description: '',
            contact: { address: '', email: '', phone: '', whatsapp: '' },
            appLinks: { playStore: '', appStore: '' },
            socials: { facebook: '', youtube: '', instagram: '', twitter: '' },
            copyright: '',
            backgroundImage: '',
            textColor: '#ffffff',
            headerColor: '#f2422b'
        },
        aiPrompt: '',
        aiApiKey: ''
    });

    useEffect(() => {
        if (siteConfig) {
            setSliderItems(siteConfig.heroSlider || []);
            setAdData(siteConfig.heroAd || { image: '', url: '#' });
            setHomeBanners(siteConfig.homeBanners || [
                { id: '1', image: '', url: '#' },
                { id: '2', image: '', url: '#' }
            ]);
            setEmergencyBanners(siteConfig.emergencyBanners || [
                { id: 'eb1', image: '', url: '#' },
                { id: 'eb2', image: '', url: '#' }
            ]);

            const mergedConfig = {
                siteTitle: siteConfig.siteTitle || 'Ebaybd',
                fontSize: siteConfig.fontSize || '14px',
                whatsappNumber: siteConfig.whatsappNumber || '',
                themeColor: siteConfig.themeColor || '#f2422b',
                buttonColor: siteConfig.buttonColor || '#f2422b',
                favicon: siteConfig.favicon || '',
                header: {
                    logoText: 'Ebaybd',
                    logoImage: '',
                    supportLabel: '24/7 SUPPORT',
                    supportPhone: '+880 1700-000000',
                    topBarLinks: [],
                    middleBarLinks: [],
                    ...(siteConfig.header || {})
                },
                footer: {
                    column1: { title: 'Customer Care', links: [] },
                    column2: { title: 'Quick Links', links: [] },
                    column3: { title: 'Information', links: [] },
                    description: '',
                    contact: { address: '', email: '', phone: '', whatsapp: '' },
                    appLinks: { playStore: '', appStore: '' },
                    socials: { facebook: '', youtube: '', instagram: '', twitter: '' },
                    copyright: `© ${new Date().getFullYear()} Ebaybd`,
                    backgroundImage: '',
                    textColor: '#ffffff',
                    headerColor: '#f2422b',
                    ...(siteConfig.footer || {})
                },
                aiPrompt: siteConfig.aiPrompt || '',
                aiApiKey: siteConfig.aiApiKey || ''
            };

            setConfig(mergedConfig);
            setIsLoaded(true);
        }
    }, [siteConfig]);

    const showToast = (msg, type = 'success') => {
        setToastMessage({ text: msg, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    if (!isLoaded) return <div className="se-card">Loading site settings...</div>;

    // --- Slider Handlers ---
    const handleSliderChange = (id, field, value) => {
        setSliderItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleAddSlide = () => {
        const nextId = 'slide_' + Date.now();
        setSliderItems(prev => [...prev, { id: nextId, image: '', url: '/shop' }]);
    };

    const handleRemoveSlide = (id) => {
        setSliderItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSliderImageUpload = async (id, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 1600, 0.7);
                handleSliderChange(id, 'image', compressed);
            } catch (err) {
                console.error('Slider compression error:', err);
            }
        }
    };

    const handleAdImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 800, 0.7);
                setAdData(prev => ({ ...prev, image: compressed }));
            } catch (err) {
                console.error('Ad compression error:', err);
            }
        }
    };

    // --- Home & Emergency Banners Handlers ---
    const handleHomeBannerChange = (id, field, value) => {
        setHomeBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const handleHomeBannerImageUpload = async (id, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 1000, 0.7);
                handleHomeBannerChange(id, 'image', compressed);
            } catch (err) {
                console.error('Home banner compression error:', err);
            }
        }
    };

    const handleEmergencyBannerChange = (id, field, value) => {
        setEmergencyBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const handleEmergencyBannerImageUpload = async (id, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 1500, 0.7);
                handleEmergencyBannerChange(id, 'image', compressed);
            } catch (err) {
                console.error('Emergency banner compression error:', err);
            }
        }
    };

    // --- Branding Handlers ---
    const handleBrandingChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleFaviconUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 128, 0.8);
                handleBrandingChange('favicon', compressed);
            } catch (err) {
                console.error('Favicon compression error:', err);
            }
        }
    };

    // --- Header & Logo Handlers ---
    const handleHeaderChange = (field, value) => {
        setConfig(prev => ({ ...prev, header: { ...prev.header, [field]: value } }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 600, 0.8);
                handleHeaderChange('logoImage', compressed);
            } catch (err) {
                console.error('Logo compression error:', err);
            }
        }
    };

    const updateHeaderLink = (id, field, value) => {
        const newLinks = config.header.topBarLinks.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        setConfig(prev => ({ ...prev, header: { ...prev.header, topBarLinks: newLinks } }));
    };

    const addHeaderLink = () => {
        const newLink = { id: Date.now(), text: 'New Link', url: '#' };
        setConfig(prev => ({
            ...prev,
            header: {
                ...prev.header,
                topBarLinks: [...(prev.header.topBarLinks || []), newLink]
            }
        }));
    };

    const removeHeaderLink = (id) => {
        setConfig(prev => ({
            ...prev,
            header: {
                ...prev.header,
                topBarLinks: (prev.header.topBarLinks || []).filter(l => l.id !== id)
            }
        }));
    };

    // --- Footer Handlers ---
    const handleFooterChange = (field, value) => {
        setConfig(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
    };

    const handleFooterNestedChange = (parent, field, value) => {
        setConfig(prev => ({
            ...prev,
            footer: {
                ...prev.footer,
                [parent]: { ...prev.footer[parent], [field]: value }
            }
        }));
    };

    const handleFooterColTitle = (col, value) => {
        setConfig(prev => ({
            ...prev,
            footer: {
                ...prev.footer,
                [col]: { ...prev.footer[col], title: value }
            }
        }));
    };

    const updateFooterLink = (col, id, field, value) => {
        const newLinks = (config.footer[col]?.links || []).map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        setConfig(prev => ({
            ...prev,
            footer: {
                ...prev.footer,
                [col]: { ...prev.footer[col], links: newLinks }
            }
        }));
    };

    const addFooterLink = (col) => {
        const newLink = { id: Date.now(), text: 'Quick Link', url: '#' };
        setConfig(prev => ({
            ...prev,
            footer: {
                ...prev.footer,
                [col]: {
                    ...prev.footer[col],
                    links: [...(prev.footer[col]?.links || []), newLink]
                }
            }
        }));
    };

    const removeFooterLink = (col, id) => {
        setConfig(prev => ({
            ...prev,
            footer: {
                ...prev.footer,
                [col]: {
                    ...prev.footer[col],
                    links: (prev.footer[col]?.links || []).filter(l => l.id !== id)
                }
            }
        }));
    };

    const handleFooterBgUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 1920, 0.6);
                handleFooterChange('backgroundImage', compressed);
            } catch (err) {
                console.error('Footer background compression error:', err);
            }
        }
    };

    // --- Save All Changes ---
    const saveChanges = async () => {
        setSaveStatus('saving');
        const finalConfig = {
            ...config,
            heroSlider: sliderItems,
            heroAd: adData,
            homeBanners: homeBanners,
            emergencyBanners: emergencyBanners,
            aiPrompt: config.aiPrompt || '',
            aiApiKey: config.aiApiKey || ''
        };

        const res = await updateSiteConfig(finalConfig);
        setSaveStatus('idle');
        if (res?.success) {
            showToast('All Site Settings Saved Successfully!', 'success');
        } else {
            showToast('Notice: Saved to browser cache!', 'success');
        }
    };

    const looksLikeImageUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        const lower = url.toLowerCase().trim();
        return (
            lower.startsWith('data:image') ||
            lower.includes('images?q=') ||
            lower.includes('googleusercontent.com') ||
            lower.includes('gstatic.com/images') ||
            lower.includes('unsplash.com') ||
            lower.includes('cloudinary.com') ||
            lower.includes('imgur.com') ||
            lower.endsWith('.jpg') ||
            lower.endsWith('.jpeg') ||
            lower.endsWith('.png') ||
            lower.endsWith('.webp') ||
            lower.endsWith('.gif') ||
            lower.endsWith('.svg') ||
            lower.includes('.jpg?') ||
            lower.includes('.jpeg?') ||
            lower.includes('.png?') ||
            lower.includes('.webp?')
        );
    };

    return (
        <div className="site-editor-container">
            {/* Top Bar with Title & Save Action */}
            <div className="se-header-bar">
                <div className="se-title-area">
                    <h1>Site Editor Studio</h1>
                    <p>Customize your store's branding, layout, banners, headers, footers and AI settings.</p>
                </div>
                <div className="se-actions">
                    <button
                        className="se-save-btn"
                        onClick={saveChanges}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? <FaSpinner className="spin" /> : <FaSave />}
                        {saveStatus === 'saving' ? 'Saving Changes...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="se-tabs-nav">
                <button
                    className={`se-tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('branding')}
                >
                    <FaPalette className="se-tab-icon" /> Branding & Colors
                </button>
                <button
                    className={`se-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hero')}
                >
                    <FaImages className="se-tab-icon" /> Hero Sliders & Ads
                </button>
                <button
                    className={`se-tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
                    onClick={() => setActiveTab('banners')}
                >
                    <FaBullhorn className="se-tab-icon" /> Promotional Banners
                </button>
                <button
                    className={`se-tab-btn ${activeTab === 'header' ? 'active' : ''}`}
                    onClick={() => setActiveTab('header')}
                >
                    <FaHeading className="se-tab-icon" /> Header & Logo
                </button>
                <button
                    className={`se-tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('footer')}
                >
                    <FaWindowMaximize className="se-tab-icon" /> Footer & Links
                </button>
                <button
                    className={`se-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai')}
                >
                    <FaRobot className="se-tab-icon" /> AI Chatbot
                </button>
            </div>

            {/* TAB 1: BRANDING & THEME */}
            {activeTab === 'branding' && (
                <div className="se-tab-content">
                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaPalette style={{ color: 'var(--primary-color)' }} /> General Identity & Appearance</h3>
                            <p>Configure store name, typography, brand colors and favicon.</p>
                        </div>

                        <div className="se-grid-2">
                            <div className="se-form-group">
                                <label>Browser Tab Title (SEO Title)</label>
                                <input
                                    type="text"
                                    value={config.siteTitle}
                                    className="se-input"
                                    onChange={(e) => handleBrandingChange('siteTitle', e.target.value)}
                                    placeholder="e.g. Ebaybd | Online Shopping Mall"
                                />
                                <span className="se-help-text">Appears in Google search and browser tabs.</span>
                            </div>

                            <div className="se-form-group">
                                <label>Base Font Size</label>
                                <input
                                    type="text"
                                    value={config.fontSize || '14px'}
                                    className="se-input"
                                    onChange={(e) => handleBrandingChange('fontSize', e.target.value)}
                                    placeholder="e.g. 14px"
                                />
                            </div>
                        </div>

                        <div className="se-grid-2" style={{ marginTop: '10px' }}>
                            <div className="se-form-group">
                                <label><FaWhatsapp style={{ color: '#25D366' }} /> WhatsApp Support Hotline</label>
                                <input
                                    type="text"
                                    value={config.whatsappNumber || ''}
                                    className="se-input"
                                    onChange={(e) => handleBrandingChange('whatsappNumber', e.target.value)}
                                    placeholder="e.g. 8801700000000"
                                />
                                <span className="se-help-text">Include country code (e.g. 880 for Bangladesh).</span>
                            </div>

                            <div className="se-form-group">
                                <label>Favicon (Browser Tab Icon)</label>
                                <div className="se-upload-box">
                                    <input
                                        type="text"
                                        value={config.favicon || ''}
                                        placeholder="Paste favicon URL or upload below..."
                                        className="se-input"
                                        onChange={(e) => handleBrandingChange('favicon', e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFaviconUpload}
                                    />
                                    {config.favicon && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Preview:</span>
                                            <img src={config.favicon} alt="Favicon" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="se-grid-2" style={{ marginTop: '10px' }}>
                            <div className="se-form-group">
                                <label>Primary Theme Color</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="color"
                                        value={config.themeColor || '#f2422b'}
                                        onChange={(e) => handleBrandingChange('themeColor', e.target.value)}
                                        style={{ width: '50px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        value={config.themeColor || '#f2422b'}
                                        className="se-input"
                                        onChange={(e) => handleBrandingChange('themeColor', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="se-form-group">
                                <label>Buttons & Highlights Color</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="color"
                                        value={config.buttonColor || '#f2422b'}
                                        onChange={(e) => handleBrandingChange('buttonColor', e.target.value)}
                                        style={{ width: '50px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        value={config.buttonColor || '#f2422b'}
                                        className="se-input"
                                        onChange={(e) => handleBrandingChange('buttonColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: HERO SLIDER & SIDE AD */}
            {activeTab === 'hero' && (
                <div className="se-tab-content">
                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaImages style={{ color: 'var(--primary-color)' }} /> Homepage Hero Slider</h3>
                            <p>Upload and manage up to 5-6 dynamic rotating banners for the homepage.</p>
                        </div>

                        <div className="se-grid-2">
                            {sliderItems.map((slide, index) => (
                                <div key={slide.id} className="se-banner-card">
                                    <div className="se-banner-header">
                                        <h4><FaImage /> Slide #{index + 1}</h4>
                                        <button className="se-btn-icon-danger" onClick={() => handleRemoveSlide(slide.id)}>
                                            <FaTrash /> Remove
                                        </button>
                                    </div>

                                    {/* Preview Box with placeholder & error handling */}
                                    <div style={{
                                        width: '100%',
                                        height: '140px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        marginBottom: '14px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        {slide.image ? (
                                            <img
                                                src={slide.image}
                                                alt={`Slide ${index + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                <FaImage size={24} />
                                                <span>কোনো ছবি যুক্ত করা হয়নি (নিচের ঘরে ছবির লিংক দিন)</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="se-form-group">
                                        <label style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                                            ১. ব্যানার ছবি (Banner Image URL বা ফাইল)
                                        </label>
                                        <div className="se-upload-box">
                                            <input
                                                type="text"
                                                value={slide.image || ''}
                                                placeholder="https://... ছবির URL paste করুন..."
                                                className="se-input"
                                                onChange={(e) => handleSliderChange(slide.id, 'image', e.target.value)}
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleSliderImageUpload(slide.id, e)}
                                            />
                                        </div>
                                    </div>

                                    <div className="se-form-group">
                                        <label>২. ক্লিক করলে কোথায় যাবে? (Target Click URL)</label>
                                        <input
                                            type="text"
                                            value={slide.url || ''}
                                            className="se-input"
                                            onChange={(e) => handleSliderChange(slide.id, 'url', e.target.value)}
                                            placeholder="/shop অথবা পেজের লিংক"
                                        />

                                        {/* Smart Helper if user pastes image link into Target Click URL */}
                                        {looksLikeImageUrl(slide.url) && !slide.image && (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '10px 12px',
                                                background: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                color: '#1e40af',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '8px'
                                            }}>
                                                <span>💡 এটি একটি ছবির লিংক! ব্যানার ইমেজ হিসেবে সেট করতে চান?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleSliderChange(slide.id, 'image', slide.url);
                                                        handleSliderChange(slide.id, 'url', '/shop');
                                                    }}
                                                    style={{
                                                        background: '#2563eb',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    ইমেজ হিসেবে সেট করুন →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="se-add-slide-btn" onClick={handleAddSlide}>
                            <FaPlus /> Add New Slide
                        </button>
                    </div>

                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaBullhorn style={{ color: 'var(--primary-color)' }} /> Hero Side Promo Banner</h3>
                            <p>Banner shown on the right side of the main slider (Recommended: 500×600px).</p>
                        </div>

                        <div className="se-grid-2">
                            <div>
                                {adData.image ? (
                                    <img src={adData.image} alt="Side Banner Preview" className="se-image-preview" style={{ height: '220px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ height: '220px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        No Image Uploaded
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="se-form-group">
                                    <label style={{ color: 'var(--primary-color)', fontWeight: '700' }}>১. প্রোমো ব্যানার ছবি (Image URL বা আপলোড)</label>
                                    <div className="se-upload-box">
                                        <input
                                            type="text"
                                            value={adData.image || ''}
                                            placeholder="Paste image URL..."
                                            className="se-input"
                                            onChange={(e) => setAdData(prev => ({ ...prev, image: e.target.value }))}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAdImageUpload}
                                        />
                                    </div>
                                </div>

                                <div className="se-form-group">
                                    <label>২. ক্লিক করলে কোথায় যাবে? (Target URL)</label>
                                    <input
                                        type="text"
                                        value={adData.url || ''}
                                        className="se-input"
                                        onChange={(e) => setAdData(prev => ({ ...prev, url: e.target.value }))}
                                        placeholder="/shop or https://..."
                                    />

                                    {looksLikeImageUrl(adData.url) && !adData.image && (
                                        <div style={{
                                            marginTop: '8px',
                                            padding: '10px 12px',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: '#1e40af',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '8px'
                                        }}>
                                            <span>💡 এটি একটি ছবির লিংক! প্রোমো ব্যানার হিসেবে সেট করবেন?</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAdData({ image: adData.url, url: '/shop' });
                                                }}
                                                style={{
                                                    background: '#2563eb',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                ইমেজ হিসেবে সেট করুন →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: PROMOTIONAL & EMERGENCY BANNERS */}
            {activeTab === 'banners' && (
                <div className="se-tab-content">
                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaBullhorn style={{ color: 'var(--primary-color)' }} /> Home Mid-Page Banners (Pair)</h3>
                            <p>Two side-by-side promotional banners above the Emergency Services section.</p>
                        </div>

                        <div className="se-grid-2">
                            {homeBanners.map((banner, index) => (
                                <div key={banner.id} className="se-banner-card">
                                    <div className="se-banner-header">
                                        <h4><FaImage /> Mid Banner #{index + 1}</h4>
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: '120px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        marginBottom: '14px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {banner.image ? (
                                            <img src={banner.image} alt={`Banner ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <FaImage size={22} />
                                                <span>কোনো ছবি নেই</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="se-form-group">
                                        <label style={{ color: 'var(--primary-color)', fontWeight: '700' }}>১. ব্যানার ছবি (Image URL বা ফাইল)</label>
                                        <div className="se-upload-box">
                                            <input
                                                type="text"
                                                value={banner.image || ''}
                                                placeholder="Paste image URL..."
                                                className="se-input"
                                                onChange={(e) => handleHomeBannerChange(banner.id, 'image', e.target.value)}
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleHomeBannerImageUpload(banner.id, e)}
                                            />
                                        </div>
                                    </div>

                                    <div className="se-form-group">
                                        <label>২. ক্লিক করলে কোথায় যাবে? (Target Click URL)</label>
                                        <input
                                            type="text"
                                            value={banner.url || ''}
                                            className="se-input"
                                            onChange={(e) => handleHomeBannerChange(banner.id, 'url', e.target.value)}
                                            placeholder="/shop or https://..."
                                        />

                                        {looksLikeImageUrl(banner.url) && !banner.image && (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '10px 12px',
                                                background: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                color: '#1e40af',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '8px'
                                            }}>
                                                <span>💡 এটি একটি ছবির লিংক! ব্যানার ইমেজ হিসেবে সেট করবেন?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleHomeBannerChange(banner.id, 'image', banner.url);
                                                        handleHomeBannerChange(banner.id, 'url', '/shop');
                                                    }}
                                                    style={{
                                                        background: '#2563eb',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    ইমেজ হিসেবে সেট করুন →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaAmbulance style={{ color: '#e7515a' }} /> Emergency Section Ad Banners</h3>
                            <p>Two banners placed right above the emergency services directory (1200×375px ratio).</p>
                        </div>

                        <div className="se-grid-2">
                            {emergencyBanners.map((banner, index) => (
                                <div key={banner.id} className="se-banner-card">
                                    <div className="se-banner-header">
                                        <h4><FaImage /> Emergency Banner #{index + 1}</h4>
                                        {banner.image && (
                                            <button
                                                className="se-btn-icon-danger"
                                                onClick={() => handleEmergencyBannerChange(banner.id, 'image', '')}
                                            >
                                                <FaTrash /> Remove
                                            </button>
                                        )}
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: '110px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        marginBottom: '14px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {banner.image ? (
                                            <img src={banner.image} alt={`Emergency Banner ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <FaImage size={22} />
                                                <span>কোনো ছবি নেই</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="se-form-group">
                                        <label style={{ color: 'var(--primary-color)', fontWeight: '700' }}>১. ব্যানার ছবি (Image URL বা ফাইল)</label>
                                        <div className="se-upload-box">
                                            <input
                                                type="text"
                                                value={banner.image || ''}
                                                placeholder="Paste image URL..."
                                                className="se-input"
                                                onChange={(e) => handleEmergencyBannerChange(banner.id, 'image', e.target.value)}
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleEmergencyBannerImageUpload(banner.id, e)}
                                            />
                                        </div>
                                    </div>

                                    <div className="se-form-group">
                                        <label>২. ক্লিক করলে কোথায় যাবে? (Target Click URL)</label>
                                        <input
                                            type="text"
                                            value={banner.url || ''}
                                            className="se-input"
                                            onChange={(e) => handleEmergencyBannerChange(banner.id, 'url', e.target.value)}
                                            placeholder="/shop or https://..."
                                        />

                                        {looksLikeImageUrl(banner.url) && !banner.image && (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '10px 12px',
                                                background: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                color: '#1e40af',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '8px'
                                            }}>
                                                <span>💡 এটি একটি ছবির লিংক! ব্যানার ইমেজ হিসেবে সেট করবেন?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleEmergencyBannerChange(banner.id, 'image', banner.url);
                                                        handleEmergencyBannerChange(banner.id, 'url', '/shop');
                                                    }}
                                                    style={{
                                                        background: '#2563eb',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    ইমেজ হিসেবে সেট করুন →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: HEADER & LOGO */}
            {activeTab === 'header' && (
                <div className="se-tab-content">
                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaHeading style={{ color: 'var(--primary-color)' }} /> Header Logo & Text</h3>
                            <p>Set your store logo image or fallback branded typography.</p>
                        </div>

                        <div className="se-grid-2">
                            <div className="se-form-group">
                                <label>Logo Text (Fallback)</label>
                                <input
                                    type="text"
                                    value={config.header?.logoText || ''}
                                    className="se-input"
                                    onChange={(e) => handleHeaderChange('logoText', e.target.value)}
                                    placeholder="e.g. EbayBD"
                                />
                            </div>

                            <div className="se-form-group">
                                <label>Logo Image Upload</label>
                                <div className="se-upload-box">
                                    <input
                                        type="text"
                                        value={config.header?.logoImage || ''}
                                        placeholder="Paste image URL..."
                                        className="se-input"
                                        onChange={(e) => handleHeaderChange('logoImage', e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    {config.header?.logoImage && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Preview:</span>
                                            <img src={config.header.logoImage} alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 24/7 Support Hotline Header Editor */}
                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaHeadset style={{ color: 'var(--primary-color)' }} /> 24/7 Support Hotline (হেডার সাপোর্ট ও হেল্পলাইন)</h3>
                            <p>Customize the 24/7 support title and hotline telephone number displayed on the homepage header.</p>
                        </div>

                        <div className="se-grid-2">
                            <div className="se-form-group">
                                <label>সাপোর্ট টাইটেল (Support Title / Label)</label>
                                <input
                                    type="text"
                                    value={config.header?.supportLabel || '24/7 SUPPORT'}
                                    className="se-input"
                                    onChange={(e) => handleHeaderChange('supportLabel', e.target.value)}
                                    placeholder="e.g. 24/7 SUPPORT অথবা হেল্পলাইন"
                                />
                            </div>

                            <div className="se-form-group">
                                <label>সাপোর্ট ফোন নম্বর (Support Phone Number)</label>
                                <input
                                    type="text"
                                    value={config.header?.supportPhone || '+880 1700-000000'}
                                    className="se-input"
                                    onChange={(e) => handleHeaderChange('supportPhone', e.target.value)}
                                    placeholder="e.g. +880 1700-000000"
                                />
                                <span className="se-help-text">কাস্টমাররা হেডারে এই নম্বরে ক্লিক করে সরাসরি কল করতে পারবে।</span>
                            </div>
                        </div>

                        {/* Live Preview Box */}
                        <div style={{ marginTop: '6px', padding: '12px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                            <FaHeadset size={22} style={{ color: 'var(--primary-color)' }} />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' }}>{config.header?.supportLabel || '24/7 SUPPORT'}</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{config.header?.supportPhone || '+880 1700-000000'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaLink style={{ color: 'var(--primary-color)' }} /> Top Bar Navigation Links</h3>
                            <p>Add and manage quick links displayed at the very top of the header.</p>
                        </div>

                        {(config.header?.topBarLinks || []).map((link) => (
                            <div key={link.id} className="se-link-item">
                                <input
                                    type="text"
                                    className="se-input"
                                    value={link.text}
                                    placeholder="Link Title (e.g. Save More on App)"
                                    onChange={(e) => updateHeaderLink(link.id, 'text', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="se-input"
                                    value={link.url}
                                    placeholder="URL (e.g. /seller)"
                                    onChange={(e) => updateHeaderLink(link.id, 'url', e.target.value)}
                                />
                                <button className="se-btn-icon-danger" onClick={() => removeHeaderLink(link.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        ))}

                        <button className="se-add-link-btn" onClick={addHeaderLink}>
                            <FaPlus /> Add Header Link
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 5: FOOTER & LINKS */}
            {activeTab === 'footer' && (
                <div className="se-tab-content">
                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaWindowMaximize style={{ color: 'var(--primary-color)' }} /> Footer Columns (Links)</h3>
                            <p>Customize the 3 main link columns in the footer.</p>
                        </div>

                        <div className="se-grid-3">
                            {['column1', 'column2', 'column3'].map((colKey, colIdx) => (
                                <div key={colKey} className="se-banner-card">
                                    <div className="se-form-group">
                                        <label>Column #{colIdx + 1} Heading</label>
                                        <input
                                            type="text"
                                            className="se-input"
                                            value={config.footer[colKey]?.title || ''}
                                            onChange={(e) => handleFooterColTitle(colKey, e.target.value)}
                                            placeholder="Column Title"
                                        />
                                    </div>

                                    <div style={{ marginTop: '12px' }}>
                                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Column Links</label>
                                        {(config.footer[colKey]?.links || []).map(link => (
                                            <div key={link.id} className="se-link-item" style={{ gridTemplateColumns: '1fr 1fr auto', padding: '6px' }}>
                                                <input
                                                    type="text"
                                                    className="se-input"
                                                    value={link.text}
                                                    placeholder="Text"
                                                    onChange={(e) => updateFooterLink(colKey, link.id, 'text', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="se-input"
                                                    value={link.url}
                                                    placeholder="URL"
                                                    onChange={(e) => updateFooterLink(colKey, link.id, 'url', e.target.value)}
                                                />
                                                <button className="se-btn-icon-danger" onClick={() => removeFooterLink(colKey, link.id)}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}

                                        <button className="se-add-link-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addFooterLink(colKey)}>
                                            <FaPlus /> Add Link
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaMapMarkerAlt style={{ color: 'var(--primary-color)' }} /> Contact & Business Info</h3>
                            <p>Displayed in the footer contact column.</p>
                        </div>

                        <div className="se-grid-2">
                            <div className="se-form-group">
                                <label><FaMapMarkerAlt /> Address</label>
                                <input
                                    type="text"
                                    className="se-input"
                                    value={config.footer.contact?.address || ''}
                                    placeholder="e.g. Dhaka, Bangladesh"
                                    onChange={(e) => handleFooterNestedChange('contact', 'address', e.target.value)}
                                />
                            </div>

                            <div className="se-form-group">
                                <label><FaEnvelope /> Support Email</label>
                                <input
                                    type="email"
                                    className="se-input"
                                    value={config.footer.contact?.email || ''}
                                    placeholder="support@ebaybd.com"
                                    onChange={(e) => handleFooterNestedChange('contact', 'email', e.target.value)}
                                />
                            </div>

                            <div className="se-form-group">
                                <label><FaPhoneAlt /> Helpline Number</label>
                                <input
                                    type="text"
                                    className="se-input"
                                    value={config.footer.contact?.phone || ''}
                                    placeholder="+880 1700-000000"
                                    onChange={(e) => handleFooterNestedChange('contact', 'phone', e.target.value)}
                                />
                            </div>

                            <div className="se-form-group">
                                <label><FaWhatsapp /> WhatsApp Support</label>
                                <input
                                    type="text"
                                    className="se-input"
                                    value={config.footer.contact?.whatsapp || ''}
                                    placeholder="+880 1700-000000"
                                    onChange={(e) => handleFooterNestedChange('contact', 'whatsapp', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="se-form-group" style={{ marginTop: '10px' }}>
                            <label>Brand Tagline & Description</label>
                            <textarea
                                className="se-textarea"
                                value={config.footer.description || ''}
                                placeholder="e.g. Bangladesh's premier online multi-vendor ecosystem..."
                                onChange={(e) => handleFooterChange('description', e.target.value)}
                            />
                        </div>

                        <div className="se-form-group">
                            <label>Copyright Text</label>
                            <input
                                type="text"
                                className="se-input"
                                value={config.footer.copyright || ''}
                                placeholder="© 2026 Ebaybd. All rights reserved."
                                onChange={(e) => handleFooterChange('copyright', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaFacebook style={{ color: '#1877f2' }} /> Social Media Handles</h3>
                            <p>Leave blank to hide any unused social channel icon.</p>
                        </div>

                        <div className="se-grid-2">
                            <div className="se-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaFacebook style={{ color: '#1877f2' }} /> Facebook Page URL
                                </label>
                                <input
                                    type="text"
                                    className="se-input"
                                    value={config.footer.socials?.facebook || ''}
                                    placeholder="https://facebook.com/yourpage"
                                    onChange={(e) => handleFooterNestedChange('socials', 'facebook', e.target.value)}
                                />
                            </div>

                            <div className="se-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaYoutube style={{ color: '#ff0000' }} /> YouTube Channel URL
                                </label>
                                <input
                                    type="text"
                                    className="se-input"
                                    value={config.footer.socials?.youtube || ''}
                                    placeholder="https://youtube.com/@yourchannel"
                                    onChange={(e) => handleFooterNestedChange('socials', 'youtube', e.target.value)}
                                />
                            </div>

                            <div className="se-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaInstagram style={{ color: '#e1306c' }} /> Instagram Profile URL
                                </label>
                                <input
                                    type="text"
                                    className="se-input"
                                    value={config.footer.socials?.instagram || ''}
                                    placeholder="https://instagram.com/yourprofile"
                                    onChange={(e) => handleFooterNestedChange('socials', 'instagram', e.target.value)}
                                />
                            </div>

                            <div className="se-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaTwitter style={{ color: '#1da1f2' }} /> Twitter / X Profile URL
                                </label>
                                <input
                                    type="text"
                                    className="se-input"
                                    value={config.footer.socials?.twitter || ''}
                                    placeholder="https://x.com/yourprofile"
                                    onChange={(e) => handleFooterNestedChange('socials', 'twitter', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaImage style={{ color: 'var(--primary-color)' }} /> Footer Background & Styling</h3>
                            <p>Set custom background image and footer contrast colors.</p>
                        </div>

                        <div className="se-grid-2">
                            <div className="se-form-group">
                                <label>Footer Background Image</label>
                                <div className="se-upload-box">
                                    <input
                                        type="text"
                                        value={config.footer.backgroundImage || ''}
                                        placeholder="Paste background image URL..."
                                        className="se-input"
                                        onChange={(e) => handleFooterChange('backgroundImage', e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFooterBgUpload}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="se-form-group">
                                    <label>Footer Text Color</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="color"
                                            value={config.footer.textColor || '#ffffff'}
                                            onChange={(e) => handleFooterChange('textColor', e.target.value)}
                                            style={{ width: '50px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            value={config.footer.textColor || '#ffffff'}
                                            className="se-input"
                                            onChange={(e) => handleFooterChange('textColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="se-form-group">
                                    <label>Footer Heading Accent Color</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="color"
                                            value={config.footer.headerColor || '#f2422b'}
                                            onChange={(e) => handleFooterChange('headerColor', e.target.value)}
                                            style={{ width: '50px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            value={config.footer.headerColor || '#f2422b'}
                                            className="se-input"
                                            onChange={(e) => handleFooterChange('headerColor', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: AI CHATBOT SETTINGS */}
            {activeTab === 'ai' && (
                <div className="se-tab-content">
                    <div className="se-card">
                        <div className="se-card-header">
                            <h3><FaRobot style={{ color: '#4361ee' }} /> Google Gemini AI Shopping Assistant</h3>
                            <p>Configure custom prompt instructions and your Gemini API key for smart automated replies.</p>
                        </div>

                        <div className="se-form-group">
                            <label>Custom AI Instructions (System Prompt)</label>
                            <textarea
                                className="se-textarea"
                                style={{ minHeight: '140px' }}
                                value={config.aiPrompt || ''}
                                placeholder="e.g. Always greet customers respectfully in Bengali. Prioritize flash sale items and mention free delivery on orders over 2000 BDT."
                                onChange={(e) => handleBrandingChange('aiPrompt', e.target.value)}
                            />
                            <span className="se-help-text">These instructions guide the AI on how to interact with your store's visitors.</span>
                        </div>

                        <div className="se-form-group">
                            <label>Google Gemini API Key</label>
                            <input
                                type="password"
                                className="se-input"
                                value={config.aiApiKey || ''}
                                placeholder="AIzaSy..."
                                onChange={(e) => handleBrandingChange('aiApiKey', e.target.value)}
                            />
                            <span className="se-help-text">Leave blank to use the default API key configured in <code>.env</code>.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Toast Notification */}
            {toastMessage && (
                <div className={`se-toast ${toastMessage.type}`}>
                    <FaCheckCircle />
                    <span>{toastMessage.text}</span>
                </div>
            )}
        </div>
    );
};

export default SiteEditor;
