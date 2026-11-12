import { useRef, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ShopContext } from '../context/ShopContext';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './EmergencyServices.css';

const EmergencyServices = () => {
    const { siteConfig } = useContext(ShopContext);
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const uid = 'emergency-services';

    const services = siteConfig?.emergencyServices || [];

    const handleServiceClick = (url) => {
        if (url && url !== '#') {
            window.open(url, '_blank');
        }
    };

    if (services.length === 0) return null;

    return (
        <section className="emergency-services-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">ALL EMERGENCY SERVICES</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="services-slider-wrapper">
                    {/* Navigation Arrows */}
                    <button
                        ref={prevRef}
                        className={`pss-side-arrow pss-side-prev em-prev-${uid}`}
                        aria-label="Previous"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        ref={nextRef}
                        className={`pss-side-arrow pss-side-next em-next-${uid}`}
                        aria-label="Next"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>

                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation={{
                            prevEl: `.em-prev-${uid}`,
                            nextEl: `.em-next-${uid}`,
                        }}
                        pagination={{
                            clickable: true,
                            el: `.pss-dots-${uid}`,
                        }}
                        watchOverflow={false}
                        spaceBetween={10}
                        slidesPerView={2}
                        breakpoints={{
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 5 },
                            1024: { slidesPerView: 6 },
                            1200: { slidesPerView: 7 },
                        }}
                        className="emergency-swiper"
                    >
                        {services.map((service) => (
                            <SwiperSlide key={service.id}>
                                <div 
                                    className="service-card" 
                                    onClick={() => handleServiceClick(service.url)}
                                    style={{ cursor: service.url && service.url !== '#' ? 'pointer' : 'default' }}
                                >
                                    <div className="service-img-circle">
                                        <img 
                                            src={service.img} 
                                            alt={service.name} 
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=200&h=200';
                                            }}
                                        />
                                    </div>
                                    <h4 className="service-name">{service.name}</h4>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Pagination Dots Container */}
                    <div className={`pss-pagination pss-dots-${uid}`} />
                </div>
            </div>
        </section>
    );
};

export default EmergencyServices;
