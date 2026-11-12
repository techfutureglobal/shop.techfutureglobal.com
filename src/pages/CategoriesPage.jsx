import React, { useContext } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Categories from '../components/Categories';
import { ShopContext } from '../context/ShopContext';
import './Shop.css'; // Reuse some styles for consistency

const CategoriesPage = () => {
    return (
        <div className="categories-list-page">
            <Header />
            <BottomNav />
            <div className="container" style={{ padding: '20px 0', minHeight: '70vh' }}>
                <Categories />
            </div>
            <Footer />
        </div>
    );
};

export default CategoriesPage;
