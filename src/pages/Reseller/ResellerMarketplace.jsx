import React, { useState, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaSearch, FaPlus, FaCheckCircle } from 'react-icons/fa';
import './Reseller.css';

const ResellerMarketplace = () => {
    const {
        user, allProducts, addResellerProduct
    } = useContext(ShopContext);

    const [searchQuery, setSearchQuery] = useState('');

    if (!user || user.role !== 'reseller') {
        return <div className="unauthorized">Unauthorized Access</div>;
    }

    // Filtered by search and exclude items already owned/managed by this reseller
    const selectableProducts = (allProducts || []).filter(p =>
        p.sellerId !== user.id && // Don't show their own products in the marketplace
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = async (product) => {
        // Check if already added in allProducts with current user as seller
        if (allProducts.some(p => p.image === product.image && p.sellerId === user.id)) {
            alert('Product already in your list!');
            return;
        }
        const res = await addResellerProduct({
            originalProductId: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: product.image,
            description: product.description || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            childCategory: product.childCategory || '',
            resellerId: user.id,
            stock: product.stock || 0
        });
        if (res) {
            alert('Product added to your shop! You can now edit it in Product Manager.');
        }
    };

    return (
        <div className="admin-container-inner" style={{ padding: '25px' }}>
            <div className="admin-page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#3b3f5c' }}>Product Marketplace</h1>
                    <p style={{ color: '#888ea8', fontSize: '14px' }}>Browse and add products from other sellers to your landing page.</p>
                </div>
                <div className="search-box-reseller">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            <div className="selection-grid">
                {selectableProducts.map(product => {
                    const isAdded = allProducts.some(p => p.image === product.image && p.sellerId === user.id);
                    return (
                        <div key={product.id} className={`product-item ${isAdded ? 'selected' : ''}`}>
                            <div className="p-img-wrapper">
                                <img src={product.image} alt={product.title} />
                                <div className="p-badge">৳{product.price}</div>
                            </div>
                            <div className="info">
                                <h4>{product.title}</h4>
                                {isAdded ? (
                                    <button className="add-btn disabled"><FaCheckCircle /> Already Added</button>
                                ) : (
                                    <button className="add-btn" onClick={() => handleAddProduct(product)}><FaPlus /> Add to Shop</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResellerMarketplace;
