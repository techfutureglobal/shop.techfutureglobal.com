import React, { useState, useContext, useRef } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { compressImage } from '../../utils/imageHandler';
import { FaEdit, FaTrash, FaPlus, FaImage, FaBoxOpen, FaSave, FaTimes, FaSearch, FaCheck } from 'react-icons/fa';

const ProductManagerStyles = () => (
    <style>{`
        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
                align-items: flex-start !important;
                gap: 15px;
            }
            .page-header .btn {
                width: 100%;
            }
            .flex-responsive {
                flex-direction: column;
                align-items: stretch !important;
                gap: 15px;
            }
            .flex-responsive input {
                width: 100% !important;
            }
            .grid-responsive-3 {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }
            
            /* Modern Card View for Variants on Mobile */
            .mobile-variant-card {
                display: block;
                background: #fff;
                border: 1px solid #e0e6ed;
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 15px;
                position: relative;
            }
            .mobile-variant-card .variant-row {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 10px;
            }
            .mobile-variant-card label {
                font-size: 11px;
                font-weight: 700;
                color: #888ea8;
                text-transform: uppercase;
                margin-bottom: 2px;
            }
            .mobile-variant-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #f1f2f3;
            }

            /* Gallery spacing for mobile */
            .media-upload-row {
                flex-direction: column !important;
            }
            .media-upload-row .main-img-preview {
                width: 100% !important;
                height: 200px !important;
            }
        }
        
        /* Hide mobile-only elements on desktop */
        @media (min-width: 769px) {
            .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
            .desktop-only { display: none !important; }
        }
    `}</style>
);

