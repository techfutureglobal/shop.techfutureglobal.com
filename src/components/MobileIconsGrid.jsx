import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import './MobileUI.css';

const MobileIconsGrid = () => {
    const { siteConfig } = useContext(ShopContext);
    const { header } = siteConfig || {};
    const siteName = header?.logoText || 'EbayBD';

    const mobileIcons = [
        { name: 'Earn Coins', img: 'https://img.icons8.com/color/96/coins.png', link: '/shop' },
        { name: 'Free Delivery', img: 'https://img.icons8.com/color/96/truck.png', link: '/shop' },
        { name: 'Special Freebie', img: 'https://img.icons8.com/color/96/gift.png', link: '/shop' },
        { name: `${siteName}Mall`, img: 'https://img.icons8.com/color/96/shop.png', link: '/shop' },
        { name: `${siteName}Look`, img: 'https://img.icons8.com/color/96/fashion.png', link: '/shop' },
        { name: 'Ramadan Sale', img: 'https://img.icons8.com/color/96/mosque.png', link: '/shop?onSale=true' },
        { name: 'Buy More Save More', img: 'https://img.icons8.com/color/96/shopping-basket.png', link: '/shop' },
        { name: 'Beauty', img: 'https://img.icons8.com/color/96/lipstick.png', link: '/shop?category=Beauty' },
        { name: 'Everyday Low Price', img: 'https://img.icons8.com/color/96/price-tag.png', link: '/shop' },
        { name: 'Arrival Products', img: 'https://img.icons8.com/color/96/new.png', link: '/shop' }
    ];

    return (
        <div className="mobile-icons-grid">
            {mobileIcons.map((icon, idx) => (
                <Link key={idx} to={icon.link} className="mobile-icon-card">
                    <div className="mobile-icon-img">
                        <img src={icon.img} alt={icon.name} style={{ width: '30px', height: '30px' }} />
                    </div>
                    <span>{icon.name}</span>
                </Link>
            ))}
        </div>
    );
};

export default MobileIconsGrid;
