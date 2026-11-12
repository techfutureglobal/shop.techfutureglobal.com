import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import './ProductSliderSection.css';

const ProductSliderSection = ({
    id,
    title,
    viewAllLink = '/shop',
    viewAllLabel = 'VIEW ALL',
    products = [],
    sliderId,
}) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    if (!products || products.length === 0) return null;

    const uid = sliderId || id || title?.replace(/\s+/g, '-').toLowerCase();

    return (
        <div id={id} className="product-slider-section container">
            {/* Section Header */}
            <div className="pss-header">
                <div className="pss-header-left">
                    <h3 className="pss-title">{title}</h3>
                </div>
                <div className="pss-header-right">
                    <Link to={viewAllLink} className="pss-view-all">
                        {viewAllLabel}
                    </Link>
                </div>
                <div className="pss-title-line-full">
                    <div className="pss-title-underline-part" />
                </div>
            </div>

            {/* Slider Wrap */}
            <div className="pss-slider-wrap">
                {/* Navigation Arrows on sides */}
                <button
                    ref={prevRef}
                    className={`pss-side-arrow pss-side-prev pss-prev-${uid}`}
                    aria-label="Previous"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button
                    ref={nextRef}
                    className={`pss-side-arrow pss-side-next pss-next-${uid}`}
                    aria-label="Next"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={{
                        prevEl: `.pss-prev-${uid}`,
                        nextEl: `.pss-next-${uid}`,
                    }}
                    pagination={{
                        clickable: true,
                        el: `.pss-dots-${uid}`,
                    }}
                    watchOverflow={false}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    loop={products.length > 6}
                    slidesPerView={2}
                    spaceBetween={12}
                    breakpoints={{
                        480: { slidesPerView: 2, spaceBetween: 12 },
                        640: { slidesPerView: 3, spaceBetween: 15 },
                        900: { slidesPerView: 4, spaceBetween: 16 },
                        1100: { slidesPerView: 5, spaceBetween: 18 },
                        1280: { slidesPerView: 6, spaceBetween: 20 },
                    }}
                    className={`pss-swiper pss-swiper-${uid}`}
                >
                    {products.map((p) => (
                        <SwiperSlide key={p.id}>
                            <ProductCard product={p} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Pagination Dots Container */}
                <div className={`pss-pagination pss-dots-${uid}`} />
            </div>
        </div>
    );
};

export default ProductSliderSection;
