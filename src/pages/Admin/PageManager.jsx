import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import './PageManager.css';

const PageManager = () => {
    const { dynamicPages, deletePage } = useContext(ShopContext);
    const navigate = useNavigate();

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            deletePage(id);
        }
    };

    return (
        <div className="page-manager-container">
            <div className="page-manager-header">
                <h2>Manage Dynamic Pages</h2>
                <button className="btn-add-page" onClick={() => navigate('/admin/pages/new')}>
                    <FaPlus /> Create New Page
                </button>
            </div>

            <div className="pages-table-wrapper">
                <table className="pages-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Blocks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dynamicPages.map(page => (
                            <tr key={page.id}>
                                <td>{page.title}</td>
                                <td><code>/p/{page.slug}</code></td>
                                <td>{page.blocks?.length || 0} Blocks</td>
                                <td className="page-actions">
                                    <button
                                        className="btn-icon view"
                                        onClick={() => window.open(`/p/${page.slug}`, '_blank')}
                                        title="View Page"
                                    >
                                        <FaExternalLinkAlt />
                                    </button>
                                    <button
                                        className="btn-icon edit"
                                        onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                                        title="Edit Page"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn-icon delete"
                                        onClick={() => handleDelete(page.id)}
                                        title="Delete Page"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {dynamicPages.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">No dynamic pages found. Click Create New to start.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PageManager;
