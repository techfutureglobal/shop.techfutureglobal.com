import React, { useState, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { compressImage } from '../../utils/imageHandler';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaList, FaChevronRight, FaChevronDown } from 'react-icons/fa';

const CategoryManager = () => {
    const { user, categories, addCategory, updateCategory, deleteCategory } = useContext(ShopContext);

    // Admin can do everything. Sellers can add but maybe not delete system categories?
    // User requested specifically for sellers to be able to add.
    const isAdmin = user?.role === 'admin';
    const isSeller = user?.role === 'seller';
    const isReseller = user?.role === 'reseller';
    const canManage = isAdmin || isSeller || isReseller;

    if (!canManage) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '50px' }}>
                <FaList style={{ fontSize: '50px', color: '#888ea8', marginBottom: '20px' }} />
                <h2>Access Restricted</h2>
                <p style={{ color: '#888ea8' }}>Only system administrators and sellers can manage product categories.</p>
            </div>
        );
    }

    const [view, setView] = useState('list');
    const [editMode, setEditMode] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        img: '',
        imageType: 'url',
        subcategories: []
    });

    // Subcategory Editing State
    const [activeSub, setActiveSub] = useState(null);
    const [subForm, setSubForm] = useState({ title: '', items: [] });
    const [childItemInput, setChildItemInput] = useState('');

    const toggleExpand = (id) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const handleEdit = (category) => {
        setFormData({
            ...category,
            imageType: 'url',
            subcategories: category.subcategories || []
        });
        setEditMode(true);
        setView('form');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategory(id);
        }
    };

    const handleAddNew = () => {
        setFormData({
            id: '',
            name: '',
            img: '',
            imageType: 'url',
            subcategories: []
        });
        setEditMode(false);
        setView('form');
    };

    const handleImageFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Category icons are small, so we use 400px maxWidth and 0.8 quality
                const compressed = await compressImage(file, 400, 0.8);
                setFormData({ ...formData, img: compressed });
            } catch (err) {
                console.error('Category icon compression error:', err);
                alert('Failed to process image. Try a smaller one.');
            }
        }
    };

    // Subcategory Management inside Form
    const handleAddSubCategory = () => {
        if (!subForm.title) return alert('Subcategory title is required');
        const newSub = { ...subForm };

        let newSubcategories;
        if (activeSub !== null) {
            // Edit existing
            newSubcategories = formData.subcategories.map((sub, idx) =>
                idx === activeSub ? newSub : sub
            );
        } else {
            // Add new
            newSubcategories = [...formData.subcategories, newSub];
        }

        setFormData({ ...formData, subcategories: newSubcategories });
        setSubForm({ title: '', items: [] });
        setActiveSub(null);
    };

    const handleEditSub = (index) => {
        setActiveSub(index);
        setSubForm(formData.subcategories[index]);
    };

    const handleDeleteSub = (index) => {
        const newSubcategories = formData.subcategories.filter((_, i) => i !== index);
        setFormData({ ...formData, subcategories: newSubcategories });
    };

    const handleAddChildItem = () => {
        if (!childItemInput.trim()) return;
        setSubForm({ ...subForm, items: [...(subForm.items || []), childItemInput] });
        setChildItemInput('');
    };

    const removeChildItem = (idx) => {
        setSubForm({ ...subForm, items: subForm.items.filter((_, i) => i !== idx) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.img) {
            alert('Please fill in all required fields');
            return;
        }

        const categoryPayload = {
            name: formData.name,
            img: formData.img,
            subcategories: formData.subcategories
        };

        try {
            if (editMode) {
                const res = await updateCategory(formData.id, categoryPayload);
                if (res?.success) {
                    alert('Category updated successfully!');
                    setView('list');
                } else {
                    alert('Failed to update category. Check console.');
                }
            } else {
                const res = await addCategory(categoryPayload);
                if (res?.success) {
                    alert('Category added successfully!');
                    setView('list');
                } else {
                    alert('Failed to add category. Check console.');
                }
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving the category.');
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1>Category Manager</h1>
                    <div style={{ fontSize: '14px', color: '#888ea8' }}>Organize your products with categories (Main &gt; Sub &gt; Child)</div>
                </div>
                {view === 'list' && canManage && (
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <FaPlus style={{ marginRight: '8px' }} /> Add New Category
                    </button>
                )}
            </div>

            {view === 'list' && (
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}></th>
                                <th>Icon</th>
                                <th>Category Name</th>
                                <th>Subcategories</th>
                                {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <React.Fragment key={cat.id}>
                                    <tr className="hover-row">
                                        <td>
                                            {(cat.subcategories && cat.subcategories.length > 0) && (
                                                <button onClick={() => toggleExpand(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                                                    {expandedCategory === cat.id ? <FaChevronDown /> : <FaChevronRight />}
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e0e6ed', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                                                <img src={cat.img} alt={cat.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{cat.name}</td>
                                        <td>{cat.subcategories ? cat.subcategories.length : 0} Levels</td>
                                        {canManage && (
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                    <button className="btn-icon" onClick={() => handleEdit(cat)} title="Edit">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDelete(cat.id)} title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {expandedCategory === cat.id && cat.subcategories && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '0 0 0 50px', background: '#f9f9f9' }}>
                                                <div style={{ padding: '15px' }}>
                                                    <h5 style={{ margin: '0 0 10px 0', color: '#666' }}>Subcategories & Child Items</h5>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                                        {cat.subcategories.map((sub, sIdx) => (
                                                            <div key={sIdx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                                                                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>{sub.title}</div>
                                                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#555' }}>
                                                                    {sub.items && sub.items.map((item, iIdx) => (
                                                                        <li key={iIdx}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'form' && (
                <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #e0e6ed' }}>
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#3b3f5c' }}>{editMode ? 'Edit Category' : 'Add New Category'}</h2>
                        <button className="btn-icon" onClick={() => setView('list')}><FaTimes /></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Main Category Fields */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category Name <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Image (URL or File Upload)</label>
                                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                    <input type="text" className="form-control" value={formData.img} onChange={(e) => setFormData({ ...formData, img: e.target.value })} placeholder="Image URL (e.g. https://...)" />
                                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="form-control" style={{ padding: '6px' }} />
                                </div>
                                {formData.img && (
                                    <img src={formData.img} alt="preview" style={{ height: '40px', marginTop: '10px', objectFit: 'contain' }} />
                                )}
                            </div>
                        </div>

                        {/* Subcategories Management Section */}
                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e6ed' }}>
                            <h4 style={{ marginTop: 0 }}>Manage Subcategories</h4>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Subcategory Title (e.g. Clothing)"
                                        value={subForm.title}
                                        onChange={(e) => setSubForm({ ...subForm, title: e.target.value })}
                                    />

                                    <div style={{ marginTop: '10px' }}>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Add Child Item (e.g. Jeans)"
                                                value={childItemInput}
                                                onChange={(e) => setChildItemInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChildItem())}
                                            />
                                            <button type="button" className="btn btn-sm" onClick={handleAddChildItem}>Add</button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                            {subForm.items && subForm.items.map((item, idx) => (
                                                <span key={idx} style={{ background: '#e0e6ed', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {item} <FaTimes style={{ cursor: 'pointer' }} onClick={() => removeChildItem(idx)} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button type="button" className="btn btn-secondary" onClick={handleAddSubCategory}>
                                    {activeSub !== null ? 'Update Sub' : 'Add Sub'}
                                </button>
                                {activeSub !== null && (
                                    <button type="button" className="btn" onClick={() => { setActiveSub(null); setSubForm({ title: '', items: [] }); }}>Cancel</button>
                                )}
                            </div>

                            {/* List of Subs */}
                            {formData.subcategories && formData.subcategories.length > 0 && (
                                <div className="admin-table-container" style={{ marginTop: '10px' }}>
                                    <table className="admin-table" style={{ fontSize: '13px' }}>
                                        <thead>
                                            <tr>
                                                <th>Subcategory</th>
                                                <th>Child Items</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.subcategories.map((sub, idx) => (
                                                <tr key={idx} style={{ background: activeSub === idx ? '#eeffff' : 'transparent' }}>
                                                    <td><strong>{sub.title}</strong></td>
                                                    <td>{sub.items ? sub.items.join(', ') : ''}</td>
                                                    <td>
                                                        <button type="button" className="btn-icon" onClick={() => handleEditSub(idx)}><FaEdit /></button>
                                                        <button type="button" className="btn-icon delete" onClick={() => handleDeleteSub(idx)}><FaTrash /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '15px', paddingTop: '20px', borderTop: '1px solid #e0e6ed' }}>
                            <button type="button" className="btn" style={{ background: '#f1f5f9', color: '#3b3f5c' }} onClick={() => setView('list')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaSave /> {editMode ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;
