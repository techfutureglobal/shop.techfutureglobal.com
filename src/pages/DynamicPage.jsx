import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DynamicPage.css';

const DynamicPage = () => {
    const { slug } = useParams();
    const { dynamicPages, siteConfig } = useContext(ShopContext);
    const { header } = siteConfig || {};
    const [page, setPage] = useState(null);

    useEffect(() => {
        const foundPage = dynamicPages.find(p => p.slug === slug);
        setPage(foundPage);
        if (foundPage) {
            document.title = `${foundPage.title} | ${header?.logoText || 'Ebaybd'}`;
        }
    }, [slug, dynamicPages, header]);

    if (!page) {
        return (
            <div>
                <Header />
                <div className="page-not-found">
                    <h1>404</h1>
                    <p>Page Not Found</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="dynamic-page-wrapper">
            <Header />
            <div className="dynamic-page-content">
                {page.blocks?.map((block) => (
                    <div key={block.id} className={`content-block ${block.type}`}>
                        {block.type === 'headline' && (
                            <h1 style={{ color: block.color || '#1a1a1a' }}>{block.content}</h1>
                        )}
                        {block.type === 'text' && (
                            <div
                                className="text-content"
                                style={{ color: block.color || '#4a4a4a' }}
                                dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br/>') }}
                            />
                        )}
                        {block.type === 'image' && (
                            <img
                                src={block.content}
                                alt="Content"
                                style={{
                                    width: block.width ? (block.width === 'auto' ? 'auto' : block.width + '%') : '100%',
                                    height: block.height && block.height !== 'auto' ? block.height + 'px' : 'auto',
                                    borderRadius: (block.borderRadius || 0) + 'px',
                                    objectFit: 'cover'
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default DynamicPage;
