import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { FaPlus, FaTrash, FaSave, FaArrowUp, FaArrowDown, FaHeading, FaAlignLeft, FaImage, FaUndo, FaLink, FaPalette, FaCog } from 'react-icons/fa';
import { compressImage } from '../../utils/imageHandler';
import './PageBuilder.css';

const PageBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dynamicPages, addPage, updatePage } = useContext(ShopContext);

    const [pageTitle, setPageTitle] = useState('');
    const [pageSlug, setPageSlug] = useState('');
    const [blocks, setBlocks] = useState([]);
    const [activeSettingsBlock, setActiveSettingsBlock] = useState(null);

    useEffect(() => {
        if (id) {
            const page = dynamicPages.find(p => p.id === id);
            if (page) {
                setPageTitle(page.title);
                setPageSlug(page.slug);
                setBlocks(page.blocks || []);
            }
        }
    }, [id, dynamicPages]);

    const handleSave = () => {
        if (!pageTitle.trim() || !pageSlug.trim()) {
            alert('Title and Slug are required');
            return;
        }

        const pageData = {
            title: pageTitle,
            slug: pageSlug,
            blocks: blocks
        };

        if (id) {
            updatePage(id, { ...pageData, id: id });
            alert('Page updated successfully!');
        } else {
            addPage(pageData);
            alert('Page created successfully!');
        }
        navigate('/admin/pages');
    };

    const addBlock = (type) => {
        const defaults = {
            headline: { content: 'New Headline', color: '#1e293b' },
            text: { content: 'Enter text here...', color: '#475569' },
            image: { content: 'https://placehold.co/600x400?text=Page+Image', width: '100', height: 'auto', borderRadius: '8' }
        };
        const newBlock = {
            id: 'b' + Date.now(),
            type: type,
            ...defaults[type]
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlockProp = (blockId, prop, value) => {
        setBlocks(blocks.map(b => b.id === blockId ? { ...b, [prop]: value } : b));
    };

    const removeBlock = (blockId) => {
        setBlocks(blocks.filter(b => b.id !== blockId));
        if (activeSettingsBlock === blockId) setActiveSettingsBlock(null);
    };

    const moveBlock = (index, direction) => {
        const newBlocks = [...blocks];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < newBlocks.length) {
            const temp = newBlocks[index];
            newBlocks[index] = newBlocks[newIndex];
            newBlocks[newIndex] = temp;
            setBlocks(newBlocks);
        }
    };

    const toggleSettings = (blockId) => {
        setActiveSettingsBlock(activeSettingsBlock === blockId ? null : blockId);
    };

    // Image upload helper for image blocks
    const handleImageUpload = async (blockId, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const url = await compressImage(file, 1200, 0.7);
                updateBlockProp(blockId, 'content', url);
            } catch (error) {
                console.error('Image upload failed', error);
            }
        }
    };

    // Insert link helper for text blocks
    const insertLink = (blockId) => {
        const linkText = prompt('Enter link text:');
        if (!linkText) return;
        const linkUrl = prompt('Enter link URL:');
        if (!linkUrl) return;
        const block = blocks.find(b => b.id === blockId);
        if (block) {
            const newContent = block.content + ` <a href="${linkUrl}">${linkText}</a>`;
            updateBlockProp(blockId, 'content', newContent);
        }
    };

    return (
        <div className="page-builder-container">
            <div className="builder-header">
                <div className="header-left">
                    <button className="btn-back" onClick={() => navigate('/admin/pages')}>
                        <FaUndo /> Back
                    </button>
                    <h2>{id ? 'Edit Page' : 'Create New Page'}</h2>
                </div>
                <button className="btn-save-page" onClick={handleSave}>
                    <FaSave /> Save Page
                </button>
            </div>

            <div className="builder-settings">
                <div className="form-group">
                    <label>Page Title</label>
                    <input
                        type="text"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        placeholder="e.g. Terms & Conditions"
                    />
                </div>
                <div className="form-group">
                    <label>URL Slug</label>
                    <div className="slug-input-wrapper">
                        <span>/p/</span>
                        <input
                            type="text"
                            value={pageSlug}
                            onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                            placeholder="terms-and-conditions"
                        />
                    </div>
                </div>
            </div>

            <div className="builder-main">
                <div className="builder-canvas">
                    {blocks.map((block, index) => (
                        <div key={block.id} className={`block-wrapper ${activeSettingsBlock === block.id ? 'settings-open' : ''}`}>
                            <div className="block-controls">
                                <button onClick={() => moveBlock(index, -1)} disabled={index === 0}><FaArrowUp /></button>
                                <button onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}><FaArrowDown /></button>
                                <button className="settings-btn" onClick={() => toggleSettings(block.id)} title="Settings"><FaCog /></button>
                                <button className="delete" onClick={() => removeBlock(block.id)}><FaTrash /></button>
                            </div>

                            <div className="block-content">
                                {/* HEADLINE BLOCK */}
                                {block.type === 'headline' && (
                                    <input
                                        type="text"
                                        className="headline-edit"
                                        value={block.content}
                                        onChange={(e) => updateBlockProp(block.id, 'content', e.target.value)}
                                        style={{ color: block.color || '#1e293b' }}
                                    />
                                )}

                                {/* TEXT / PARAGRAPH BLOCK */}
                                {block.type === 'text' && (
                                    <div className="text-block-editor">
                                        <div className="text-toolbar">
                                            <button className="toolbar-btn" onClick={() => insertLink(block.id)} title="Insert Link">
                                                <FaLink /> Insert Link
                                            </button>
                                        </div>
                                        <textarea
                                            className="text-edit"
                                            value={block.content}
                                            onChange={(e) => updateBlockProp(block.id, 'content', e.target.value)}
                                            rows="5"
                                            style={{ color: block.color || '#475569' }}
                                        />
                                        <div className="text-preview-label">Preview:</div>
                                        <div
                                            className="text-preview"
                                            style={{ color: block.color || '#475569' }}
                                            dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br/>') }}
                                        />
                                    </div>
                                )}

                                {/* IMAGE BLOCK */}
                                {block.type === 'image' && (
                                    <div className="image-edit-wrapper">
                                        <img
                                            src={block.content}
                                            alt="Block"
                                            style={{
                                                width: block.width ? (block.width === 'auto' ? 'auto' : block.width + '%') : '100%',
                                                height: block.height && block.height !== 'auto' ? block.height + 'px' : 'auto',
                                                borderRadius: (block.borderRadius || 0) + 'px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '10px' }}>
                                            <input
                                                type="text"
                                                value={block.content}
                                                onChange={(e) => updateBlockProp(block.id, 'content', e.target.value)}
                                                placeholder="Image URL"
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(block.id, e)}
                                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SETTINGS PANEL (toggled per block) */}
                            {activeSettingsBlock === block.id && (
                                <div className="block-settings-panel">
                                    <div className="settings-title">
                                        <FaCog /> {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Settings
                                    </div>

                                    {/* Color picker for headline & text */}
                                    {(block.type === 'headline' || block.type === 'text') && (
                                        <div className="settings-row">
                                            <label><FaPalette /> Text Color</label>
                                            <div className="color-picker-row">
                                                <input
                                                    type="color"
                                                    value={block.color || (block.type === 'headline' ? '#1e293b' : '#475569')}
                                                    onChange={(e) => updateBlockProp(block.id, 'color', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="color-hex"
                                                    value={block.color || (block.type === 'headline' ? '#1e293b' : '#475569')}
                                                    onChange={(e) => updateBlockProp(block.id, 'color', e.target.value)}
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Image settings: width, height, borderRadius */}
                                    {block.type === 'image' && (
                                        <>
                                            <div className="settings-row">
                                                <label>Width (%)</label>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    value={block.width === 'auto' ? 100 : block.width || 100}
                                                    onChange={(e) => updateBlockProp(block.id, 'width', e.target.value)}
                                                />
                                                <span className="range-value">{block.width || 100}%</span>
                                            </div>
                                            <div className="settings-row">
                                                <label>Height (px)</label>
                                                <div className="height-input-row">
                                                    <input
                                                        type="number"
                                                        value={block.height === 'auto' ? '' : block.height || ''}
                                                        onChange={(e) => updateBlockProp(block.id, 'height', e.target.value || 'auto')}
                                                        placeholder="auto"
                                                    />
                                                    <button
                                                        className={`auto-btn ${block.height === 'auto' ? 'active' : ''}`}
                                                        onClick={() => updateBlockProp(block.id, 'height', 'auto')}
                                                    >Auto</button>
                                                </div>
                                            </div>
                                            <div className="settings-row">
                                                <label>Border Radius (px)</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="50"
                                                    value={block.borderRadius || 0}
                                                    onChange={(e) => updateBlockProp(block.id, 'borderRadius', e.target.value)}
                                                />
                                                <span className="range-value">{block.borderRadius || 0}px</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {blocks.length === 0 && (
                        <div className="empty-canvas">
                            <p>Your canvas is empty. Start adding blocks from the library!</p>
                        </div>
                    )}
                </div>

                <div className="block-library">
                    <h3>Block Library</h3>
                    <div className="library-grid">
                        <button onClick={() => addBlock('headline')}>
                            <FaHeading /> Headline
                        </button>
                        <button onClick={() => addBlock('text')}>
                            <FaAlignLeft /> Paragraph
                        </button>
                        <button onClick={() => addBlock('image')}>
                            <FaImage /> Image
                        </button>
                    </div>
                    <div className="library-help">
                        <h4>Tips</h4>
                        <ul>
                            <li>Click <FaCog /> on a block to open its settings (color, size, etc.)</li>
                            <li>Use "Insert Link" in paragraphs to add clickable links</li>
                            <li>Links use HTML: <code>&lt;a href="url"&gt;text&lt;/a&gt;</code></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageBuilder;
