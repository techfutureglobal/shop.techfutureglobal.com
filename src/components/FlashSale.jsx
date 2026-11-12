import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductSliderSection from './ProductSliderSection';

const FlashSale = () => {
    const { flashProducts } = useContext(ShopContext);

    return (
        <ProductSliderSection
            id="flash-sale"
            title="OFFER Products"
            viewAllLink="/shop?onSale=true"
            viewAllLabel="SHOP ALL PRODUCTS"
            products={flashProducts}
        />
    );
};

export default FlashSale;
