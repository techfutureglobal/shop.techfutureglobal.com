import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaYoutube, FaInstagram, FaPhone, FaWhatsapp, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import './Footer.css';

const Footer = () => {
    const { siteConfig, getMenuByLocation } = useContext(ShopContext);
    const { footer, header } = siteConfig || {};

    // Get dynamic links from menu system
    const col1Links = getMenuByLocation('footerCol1');
    const col2Links = getMenuByLocation('footerCol2');
    const col3Links = getMenuByLocation('footerCol3');

    const finalCol1Links = col1Links.length > 0 ? col1Links : (footer?.column1?.links || []);
    const finalCol2Links = col2Links.length > 0 ? col2Links : (footer?.column2?.links || []);
    const finalCol3Links = col3Links.length > 0 ? col3Links : (footer?.column3?.links || []);

    // Contact info from admin
    const contact = footer?.contact || {};
    const appLinks = footer?.appLinks || {};
    const socials = footer?.socials || {};

    // Show app section only if at least one link is set
    const hasAppLinks = appLinks.playStore || appLinks.appStore;

    // Show social only if at least one link is set
    const hasSocials = socials.facebook || socials.youtube || socials.instagram || socials.twitter;

    // Show contact column only if any contact field is filled
    const hasContact = contact.address || contact.email || contact.phone || contact.whatsapp;

    if (!footer) return null;

    return (
        <footer className="footer-main">
            {/* Top orange bar */}
            <div className="footer-top-strip"></div>

            <div className="footer-inner">
                <div className="container">
                    <div className="footer-content-layout">

                        {/* ── Brand Section ── */}
                        <div className="footer-brand-column">
                            <div className="footer-logo-wrap">
                                {footer.logoImage ? (
                                    <img src={footer.logoImage} alt="Logo" className="footer-logo-img" />
                                ) : (
                                    <h1 className="footer-logo-text-branding">{header?.logoText || 'Ebaybd'}</h1>
                                )}
                            </div>

                            {footer.description && (
                                <p className="footer-description">{footer.description}</p>
                            )}

                            {/* App Download — only shown if admin has filled in links */}
                            {hasAppLinks && (
                                <div className="download-app-section">
                                    <h4 className="download-app-title">DOWNLOAD APP</h4>
                                    <div className="app-store-badges">
                                        {appLinks.playStore && (
                                            <a href={appLinks.playStore} target="_blank" rel="noopener noreferrer" className="app-badge">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                                            </a>
                                        )}
                                        {appLinks.appStore && (
                                            <a href={appLinks.appStore} target="_blank" rel="noopener noreferrer" className="app-badge">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Links Grid (4 columns: col1, col2, col3, contact) ── */}
                        <div className="footer-links-grid">

                            {/* Column 1 — Customer Care */}
                            <div className="footer-links-col">
                                <h4 className="footer-col-head">{footer.column1?.title || 'CUSTOMER CARE'}</h4>
                                <ul className="footer-link-list">
                                    {finalCol1Links.map((link, idx) => (
                                        <li key={link.id || idx}>
                                            {link.url.startsWith('http') ? (
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
                                            ) : (
                                                <Link to={link.url}>{link.text}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 2 — Quick Links */}
                            <div className="footer-links-col">
                                <h4 className="footer-col-head">{footer.column2?.title || 'QUICK LINKS'}</h4>
                                <ul className="footer-link-list">
                                    {finalCol2Links.map((link, idx) => (
                                        <li key={link.id || idx}>
                                            {link.url.startsWith('http') ? (
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
                                            ) : (
                                                <Link to={link.url}>{link.text}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 3 — Information (new middle column) */}
                            <div className="footer-links-col">
                                <h4 className="footer-col-head">{footer.column3?.title || 'INFORMATION'}</h4>
                                <ul className="footer-link-list">
                                    {finalCol3Links.map((link, idx) => (
                                        <li key={link.id || idx}>
                                            {link.url.startsWith('http') ? (
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
                                            ) : (
                                                <Link to={link.url}>{link.text}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact Column — only shown if admin has filled in any contact info */}
                            {hasContact && (
                                <div className="footer-links-col">
                                    <h4 className="footer-col-head">CONTACT</h4>
                                    <div className="footer-contact-info">
                                        {contact.address && (
                                            <p className="footer-contact-item">
                                                <FaMapMarkerAlt className="contact-icon" />
                                                <span>{contact.address}</span>
                                            </p>
                                        )}
                                        {contact.email && (
                                            <p className="footer-contact-item">
                                                <FaEnvelope className="contact-icon" />
                                                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                                            </p>
                                        )}
                                        {contact.phone && (
                                            <p className="footer-contact-item">
                                                <FaPhone className="contact-icon" />
                                                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                                            </p>
                                        )}
                                        {contact.whatsapp && (
                                            <p className="footer-contact-item">
                                                <FaWhatsapp className="contact-icon" />
                                                <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                    {contact.whatsapp}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Social Icons Row ── */}
                    {hasSocials && (
                        <div className="footer-social-wrapper">
                            <div className="social-icon-box">
                                {socials.facebook && (
                                    <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                                        <FaFacebookF />
                                    </a>
                                )}
                                {socials.youtube && (
                                    <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                                        <FaYoutube />
                                    </a>
                                )}
                                {socials.instagram && (
                                    <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                                        <FaInstagram />
                                    </a>
                                )}
                                {socials.twitter && (
                                    <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                                        <FaXTwitter />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Copyright Bar — pinned to absolute bottom of footer ── */}
            <div className="footer-bottom-strip">
                <div className="container footer-bottom-inner">
                    <p className="footer-copyright-text">
                        {footer.copyright || `© ${new Date().getFullYear()} Ebaybd`}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
