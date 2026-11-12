import React, { useContext, useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { ShopContext } from '../context/ShopContext';
import { FaFilter, FaTimes, FaSortAmountDown } from 'react-icons/fa';
import './Shop.css';
import { useLocation } from 'react-router-dom';

const Shop = () => {
    const { allProducts: contextProducts, categories } = useContext(ShopContext);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';
    const initialCategory = queryParams.get('category') || 'All';
    const initialOnSale = queryParams.get('onSale') === 'true';

    // State for filters
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [onSaleOnly, setOnSaleOnly] = useState(initialOnSale);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('default');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Sync search term and category with URL query param
    useEffect(() => {
        setSearchTerm(initialSearch);
        if (initialCategory) setSelectedCategory(initialCategory);
        if (initialOnSale) setOnSaleOnly(initialOnSale);
    }, [initialSearch, initialCategory, initialOnSale]);

    // Apply filtering and sorting
    const filteredProducts = useMemo(() => {
        let result = [...contextProducts];

        // Search Filter
        if (searchTerm) {
            result = result.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(p => {
                const cat = categories.find(c => c.name === selectedCategory);
                return p.category_id === cat?.id;
            });
        }

        // Price Filter
        if (minPrice) {
            result = result.filter(p => parseFloat(p.price) >= parseFloat(minPrice));
        }
        if (maxPrice) {
            result = result.filter(p => parseFloat(p.price) <= parseFloat(maxPrice));
        }

        // Sale Filter
        if (onSaleOnly) {
            result = result.filter(p => p.discount);
        }

        // Stock Filter
        if (inStockOnly) {
            result = result.filter(p => p.stock > 0);
        }

        // Sorting
        if (sortBy === 'priceLow') {
            result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'priceHigh') {
            result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }

        return result;
    }, [contextProducts, searchTerm, selectedCategory, minPrice, maxPrice, onSaleOnly, inStockOnly, sortBy]);

    // Handle Reset
    const resetFilters = () => {
        setSelectedCategory('All');
        setMinPrice('');
        setMaxPrice('');
        setOnSaleOnly(false);
        setInStockOnly(false);
        setSortBy('default');
    };

    return (
        <div className="shop-page">
            <Header />

            <div className="container">
                <main className="shop-main-container">

                    {/* Desktop Sidebar */}
                    <aside className="shop-sidebar">
                        <div className="filter-section">
                            <h4>Categories</h4>
                            <div className="shop-cat-list">
                                <span
                                    className={`shop-cat-item ${selectedCategory === 'All' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('All')}
                                >
                                    All Categories
                                </span>
                                {categories?.map(cat => (
                                    <span
                                        key={cat.id}
                                        className={`shop-cat-item ${selectedCategory === cat.name ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.name)}
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>Price Range</h4>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>Filter By</h4>
                            <div className="checkbox-group">
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={onSaleOnly}
                                        onChange={() => setOnSaleOnly(!onSaleOnly)}
                                    />
                                    On Sale
                                </label>
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={inStockOnly}
                                        onChange={() => setInStockOnly(!inStockOnly)}
                                    />
                                    In Stock
                                </label>
                            </div>
                        </div>

                        <button className="price-range-btn" onClick={resetFilters} style={{ background: '#333' }}>
                            Reset All Filters
                        </button>
                    </aside>

                    {/* Main Content Area */}
                    <div className="shop-content">
                        <div className="shop-toolbar">
                            <div className="toolbar-left">
                                <h2>{selectedCategory === 'All' ? 'Shop All Products' : selectedCategory}</h2>
                                <span>{filteredProducts.length} items found</span>
                            </div>

                            <div className="toolbar-right">
                                <button className="mobile-filter-trigger" onClick={() => setIsFilterOpen(true)}>
                                    <FaFilter /> Filter
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaSortAmountDown color="#888" />
                                    <select
                                        className="sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="default">Sort by: Default</option>
                                        <option value="priceLow">Price: Low to High</option>
                                        <option value="priceHigh">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="products-grid-view">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '8px' }}>
                                <img src="https://img.icons8.com/ios/100/757575/nothing-found.png" alt="No results" style={{ opacity: 0.5, marginBottom: '20px' }} />
                                <h3 style={{ color: '#555' }}>No products match your filters</h3>
                                <button className="price-range-btn" onClick={resetFilters} style={{ width: 'auto', padding: '10px 30px', marginTop: '15px' }}>
                                    Clear Filter
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Filter Modal */}
            <div className={`mobile-filter-modal ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)}>
                <div className="mobile-filter-content" onClick={e => e.stopPropagation()}>
                    <div className="filter-modal-header">
                        <h3>Filters</h3>
                        <button className="close-filter" onClick={() => setIsFilterOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="filter-group">
                        <span className="filter-title">Price Range</span>
                        <div className="price-inputs">
                            <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                            <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                        </div>
                    </div>

                    <div className="filter-group" style={{ marginTop: '20px' }}>
                        <span className="filter-title">Availability & Offers</span>
                        <div className="checkbox-group">
                            <label className="checkbox-item">
                                <input type="checkbox" checked={onSaleOnly} onChange={() => setOnSaleOnly(!onSaleOnly)} />
                                On Sale
                            </label>
                            <label className="checkbox-item">
                                <input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} />
                                In Stock
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
                        <button className="price-range-btn" onClick={() => setIsFilterOpen(false)}>
                            Apply Filters
                        </button>
                        <button className="price-range-btn" onClick={resetFilters} style={{ background: '#333', marginTop: '10px' }}>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Shop;
