import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import './EmergencyAdBanners.css';

const EmergencyAdBanners = () => {
    const { siteConfig } = useContext(ShopContext);
    const banners = siteConfig?.emergencyBanners || [];

    // Only render if at least one banner has an image
    const hasImages = banners.some(b => b.image);
    if (!hasImages) return null;

    return (
        <section className="emergency-ad-banners-section">
            <div className="container">
                <div className="emergency-ad-banners-grid">
                    {banners.map((banner) => (
                        banner.image && (
                            <a
                                key={banner.id}
                                href={banner.url || '#'}
                                className="emergency-ad-banner-item"
                                target={banner.url?.startsWith('http') ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                            >
                                <img src={banner.image} alt="Advertisement Banner" />
                            </a>
                        )
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EmergencyAdBanners;
