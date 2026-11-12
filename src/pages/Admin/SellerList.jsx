import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaStar, FaEdit, FaBan, FaCheckCircle, FaTimes, FaStore, FaEnvelope, FaPhone } from 'react-icons/fa';

const SellerList = () => {
    const { sellers, toggleUserStatus } = useContext(ShopContext);
    const [editingSeller, setEditingSeller] = useState(null);
    const [editForm, setEditForm] = useState({
        storeName: '',
        rating: '',
        followers: '',
        email: '',
        phone: ''
    });

    const handleEditClick = (seller) => {
        setEditingSeller(seller);
        setEditForm({
            storeName: seller.storeName || '',
            rating: seller.rating || '',
            followers: seller.followers || '',
            email: seller.email || '',
            phone: seller.phone || ''
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        // Construct updated seller object
        const updatedData = {
            ...editForm
        };
        // Call context function to update
        // updateStoreDetails(editingSeller.id, updatedData); // Assuming this function exists and works
        console.log("Updating seller:", editingSeller.id, updatedData);
        alert('Seller updated successfully (Mock)');
        setEditingSeller(null);
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Seller Management</h1>
                <div style={{ fontSize: '14px', color: '#888ea8' }}>Manage your verified sellers</div>
            </div>

            <div className="table-wrapper table-wrapper-scroll">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Seller Info</th>
                            <th>Contact</th>
                            <th>Performance</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellers.map((seller) => (
                            <tr key={seller.id} className="hover-row">
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: '#e0e6ed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {seller.logo ? (
                                                <img src={seller.logo} alt={seller.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <FaStore style={{ color: '#888ea8' }} />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#3b3f5c' }}>{seller.storeName}</div>
                                            <div style={{ fontSize: '12px', color: '#888ea8' }}>ID: #{seller.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3b3f5c' }}>
                                            <FaEnvelope style={{ color: '#888ea8', fontSize: '12px' }} /> {seller.email || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3b3f5c' }}>
                                            <FaPhone style={{ color: '#888ea8', fontSize: '12px' }} /> {seller.phone || 'N/A'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                            <FaStar style={{ color: '#e2a03f', fontSize: '12px' }} />
                                            <span style={{ fontWeight: '600' }}>{seller.rating}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#888ea8' }}>
                                            {seller.followers} followers
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${seller.status === 'Banned' ? 'error' : 'success'}`}>
                                        {seller.status === 'Banned' ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEditClick(seller)}
                                            title="Edit Details"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => toggleUserStatus(seller.id, 'seller')}
                                            title={seller.status === 'Banned' ? "Activate Seller" : "Ban Seller"}
                                            style={{
                                                color: seller.status === 'Banned' ? '#1abc9c' : '#e7515a',
                                                borderColor: seller.status === 'Banned' ? '#1abc9c' : '#e7515a'
                                            }}
                                        >
                                            {seller.status === 'Banned' ? <FaCheckCircle /> : <FaBan />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingSeller && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e0e6ed', paddingBottom: '15px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#3b3f5c' }}>Edit Seller Details</h2>
                            <button
                                className="btn-icon"
                                onClick={() => setEditingSeller(null)}
                                style={{ border: 'none', background: 'transparent', fontSize: '16px' }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#3b3f5c' }}>Store Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editForm.storeName}
                                        onChange={e => setEditForm({ ...editForm, storeName: e.target.value })}
                                        placeholder="Enter store name"
                                    />
                                </div>

                                <div className="grid-responsive-2" style={{ gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#3b3f5c' }}>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            placeholder="seller@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#3b3f5c' }}>Phone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.phone}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            placeholder="+880..."
                                        />
                                    </div>
                                </div>

                                <div className="grid-responsive-2" style={{ gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#3b3f5c' }}>Rating</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control"
                                            value={editForm.rating}
                                            onChange={e => setEditForm({ ...editForm, rating: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#3b3f5c' }}>Followers</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editForm.followers}
                                            onChange={e => setEditForm({ ...editForm, followers: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ background: '#f1f5f9', color: '#3b3f5c' }}
                                    onClick={() => setEditingSeller(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerList;
