import React, { useContext, useMemo } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FlashSale from '../components/FlashSale';
import NewArrivals from '../components/NewArrivals';
import EmergencyServices from '../components/EmergencyServices';
import Categories from '../components/Categories';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SidebarNav from '../components/SidebarNav';
import BottomNav from '../components/BottomNav';
import MobileIconsGrid from '../components/MobileIconsGrid';
import { ShopContext } from '../context/ShopContext';
import ProductSliderSection from '../components/ProductSliderSection';
import AdBanners from '../components/AdBanners';
import EmergencyAdBanners from '../components/EmergencyAdBanners';

const Home = () => {
    const { flashProducts, justForYouProducts, newArrivalProducts } = useContext(ShopContext);

    const displayProducts = useMemo(() => {
        if (justForYouProducts && justForYouProducts.length > 0) return justForYouProducts;
        const combined = [...flashProducts, ...newArrivalProducts];
        return Array.from(new Map(combined.map(p => [p.id, p])).values()).slice(0, 10);
    }, [justForYouProducts, flashProducts, newArrivalProducts]);

    return (
        <div className="home-page">
            <SidebarNav />
            <BottomNav />
            <Header />

            {/* Hero: includes secondary nav + category sidebar + slider + ad */}
            <div id="home">
                <Hero />
            </div>

            {/* Desktop Categories section */}
            <div id="categories-section">
                <Categories />
            </div>

            <FlashSale />
            <NewArrivals />

            {/* Renamed and Moved: ORGANIC & TAILORED COLLECTIONS (formerly Just For You) */}
            <ProductSliderSection
                id="organic-collections"
                title="ORGANIC & TAILORED COLLECTIONS"
                viewAllLink="/shop"
                viewAllLabel="SEE ALL"
                products={displayProducts}
            />

            <AdBanners />

            <EmergencyAdBanners />

            <EmergencyServices />

            <Footer />
        </div>
    );
};

export default Home;
