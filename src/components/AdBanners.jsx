import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import './AdBanners.css';

const AdBanners = () => {
    const { siteConfig } = useContext(ShopContext);
    const banners = siteConfig?.homeBanners || [];

    // Only render if at least one banner has an image
    const hasImages = banners.some(b => b.image);
    if (!hasImages) return null;

    return (
        <section className="ad-banners-section container">
            <div className="ad-banners-grid">
                {banners.map((banner) => (
                    banner.image && (
                        <a
                            key={banner.id}
                            href={banner.url || '#'}
                            className="ad-banner-item"
                            target={banner.url?.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                        >
                            <img src={banner.image} alt="Advertisement" />
                        </a>
                    )
                ))}
            </div>
        </section>
    );
};

export default AdBanners;
