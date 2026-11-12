import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ShopContext } from '../context/ShopContext';
import './Categories.css';

// Fallback icons if category has no image
const FALLBACK_ICONS = [
    'https://img.icons8.com/color/96/tools.png',
    'https://img.icons8.com/color/96/hospital.png',
    'https://img.icons8.com/color/96/home.png',
    'https://img.icons8.com/color/96/health-book.png',
    'https://img.icons8.com/color/96/stationery.png',
    'https://img.icons8.com/color/96/vegetarian-food.png',
    'https://img.icons8.com/color/96/fashion.png',
    'https://img.icons8.com/color/96/electronics.png',
    'https://img.icons8.com/color/96/cosmetics.png',
    'https://img.icons8.com/color/96/baby.png',
];

const Categories = () => {
    const { categories } = useContext(ShopContext);

    const displayCats = categories && categories.length > 0 ? categories : [];

    return (
        <div className="categories-section-wrapper">
            <div className="container">
                {/* Section Title */}
                <div className="cat-section-header">
                    <h3 className="cat-section-title">
                        Our <span>CATEGORIES</span>
                    </h3>
                    <div className="cat-title-underline"></div>
                </div>

                {/* Slider */}
                <div className="cat-slider-container">
                    <Swiper
                        modules={[Navigation]}
                        navigation={true}
                        slidesPerView={8}
                        spaceBetween={10}
                        breakpoints={{
                            0: { slidesPerView: 4, spaceBetween: 8 },
                            480: { slidesPerView: 5, spaceBetween: 8 },
                            640: { slidesPerView: 6, spaceBetween: 10 },
                            768: { slidesPerView: 7, spaceBetween: 10 },
                            1024: { slidesPerView: 8, spaceBetween: 10 },
                            1280: { slidesPerView: 9, spaceBetween: 12 },
                        }}
                        className="cat-swiper"
                    >
                        {displayCats.map((cat, index) => (
                            <SwiperSlide key={cat.id || index}>
                                <Link
                                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                                    className="cat-circle-card"
                                >
                                    <div className="cat-circle-img">
                                        <img
                                            src={cat.img || FALLBACK_ICONS[index % FALLBACK_ICONS.length]}
                                            alt={cat.name}
                                        />
                                    </div>
                                    <span className="cat-circle-name">{cat.name}</span>
                                </Link>
                            </SwiperSlide>
                        ))}

                        {/* Skeleton placeholders if no categories yet */}
                        {displayCats.length === 0 &&
                            Array.from({ length: 8 }).map((_, i) => (
                                <SwiperSlide key={`sk-${i}`}>
                                    <div className="cat-circle-card">
                                        <div className="cat-circle-img cat-skeleton-circle"></div>
                                        <span className="cat-skeleton-text"></span>
                                    </div>
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default Categories;
