import React, { useState, useContext, useMemo } from 'react';
import { ShopContext } from '../../context/ShopContext';
import {
    FaUserTag, FaLink, FaShareAlt, FaPlus, FaCheckCircle,
    FaStore, FaWallet, FaClipboardList, FaSignOutAlt, FaEye, FaRegClone,
    FaSearch, FaEdit, FaTrashAlt, FaSave, FaTimes, FaGlobe, FaChartLine, FaBoxOpen, FaShoppingCart
} from 'react-icons/fa';
import './Reseller.css';
import '../Seller/Seller.css';
import { compressImage } from '../../utils/imageHandler';

const ResellerLanding = () => {
    const {
        user, allProducts,
        addResellerProduct, updateResellerProduct, deleteResellerProduct,
        resellerStores, updateResellerStore,
        logout, wallets, getWallet, orders, withdrawMoney
    } = useContext(ShopContext);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [newPrice, setNewPrice] = useState('');

    // Modal states
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState('bkash');

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

    if (!user || user.role !== 'reseller') {
        return <div className="unauthorized">Unauthorized Access</div>;
    }

    // Resellers "own" products in the products table where seller_id = user.id
    const myManagedProducts = (allProducts || []).filter(p => p.sellerId === user?.id);

    // Current wallet for the reseller
    const myWallet = getWallet(user?.id);

    const resellerOrders = orders.filter(o => o.resellerId === user.id);

    const handleAddProduct = (product) => {
        if (allProducts.some(p => (p.images?.[0] === product.id || p.originalProductId === product.id) && p.sellerId === user.id)) {
            alert('Product already in your list!');
            return;
        }
        addResellerProduct({
            originalProductId: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: product.image,
            description: product.description || '',
            category: product.category || '',
            stock: product.stock || 0
        });
        alert('Product added successfully!');
    };

    const savePrice = (id) => {
        const rp = resellerProducts.find(p => p.id === id);
        updateResellerProduct(id, { ...rp, price: newPrice });
        setEditingProduct(null);
    };

    const handleWithdraw = (e) => {
        e.preventDefault();
        const res = withdrawMoney(Number(withdrawAmount), withdrawMethod);
        if (res.success) {
            alert(`Withdrawal request submitted!`);
            setShowWithdrawModal(false);
            setWithdrawAmount('');
        }
    };

    const saveStoreDetails = () => {
        updateResellerStore(user.id, storeForm);
        alert('Design changes saved!');
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
        <div className="reseller-container">
            {/* Sidebar */}
            <aside className="reseller-sidebar">
                <div className="sidebar-header">
                    <FaGlobe size={24} color="#f85606" />
                    <h2>Reseller Center</h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <FaChartLine /> Dashboard
                    </button>
                    <button className={activeTab === 'setup' ? 'active' : ''} onClick={() => setActiveTab('setup')}>
                        <FaSearch /> Browse Products
                    </button>
                    <button className={activeTab === 'manager' ? 'active' : ''} onClick={() => setActiveTab('manager')}>
                        <FaBoxOpen /> Product Manager
                    </button>
                    <button className={activeTab === 'editor' ? 'active' : ''} onClick={() => setActiveTab('editor')}>
                        <FaEdit /> Page Designer
                    </button>
                    <button className={activeTab === 'preview' ? 'active' : ''} onClick={() => setActiveTab('preview')}>
                        <FaEye /> View Live Shop
                    </button>
                    <div className="nav-divider"></div>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <FaShoppingCart /> My Sales
                    </button>
                    <button className={activeTab === 'wallet' ? 'active' : ''} onClick={() => setActiveTab('wallet')}>
                        <FaWallet /> My Wallet
                    </button>
                    <button className="logout-btn" onClick={() => { logout(); window.location.href = '/'; }}>
                        <FaSignOutAlt /> Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="reseller-main">

                {/* 1. DASHBOARD OVERVIEW */}
                {activeTab === 'dashboard' && (
                    <section className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <h1>Welcome, {user.name}!</h1>
                                <p>Here is what's happening with your referral business today.</p>
                            </div>
                        </div>

                        <div className="top-stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon"><FaShoppingCart /></div>
                                <div className="stat-data">
                                    <h3>Total Sales</h3>
                                    <div className="num">{resellerOrders.length}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><FaBoxOpen /></div>
                                <div className="stat-data">
                                    <h3>My Products</h3>
                                    <div className="num">{myManagedProducts.length}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><FaWallet /></div>
                                <div className="stat-data">
                                    <h3>Available Balance</h3>
                                    <div className="num">৳{myWallet.balance.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-card" style={{ marginTop: '30px' }}>
                            <h3>Quick Actions</h3>
                            <div className="quick-actions-grid">
                                <button onClick={() => setActiveTab('setup')}><FaPlus /> Browse Products</button>
                                <button onClick={() => setActiveTab('editor')}><FaEdit /> Redesign Page</button>
                                <button onClick={() => window.open(`/shop/${storeForm.slug}`, '_blank')}><FaGlobe /> View Store</button>
                                <button onClick={() => setShowWithdrawModal(true)}><FaWallet /> Withdraw Cash</button>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. BROWSE PRODUCTS */}
                {activeTab === 'setup' && (
                    <section className="setup-section">
                        <div className="section-header">
                            <div>
                                <h1>Browse Seller Marketplace</h1>
                                <p>Find high-demand products and add them to your personalized landing page.</p>
                            </div>
                            <div className="search-box-reseller">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search marketplace..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="selection-grid">
                            {(allProducts || []).filter(p => p.sellerId !== user.id && p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(product => {
                                const isAdded = (allProducts || []).some(p => (p.images?.[0] === product.id || p.originalProductId === product.id) && p.sellerId === user.id);
                                return (
                                    <div key={product.id} className={`product-item ${isAdded ? 'selected' : ''}`}>
                                        <div className="p-img-wrapper">
                                            <img src={product.image} alt={product.title} />
                                            <div className="p-badge">৳{product.price}</div>
                                        </div>
                                        <div className="info">
                                            <h4>{product.title}</h4>
                                            {isAdded ? (
                                                <button className="add-btn disabled"><FaCheckCircle /> Added to Shop</button>
                                            ) : (
                                                <button className="add-btn" onClick={() => handleAddProduct(product)}><FaPlus /> Add to Shop</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 3. PRODUCT MANAGER */}
                {activeTab === 'manager' && (
                    <section className="manager-section">
                        <h1>Product Manager</h1>
                        <p>Set your custom pricing and manage your inventory profit margins.</p>

                        <div className="admin-card" style={{ marginTop: '20px' }}>
                            <table className="reseller-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Base Price</th>
                                        <th>My Price</th>
                                        <th>My Profit</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myManagedProducts.map(rp => (
                                        <tr key={rp.id}>
                                            <td className="flex gap-10">
                                                <img src={rp.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                                                <span className="p-title-text">{rp.title}</span>
                                            </td>
                                            <td>৳ {rp.originalPrice || rp.price}</td>
                                            <td>
                                                {editingProduct === rp.id ? (
                                                    <input
                                                        type="number"
                                                        value={newPrice}
                                                        onChange={(e) => setNewPrice(e.target.value)}
                                                        className="edit-price-input"
                                                    />
                                                ) : (
                                                    <span className="selling-price">৳ {rp.price}</span>
                                                )}
                                            </td>
                                            <td>
                                                {rp.price - (rp.originalPrice || rp.price) > 0 ? (
                                                    <span className="profit-text positive">+৳ {rp.price - (rp.originalPrice || rp.price)}</span>
                                                ) : (
                                                    <span className="profit-text neutral">No extra profit</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    {editingProduct === rp.id ? (
                                                        <button className="icon-btn save" onClick={() => savePrice(rp.id)}><FaSave /></button>
                                                    ) : (
                                                        <button className="icon-btn edit" onClick={() => { setEditingProduct(rp.id); setNewPrice(rp.price); }}><FaEdit /></button>
                                                    )}
                                                    <button className="icon-btn delete" onClick={() => deleteResellerProduct(rp.id)}><FaTrashAlt /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {myManagedProducts.length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Your shop is currently empty. Visit "Browse Products" to add your first product.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* 4. PAGE DESIGNER */}
                {activeTab === 'editor' && (
                    <section className="editor-section">
                        <h1>Storefront Designer</h1>
                        <p>Customize your shop's appearance to attract more customers.</p>

                        <div className="split-view">
                            <div className="editor-form">
                                <div className="admin-card">
                                    <div className="form-group">
                                        <label>Store Name</label>
                                        <input type="text" className="form-control" value={storeForm.title} onChange={(e) => setStoreForm({ ...storeForm, title: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Store URL Slug</label>
                                        <div className="slug-input"><span>/shop/</span><input type="text" value={storeForm.slug} onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })} /></div>
                                    </div>
                                    <div className="form-group">
                                        <label>About My Store</label>
                                        <textarea className="form-control" rows="3" value={storeForm.description} onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Store Logo</label>
                                        <div className="upload-box" onClick={() => document.getElementById('logo-up').click()}>
                                            {storeForm.logo ? <img src={storeForm.logo} alt="" /> : <span>Click to upload</span>}
                                            <input type="file" id="logo-up" hidden onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Featured Banner</label>
                                        <div className="upload-box banner-box" onClick={() => document.getElementById('banner-up').click()}>
                                            {storeForm.banner ? <img src={storeForm.banner} alt="" /> : <span>Set Banner Image</span>}
                                            <input type="file" id="banner-up" hidden onChange={(e) => handleFileUpload(e, 'banner')} accept="image/*" />
                                        </div>
                                    </div>
                                    <button className="btn-save-store" onClick={saveStoreDetails}><FaSave /> Save Design Changes</button>
                                </div>
                            </div>

                            <div className="editor-preview">
                                <h3>Quick Visual Preview</h3>
                                <div className="preview-mockup">
                                    <div className="mock-header">
                                        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                                        <div className="mock-url-bar">Ebaybd.com/shop/{storeForm.slug}</div>
                                    </div>
                                    <div className="mock-content">
                                        <div className="mock-banner" style={{ backgroundImage: `url(${storeForm.banner})` }}>
                                            <div className="mock-logo"><img src={storeForm.logo} alt="" /></div>
                                        </div>
                                        <div className="mock-text">
                                            <h4>{storeForm.title}</h4>
                                            <p>{storeForm.description}</p>
                                        </div>
                                        <div className="mock-grid">
                                            {[1, 2, 3].map(i => <div key={i} className="mock-p"></div>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. LIVE PREVIEW */}
                {activeTab === 'preview' && (
                    <section className="preview-full">
                        <div className="preview-header-bar">
                            <h1>Storefront Live Preview</h1>
                            <div className="btn-group">
                                <button className="btn-link" onClick={() => window.open(`/shop/${storeForm.slug}`, '_blank')}><FaGlobe /> View Public Site</button>
                            </div>
                        </div>
                        <div className="iframe-container">
                            <iframe src={`/shop/${storeForm.slug}`} title="Preview" />
                        </div>
                    </section>
                )}

                {/* 6. SALES */}
                {activeTab === 'orders' && (
                    <section className="orders-section">
                        <h1>Sales History</h1>
                        <p>Track your commissions and order performance.</p>
                        <div className="admin-card" style={{ marginTop: '20px' }}>
                            <table className="seller-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Commission</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resellerOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.date}</td>
                                            <td>৳ {order.amount}</td>
                                            <td className="commission-text">৳ {(order.amount * 0.1).toFixed(0)}</td>
                                            <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                                        </tr>
                                    ))}
                                    {resellerOrders.length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No sales recorded yet. Start promoting your shop to earn commissions!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* 7. WALLET */}
                {activeTab === 'wallet' && (
                    <section className="wallet-section">
                        <h1>Financial Wallet</h1>
                        <div className="wallet-overview" style={{ marginTop: '20px' }}>
                            <div className="wallet-card">
                                <h3>Available Balance</h3>
                                <div className="balance">৳ {myWallet.balance.toLocaleString()}</div>
                                <button className="withdraw-btn" onClick={() => setShowWithdrawModal(true)}>Withdraw Cash</button>
                            </div>
                            <div className="wallet-card pending">
                                <h3>Commission Earned</h3>
                                <div className="balance">৳ {resellerOrders.reduce((acc, o) => acc + (o.totalAmount || 0) * 0.1, 0).toLocaleString()}</div>
                                <p>10% flat commission on and delivered orders</p>
                            </div>
                        </div>
                        <div className="admin-card" style={{ marginTop: '30px' }}>
                            <h3>Recent Activity</h3>
                            {Array.isArray(myWallet.transactions) && myWallet.transactions.length > 0 ? (
                                myWallet.transactions.map((txn, idx) => (
                                    <div key={idx} className="transaction-item">
                                        <div className="txn-info">
                                            <h4>{txn.description}</h4>
                                            <p>{txn.date} • {txn.status || 'Success'}</p>
                                        </div>
                                        <div className={`txn-amount ${txn.type === 'Credit' ? 'credit' : 'debit'}`}>
                                            {txn.type === 'Credit' ? '+' : '-'} ৳ {txn.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No transaction history found.</p>
                            )}
                        </div>
                    </section>
                )}
            </main>

            {/* Dashboard Mobile Bottom Navigation */}
            <div className="dashboard-bottom-nav">
                <div className={`db-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <FaChartLine />
                    <span>Home</span>
                </div>
                <div className={`db-nav-item ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>
                    <FaPlus />
                    <span>Add</span>
                </div>
                <div className={`db-nav-item ${activeTab === 'manager' ? 'active' : ''}`} onClick={() => setActiveTab('manager')}>
                    <FaBoxOpen />
                    <span>Manage</span>
                </div>
                <div className={`db-nav-item ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>
                    <FaEdit />
                    <span>Design</span>
                </div>
                <div className={`db-nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
                    <FaWallet />
                    <span>Money</span>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Withdraw Fund</h3>
                        <form onSubmit={handleWithdraw}>
                            <div className="form-group">
                                <label>Amount (৳)</label>
                                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Method</label>
                                <select className="form-control" value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)}>
                                    <option value="bkash">bKash</option>
                                    <option value="nagad">Nagad</option>
                                </select>
                            </div>
                            <button type="submit" className="save-btn" style={{ width: '100%', padding: '15px', marginTop: '10px' }}>Submit Request</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResellerLanding;
