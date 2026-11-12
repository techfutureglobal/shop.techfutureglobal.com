import React, { useState, useEffect } from 'react';
import { FaFire, FaThLarge, FaUser, FaChevronUp } from 'react-icons/fa';
import './SidebarNav.css';

const SidebarNav = () => {
    const [activeSection, setActiveSection] = useState('home');
    const [isVisible, setIsVisible] = useState(false);

    const sections = [
        { id: 'top', icon: <FaChevronUp size={20} />, label: 'Top' },
        { id: 'flash-sale', icon: <FaFire size={20} />, label: 'Offer Products' },
        { id: 'categories-section', icon: <FaThLarge size={18} />, label: 'Categories' },
        { id: 'organic-collections', icon: <FaUser size={18} />, label: 'Organic & Tailored Collections' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsVisible(scrollY > 600);

            // Back to top doesn't have an ID usually, we detect scroll position
            if (scrollY < 300) {
                setActiveSection('top');
            } else {
                // Update active section based on scroll
                sections.slice(1).forEach(section => {
                    const element = document.getElementById(section.id);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        if (rect.top <= 200 && rect.bottom >= 200) {
                            setActiveSection(section.id);
                        }
                    }
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAction = (id) => {
        if (id === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const element = document.getElementById(id);
            if (element) {
                window.scrollTo({
                    top: element.offsetTop - 120, // offset for header
                    behavior: 'smooth'
                });
            }
        }
    };

    return (
        <div className={`sidebar-nav ${isVisible ? 'visible' : ''}`}>
            {sections.map(section => (
                <div
                    key={section.id}
                    className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => handleAction(section.id)}
                >
                    <div className="sidebar-icon-wrapper">
                        {section.icon}
                    </div>
                    <span className="tooltip">{section.label}</span>
                </div>
            ))}
        </div>
    );
};

export default SidebarNav;
