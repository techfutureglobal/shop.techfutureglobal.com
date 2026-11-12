import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaTrash, FaPlus, FaEdit, FaSave, FaBars, FaTimes } from 'react-icons/fa';
import './MenuEditor.css';

const MenuEditor = () => {
    const { menus, updateMenus, menuLocations, updateMenuLocations } = useContext(ShopContext);

    const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'locations'
    const [selectedMenuId, setSelectedMenuId] = useState(menus && menus.length > 0 ? menus[0].id : 'new');
    const [menuNameInputValue, setMenuNameInputValue] = useState('');
    const [menuItems, setMenuItems] = useState([]);

    // Form for new item
    const [newItemText, setNewItemText] = useState('');
    const [newItemUrl, setNewItemUrl] = useState('');

    // State for editing existing item
    const [editingItemId, setEditingItemId] = useState(null);
    const [editItemText, setEditItemText] = useState('');
    const [editItemUrl, setEditItemUrl] = useState('');

    useEffect(() => {
        if (selectedMenuId === 'new') {
            setMenuNameInputValue('');
            setMenuItems([]);
        } else {
            const menu = menus?.find(m => m.id === selectedMenuId);
            if (menu) {
                setMenuNameInputValue(menu.name);
                setMenuItems(menu.items || []);
            }
            setEditingItemId(null);
        }
    }, [selectedMenuId, menus]);

    const handleSaveMenu = () => {
        if (!menuNameInputValue.trim()) {
            alert('Menu name is required');
            return;
        }

        if (selectedMenuId === 'new') {
            const newMenu = {
                id: 'menu_' + Date.now(),
                name: menuNameInputValue,
                items: menuItems
            };
            updateMenus([...(menus || []), newMenu]);
            setSelectedMenuId(newMenu.id);
            alert('Menu created successfully!');
        } else {
            const updatedMenus = (menus || []).map(m => m.id === selectedMenuId ? { ...m, name: menuNameInputValue, items: menuItems } : m);
            updateMenus(updatedMenus);
            alert('Menu saved successfully!');
        }
    };

    const handleDeleteMenu = () => {
        if (window.confirm('Are you sure you want to delete this menu?')) {
            const updatedMenus = menus.filter(m => m.id !== selectedMenuId);
            updateMenus(updatedMenus);

            // Remove from locations if it was assigned
            const updatedLocations = { ...menuLocations };
            for (let key in updatedLocations) {
                if (updatedLocations[key] === selectedMenuId) {
                    updatedLocations[key] = '';
                }
            }
            updateMenuLocations(updatedLocations);

            setSelectedMenuId(updatedMenus.length > 0 ? updatedMenus[0].id : 'new');
        }
    };

    const handleAddMenuItem = () => {
        if (!newItemText.trim() || !newItemUrl.trim()) {
            alert('Both Link Text and URL are required');
            return;
        }
        const newItem = {
            id: 'item_' + Date.now(),
            text: newItemText,
            url: newItemUrl
        };
        setMenuItems([...menuItems, newItem]);
        setNewItemText('');
        setNewItemUrl('');
    };

    const handleEditMenuItem = (item) => {
        setEditingItemId(item.id);
        setEditItemText(item.text);
        setEditItemUrl(item.url);
    };

    const handleSaveEditMenuItem = () => {
        if (!editItemText.trim() || !editItemUrl.trim()) {
            alert('Both Link Text and URL are required');
            return;
        }
        setMenuItems(menuItems.map(item =>
            item.id === editingItemId ? { ...item, text: editItemText, url: editItemUrl } : item
        ));
        setEditingItemId(null);
    };

    const handleCancelEditMenuItem = () => {
        setEditingItemId(null);
    };

    const handleRemoveMenuItem = (id) => {
        setMenuItems(menuItems.filter(item => item.id !== id));
    };

    const handleLocationChange = (locKey, menuId) => {
        const newLocations = { ...menuLocations, [locKey]: menuId };
        updateMenuLocations(newLocations);
        alert(`Menu assigned to ${locKey} successfully!`);
    };

    const availableLocations = [
        { key: 'topBar', label: 'Top Bar Navigation (Header)' },
        { key: 'primary', label: 'Middle Menu (Beside Categories)' },
        { key: 'footerCol1', label: 'Footer Column 1' },
        { key: 'footerCol2', label: 'Footer Column 2' },
        { key: 'footerCol3', label: 'Footer Column 3' },
    ];

    return (
        <div className="menu-editor-wrapper">
            <div className="menu-editor-header">
                <h2>Menu Configuration</h2>
                <div className="menu-tabs">
                    <button className={activeTab === 'edit' ? 'active' : ''} onClick={() => setActiveTab('edit')}>Edit Menus</button>
                    <button className={activeTab === 'locations' ? 'active' : ''} onClick={() => setActiveTab('locations')}>Manage Locations</button>
                </div>
            </div>

            {activeTab === 'edit' && (
                <div className="menu-edit-section">
                    <div className="menu-selector-bar">
                        <label>Select a menu to edit:</label>
                        <select value={selectedMenuId} onChange={(e) => setSelectedMenuId(e.target.value)}>
                            {menus?.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                            <option value="new">-- Create New Menu --</option>
                        </select>
                        <button className="btn-primary" onClick={handleSaveMenu}>
                            <FaSave /> Save Menu
                        </button>
                    </div>

                    <div className="menu-editor-grid">
                        <div className="menu-items-adder">
                            <h3>Add Menu Items</h3>
                            <div className="adder-box">
                                <div className="form-group">
                                    <label>URL</label>
                                    <input
                                        type="text"
                                        placeholder="https:// or #special"
                                        value={newItemUrl}
                                        onChange={(e) => setNewItemUrl(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Link Text</label>
                                    <input
                                        type="text"
                                        placeholder="Menu Item"
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                    />
                                </div>
                                <button className="btn-secondary" onClick={handleAddMenuItem}>
                                    <FaPlus /> Add to Menu
                                </button>
                            </div>

                            <div className="special-links-help" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Special Action URLs</h4>
                                <ul style={{ fontSize: '12px', listStyle: 'none', padding: 0 }}>
                                    <li><code>#login</code> - Opens Login Modal</li>
                                    <li><code>#signup</code> - Opens Sign Up Modal</li>
                                    <li><code>#logout</code> - Logs out User</li>
                                    <li><code>#dashboard</code> - Dashboard Link</li>
                                    <li><code>#user</code> - Shows User Name</li>
                                </ul>
                                <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                                    Use these as URLs to create dynamic buttons in the Top Bar.
                                </p>
                            </div>
                        </div>

                        <div className="menu-structure">
                            <div className="structure-header">
                                <div className="menu-name-edit">
                                    <label>Menu Name:</label>
                                    <input
                                        type="text"
                                        value={menuNameInputValue}
                                        onChange={(e) => setMenuNameInputValue(e.target.value)}
                                        placeholder="Enter menu name"
                                    />
                                </div>
                                {selectedMenuId !== 'new' && (
                                    <button className="btn-danger-outline" onClick={handleDeleteMenu}>
                                        <FaTrash /> Delete Menu
                                    </button>
                                )}
                            </div>

                            <div className="structure-body">
                                <h4>Menu Structure</h4>
                                <p className="help-text">Add items from the column on the left.</p>

                                <div className="menu-items-list">
                                    {menuItems.map((item, index) => (
                                        <div key={item.id} className="menu-item-row-wrapper">
                                            <div className="menu-item-row">
                                                <div className="item-drag-handle"><FaBars /></div>
                                                <div className="item-details">
                                                    <strong>{item.text}</strong>
                                                    <span>{item.url}</span>
                                                </div>
                                                <div className="item-actions">
                                                    <button className="edit-action" onClick={() => handleEditMenuItem(item)} title="Edit"><FaEdit /></button>
                                                    <button onClick={() => handleRemoveMenuItem(item.id)} title="Remove"><FaTimes /></button>
                                                </div>
                                            </div>
                                            {editingItemId === item.id && (
                                                <div className="item-edit-form">
                                                    <div className="form-group row">
                                                        <label>URL</label>
                                                        <input type="text" value={editItemUrl} onChange={e => setEditItemUrl(e.target.value)} />
                                                    </div>
                                                    <div className="form-group row">
                                                        <label>Link Text</label>
                                                        <input type="text" value={editItemText} onChange={e => setEditItemText(e.target.value)} />
                                                    </div>
                                                    <div className="item-edit-actions">
                                                        <button className="btn-primary" onClick={handleSaveEditMenuItem}>Update</button>
                                                        <button className="btn-secondary" onClick={handleCancelEditMenuItem}>Cancel</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {menuItems.length === 0 && (
                                        <div className="empty-menu">No items assigned to this menu yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'locations' && (
                <div className="menu-locations-section">
                    <h3>Manage Locations</h3>
                    <p>Your theme supports several different menus. Select which menu appears in each location.</p>

                    <table className="locations-table">
                        <thead>
                            <tr>
                                <th>Theme Location</th>
                                <th>Assigned Menu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableLocations.map(loc => (
                                <tr key={loc.key}>
                                    <td>{loc.label}</td>
                                    <td>
                                        <select
                                            value={menuLocations[loc.key] || ''}
                                            onChange={(e) => handleLocationChange(loc.key, e.target.value)}
                                        >
                                            <option value="">-- Select a Menu --</option>
                                            {menus?.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    );
};

export default MenuEditor;