const ProductManager = () => {
    const {
        user, allProducts,
        categories, saveProduct, deleteProduct, deleteResellerProduct
    } = useContext(ShopContext);

    const [activeTab, setActiveTab] = useState(user?.role === 'reseller' ? 'all' : 'flash');
    const [view, setView] = useState('list');
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        price: '',
        originalPrice: '',
        discount: '',
        image: '',
        imageType: 'url',
        stock: '',
        category: '',
        subcategory: '',
        childCategory: '',
        description: '',
        showInFlash: false,
        showInJFY: false,
        showInArrival: false,
        images: [], // Additional images
        has_variants: false,
        variants: [],
        variant_config: { attributes: [] }
    });

    const fileInputRef = useRef(null);

    const getProductsByTab = () => {
        let base = (allProducts || []);

        // Filter based on role
        if (user?.role !== 'admin') {
            base = base.filter(p => p.sellerId === user?.id);
        }

        // Tab-based filtering (only if not 'all')
        if (activeTab === 'flash') return base.filter(p => p.is_flash_sale);
        if (activeTab === 'jfy') return base.filter(p => p.is_just_for_you);
        if (activeTab === 'arrival') return base.filter(p => p.is_new_arrival);

        return base;
    };

    const products = getProductsByTab();
    const filteredProducts = products.filter(p =>
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (product) => {
        setFormData({
            id: product.id || '',
            title: product.title || '',
            price: product.price || '',
            originalPrice: product.original_price || '',   // DB uses snake_case
            discount: product.discount || '',
            image: product.image || '',
            imageType: 'url',
            stock: product.stock || 0,
            category: product.category || '',
            subcategory: product.subcategory || '',
            childCategory: product.childCategory || '',
            description: product.description || '',
            showInArrival: product.is_new_arrival || false,
            images: Array.isArray(product.images) ? product.images : [],
            has_variants: product.has_variants || false,
            variants: Array.isArray(product.variants) ? product.variants : [],
            variant_config: product.variant_config || { attributes: [] }
        });
        setEditMode(true);
        setView('form');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            if (user?.role === 'reseller') {
                deleteResellerProduct(id);
            } else {
                deleteProduct(id);
            }
        }
    };

    const handleAddNew = () => {
        if (user?.role === 'reseller') {
            alert('Resellers cannot create new products. Please add products from the marketplace.');
            return;
        }
        setFormData({
            id: '',
            title: '',
            price: '',
            originalPrice: '',
            discount: '',
            image: '',
            imageType: 'url',
            stock: '',
            category: '',
            subcategory: '',
            childCategory: '',
            description: '',
            showInFlash: activeTab === 'flash',
            showInJFY: activeTab === 'jfy',
            showInArrival: activeTab === 'arrival',
            images: [],
            has_variants: false,
            variants: [],
            variant_config: { attributes: [] }
        });
        setEditMode(false);
        setView('form');
    };

    const addVariant = () => {
        const newVariant = {
            id: 'v-' + Date.now(),
            name: '',
            type: formData.variant_config?.attributes?.[0] || 'Option',
            price: '',
            stock: '',
            image: ''
        };
        setFormData({ ...formData, variants: [...formData.variants, newVariant] });
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, variants: newVariants });
    };

    const removeVariant = (index) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };

    const handleImageFileChange = async (e, isGallery = false) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setSaving(true); // Temporarily show loading while compressing
        try {
            for (const file of files) {
                const compressed = await compressImage(file, 1000, 0.7);
                if (!isGallery) {
                    setFormData(prev => ({ ...prev, image: compressed }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), compressed]
                    }));
                }
            }
        } catch (err) {
            console.error('Image compression error:', err);
            alert('Failed to process image. Try a smaller one.');
        } finally {
            setSaving(false);
        }
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => {
            const newImages = [...(prev.images || [])];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    const setMainImage = (img) => {
        setFormData(prev => ({ ...prev, image: img }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.title || !formData.price || !formData.image) {
            alert('Please fill in all required fields');
            return;
        }

        if (user?.role !== 'reseller' && !formData.showInFlash && !formData.showInJFY && !formData.showInArrival) {
            alert('Please select at least one section to show this product in');
            return;
        }

        // payload is now handled below

        if (user?.role === 'reseller') {
            updateResellerProduct(formData.id, { ...formData, stock: parseInt(formData.stock) || 0 });
            setView('list');
            return;
        }

        // Build product payload for Firebase
        const productPayload = {
            ...formData,
            stock: parseInt(formData.stock) || 0,
            // Every product should be associated with the uploader's store
            sellerId: user?.id,
            images: formData.images || []
        };

        if (editMode && formData.id) {
            productPayload.id = formData.id;
        }

        setSaving(true);
        const result = await saveProduct(productPayload);
        setSaving(false);

        if (result) {
            setView('list');
        } else {
            alert('Failed to save product. Check the browser console for details.');
        }
    };

    return (
        <div className="fade-in">
            <ProductManagerStyles />
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Product Manager</h1>
                    <div style={{ fontSize: '14px', color: '#888ea8' }}>Manage your store's inventory and listings</div>
                </div>
                {view === 'list' && (
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <FaPlus style={{ marginRight: '8px' }} /> Add New Product
                    </button>
                )}
            </div>

            {view === 'list' && (
                <>
                    <div className="admin-card flex-responsive" style={{ marginBottom: '20px', padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={`btn ${activeTab === 'flash' ? 'btn-primary' : ''}`}
                                style={{ background: activeTab !== 'flash' ? 'transparent' : '', color: activeTab !== 'flash' ? '#888ea8' : '' }}
                                onClick={() => setActiveTab('flash')}
                            >
                                Offer Products
                            </button>
                            <button
                                className={`btn ${activeTab === 'jfy' ? 'btn-primary' : ''}`}
                                style={{ background: activeTab !== 'jfy' ? 'transparent' : '', color: activeTab !== 'jfy' ? '#888ea8' : '' }}
                                onClick={() => setActiveTab('jfy')}
                            >
                                Organic & Tailored Collections
                            </button>
                            <button
                                className={`btn ${activeTab === 'arrival' ? 'btn-primary' : ''}`}
                                style={{ background: activeTab !== 'arrival' ? 'transparent' : '', color: activeTab !== 'arrival' ? '#888ea8' : '' }}
                                onClick={() => setActiveTab('arrival')}
                            >
                                Arrival Products
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '35px', width: '250px' }}
                            />
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888ea8' }} />
                        </div>
                    </div>

                    <div className="table-wrapper table-wrapper-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price Info</th>
                                    <th>Stock Status</th>
                                    <th>Discount</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover-row">
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e6ed' }}>
                                                    <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#3b3f5c' }}>{product.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#888ea8' }}>ID: #{product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#4634ff' }}>৳{product.price}</div>
                                            {product.originalPrice && (
                                                <div style={{ fontSize: '12px', textDecoration: 'line-through', color: '#888ea8' }}>
                                                    ৳{product.originalPrice}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {(product.stock || 0) > 0 ? (
                                                <span className="status-badge success">{product.stock} in stock</span>
                                            ) : (
                                                <span className="status-badge error">Out of stock</span>
                                            )}
                                        </td>
                                        <td>
                                            {product.discount ? (
                                                <span className="status-badge warning">{product.discount}</span>
                                            ) : (
                                                <span style={{ color: '#888ea8' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                <button className="btn-icon" onClick={() => handleEdit(product)} title="Edit">
                                                    <FaEdit />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888ea8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                <FaBoxOpen style={{ fontSize: '40px', opacity: 0.5 }} />
                                                No products found.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {view === 'form' && (
                <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #e0e6ed' }}>
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#3b3f5c' }}>{editMode ? 'Edit Product' : 'Add New Product'}</h2>
                        <button type="button" className="btn-icon" onClick={() => setView('list')}><FaTimes /></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Product Title <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter product name..."
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Description</label>
                            <textarea
                                className="form-control"
                                placeholder="Enter product description..."
                                rows="4"
                                style={{ fontFamily: 'inherit' }}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="grid-responsive-3" style={{ marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Category</label>
                                <select
                                    className="form-control"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '', childCategory: '' })}
                                    style={{ width: '100%', padding: '12px', background: 'white' }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Subcategory</label>
                                <select
                                    className="form-control"
                                    value={formData.subcategory}
                                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value, childCategory: '' })}
                                    style={{ width: '100%', padding: '12px', background: 'white' }}
                                    disabled={!formData.category}
                                >
                                    <option value="">Select Subcategory</option>
                                    {categories.find(c => c.name === formData.category)?.subcategories?.map((sub, idx) => (
                                        <option key={idx} value={sub.title}>{sub.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Child Category</label>
                                <select
                                    className="form-control"
                                    value={formData.childCategory}
                                    onChange={(e) => setFormData({ ...formData, childCategory: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'white' }}
                                    disabled={!formData.subcategory}
                                >
                                    <option value="">Select Child Category</option>
                                    {categories.find(c => c.name === formData.category)?.subcategories?.find(s => s.title === formData.subcategory)?.items?.map((item, idx) => (
                                        <option key={idx} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-responsive-3" style={{ marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Sale Price (৳) <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Original Price (৳)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Stock Quantity</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b3f5c' }}>Discount Label</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                placeholder="e.g. -40%"
                            />
                        </div>

                        {user?.role !== 'reseller' && (
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#3b3f5c' }}>Show Product in Sections</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '15px', background: '#f8f9fb', borderRadius: '8px', border: '1px solid #e0e6ed' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#3b3f5c' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.showInFlash}
                                            onChange={(e) => setFormData({ ...formData, showInFlash: e.target.checked })}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Offer Products Section
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#3b3f5c' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.showInJFY}
                                            onChange={(e) => setFormData({ ...formData, showInJFY: e.target.checked })}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Organic & Tailored Collections Section
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#3b3f5c' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.showInArrival}
                                            onChange={(e) => setFormData({ ...formData, showInArrival: e.target.checked })}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Arrival Products Section
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Improved Media Section */}
                        <div className="form-group" style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: '600', color: '#3b3f5c', fontSize: '16px' }}>
                                Product Gallery & Media
                            </label>

                            <div style={{ background: '#f8f9fb', padding: '20px', borderRadius: '12px', border: '1px solid #e0e6ed' }}>
                                {/* Main Image Selection */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Main Product Image (Cover)</label>
                                    <div className="media-upload-row" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                        <div className="main-img-preview" style={{ width: '120px', height: '120px', borderRadius: '8px', border: '2px solid #4634ff', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                                            {formData.image ? (
                                                <img src={formData.image} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888ea8', fontSize: '12px', textAlign: 'center', padding: '10px' }}>No Image Selected</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Paste Main Image URL..."
                                                value={formData.imageType === 'url' ? formData.image : ''}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value, imageType: 'url' })}
                                                style={{ marginBottom: '10px' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setFormData({ ...formData, imageType: 'file' });
                                                    document.getElementById('main-image-upload-input').click();
                                                }}
                                                style={{ fontSize: '13px' }}
                                            >
                                                <FaImage style={{ marginRight: '8px' }} /> Upload from Device
                                            </button>
                                            <input
                                                type="file"
                                                id="main-image-upload-input"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleImageFileChange(e, false)}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery Images */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Gallery Images ({formData.images?.length || 0})</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                                        {(formData.images || []).map((img, idx) => (
                                            <div key={idx} className="gallery-item" style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e6ed', background: '#fff' }}>
                                                <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div className="gallery-item-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', opacity: 0, transition: 'opacity 0.2s', padding: '5px' }}>
                                                    <button type="button" onClick={() => setMainImage(img)} style={{ fontSize: '10px', padding: '4px', background: '#4634ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Set Main</button>
                                                    <button type="button" onClick={() => removeGalleryImage(idx)} style={{ fontSize: '10px', padding: '4px', background: '#e7515a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                                </div>
                                                <style>{`.gallery-item:hover .gallery-item-overlay { opacity: 1; }`}</style>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('gallery-upload-input').click()}
                                            style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', border: '2px dashed #888ea8', background: 'transparent', color: '#888ea8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                        >
                                            <FaPlus />
                                            <span style={{ fontSize: '11px' }}>Add</span>
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        id="gallery-upload-input"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageFileChange(e, true)}
                                        accept="image/*"
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Or add Image URL..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (e.target.value) {
                                                        setFormData({ ...formData, images: [...formData.images, e.target.value] });
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                            style={{ fontSize: '13px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Variants Section */}
                        <div className="form-group" style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '10px 15px', background: '#f8f9fb', borderRadius: '8px' }}>
                                <label style={{ fontWeight: '600', color: '#3b3f5c', margin: 0 }}>Product Variants (Variable Product)</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.has_variants}
                                        onChange={(e) => setFormData({ ...formData, has_variants: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Enable Variants
                                </label>
                            </div>

                            {formData.has_variants && (
                                <div className="variants-container" style={{ padding: '20px', border: '1px solid #e0e6ed', borderRadius: '8px', background: '#fff' }}>
                                    <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Variant Type / Attribute Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Size, Weight, Color"
                                            value={formData.variant_config?.attributes?.[0] || ''}
                                            onChange={(e) => {
                                                const attr = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    variant_config: { ...formData.variant_config, attributes: [attr] },
                                                    // Also update type in all existing variants for consistency
                                                    variants: formData.variants.map(v => ({ ...v, type: attr }))
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className="table-responsive desktop-only">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Option Name</th>
                                                    <th>Price Override (৳)</th>
                                                    <th>Stock</th>
                                                    <th>Specific Image URL</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.variants.map((v, idx) => (
                                                    <tr key={v.id}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="e.g. XL, 1kg"
                                                                value={v.name}
                                                                onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                placeholder="Base price used if empty"
                                                                value={v.price}
                                                                onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={v.stock}
                                                                onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="variant-image-picker" style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '5px', background: '#f8f9fb', borderRadius: '4px', maxWidth: '250px' }}>
                                                                <div
                                                                    onClick={() => updateVariant(idx, 'image', '')}
                                                                    style={{ width: '40px', height: '40px', borderRadius: '4px', border: !v.image ? '2px solid #4634ff' : '1px solid #ddd', background: '#fff', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center' }}
                                                                >
                                                                    None
                                                                </div>
                                                                {[formData.image, ...formData.images].filter(Boolean).map((img, i) => (
                                                                    <div
                                                                        key={i}
                                                                        onClick={() => updateVariant(idx, 'image', img)}
                                                                        style={{ width: '40px', height: '40px', borderRadius: '4px', border: v.image === img ? '2px solid #4634ff' : '1px solid #ddd', background: '#fff', flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
                                                                    >
                                                                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Or paste custom URL"
                                                                value={v.image}
                                                                onChange={(e) => updateVariant(idx, 'image', e.target.value)}
                                                                style={{ marginTop: '5px', fontSize: '11px' }}
                                                            />
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button type="button" className="btn-icon delete" onClick={() => removeVariant(idx)}>
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {formData.variants.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>No options added yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards for Variants */}
                                    <div className="mobile-only">
                                        {formData.variants.map((v, idx) => (
                                            <div key={v.id} className="mobile-variant-card">
                                                <div className="mobile-variant-header">
                                                    <span style={{ fontWeight: '700', color: '#4634ff' }}>Option #{idx + 1}</span>
                                                    <button type="button" className="btn-icon delete" onClick={() => removeVariant(idx)}>
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>

                                                <div className="variant-row">
                                                    <div>
                                                        <label>Option Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="XL, Blue, etc."
                                                            value={v.name}
                                                            onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                        <div>
                                                            <label>Price Override</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={v.price}
                                                                onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label>Stock</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={v.stock}
                                                                onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label>Variant Image</label>
                                                        <div className="variant-image-picker" style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '8px', background: '#f8f9fb', borderRadius: '8px' }}>
                                                            <div
                                                                onClick={() => updateVariant(idx, 'image', '')}
                                                                style={{ width: '45px', height: '45px', borderRadius: '6px', border: !v.image ? '2px solid #4634ff' : '1px solid #ddd', background: '#fff', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                                                            >
                                                                None
                                                            </div>
                                                            {[formData.image, ...formData.images].filter(Boolean).map((img, i) => (
                                                                <div
                                                                    key={i}
                                                                    onClick={() => updateVariant(idx, 'image', img)}
                                                                    style={{ width: '45px', height: '45px', borderRadius: '6px', border: v.image === img ? '2px solid #4634ff' : '1px solid #ddd', background: '#fff', flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
                                                                >
                                                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.variants.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '20px', color: '#888', border: '1px dashed #ddd', borderRadius: '8px' }}>
                                                No variants added.
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={addVariant}
                                        style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <FaPlus /> Add Option
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '15px', paddingTop: '20px', borderTop: '1px solid #e0e6ed' }}>
                            <button type="button" className="btn" style={{ background: '#f1f5f9', color: '#3b3f5c' }} onClick={() => setView('list')} disabled={saving}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={saving}>
                                <FaSave /> {saving ? 'Saving...' : (editMode ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProductManager;
