import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { FiShoppingBag } from 'react-icons/fi';
import './BrandLoader.css';

const BrandLoader = ({
  fullScreen = true,
  message = 'Synchronizing real-time data...',
  showRefresh = true,
  customLogo = null,
  customText = null
}) => {
  const shopCtx = useContext(ShopContext);
  const siteConfig = shopCtx?.siteConfig;
  const header = siteConfig?.header;

  const logoImg = customLogo || header?.logoImage;
  const logoText = customText || header?.logoText || 'EbayBD';

  const containerClass = fullScreen ? 'brand-preloader-container' : 'brand-preloader-inline';

  return (
    <div className={containerClass}>
      <div className="brand-loader-card">
        {/* Ambient Glow */}
        <div className="brand-loader-glow-orb"></div>

        {/* Orbit Rings & Logo */}
        <div className="brand-loader-logo-wrapper">
          <div className="brand-loader-orbit"></div>
          <div className="brand-loader-orbit-dashed"></div>

          {logoImg ? (
            <img
              src={logoImg}
              alt={logoText}
              className="brand-loader-img"
              onError={(e) => {
                // If logo fails to load, fallback to icon badge
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}

          <div
            className="brand-loader-icon-badge"
            style={{ display: logoImg ? 'none' : 'flex' }}
          >
            <FiShoppingBag />
          </div>
        </div>

        {/* Brand Name Title */}
        <h2 className="brand-loader-title">
          <span>{logoText}</span>
        </h2>

        {/* Progress Laser / Bar */}
        <div className="brand-loader-progress-track">
          <div className="brand-loader-progress-fill"></div>
        </div>

        {/* Dynamic Status Text */}
        <p className="brand-loader-status">
          <span>{message}</span>
          <span className="brand-loader-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>

        {/* Timeout / Manual Refresh button */}
        {showRefresh && (
          <button
            onClick={() => window.location.reload(true)}
            className="brand-loader-refresh-btn"
            type="button"
          >
            Taking too long? Click to refresh
          </button>
        )}
      </div>
    </div>
  );
};

export default BrandLoader;
