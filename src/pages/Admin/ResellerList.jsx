import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaUserPlus, FaEye, FaEdit, FaTrash, FaBan, FaCheckCircle, FaTimes } from 'react-icons/fa';

const ResellerList = () => {
    const { resellerStores, toggleUserStatus, updateResellerStore } = useContext(ShopContext);
    const [editingReseller, setEditingReseller] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', slug: '' });

    const handleEditClick = (store) => {
        setEditingReseller(store);
        setEditForm({
            title: store.title,
            slug: store.slug
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        updateResellerStore(editingReseller.userId, editForm);
        setEditingReseller(null);
        alert('Reseller updated successfully');
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Reseller Management</h1>
                {/* <button className="btn btn-primary">Add New Reseller</button> */}
            </div>

            <div className="admin-card">
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Reseller Info</th>
                                <th>Store ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resellerStores.map((store, index) => (
                                <tr key={store.id} style={{ opacity: store.status === 'Banned' ? 0.5 : 1 }}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img
                                                src={store.logo}
                                                alt={store.title}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{store.title}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>@{store.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{store.id}</td>
                                    <td>
                                        {store.status === 'Banned' ? (
                                            <span className="status-badge error">Banned</span>
                                        ) : (
                                            <span className="status-badge success">Active</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="Edit" onClick={() => handleEditClick(store)}><FaEdit /></button>
                                            <button
                                                className={`btn-icon ${store.status === 'Banned' ? 'success' : 'delete'}`}
                                                title={store.status === 'Banned' ? "Activate" : "Ban"}
                                                onClick={() => toggleUserStatus(store.userId, 'reseller')}
                                            >
                                                {store.status === 'Banned' ? <FaCheckCircle /> : <FaBan />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingReseller && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Edit Reseller</h2>
                            <button className="btn-icon" onClick={() => setEditingReseller(null)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Store Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Slug (URL)</label>
                                <input
                                    type="text"
                                    value={editForm.slug}
                                    onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Update Reseller</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResellerList;
