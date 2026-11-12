import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductSliderSection from './ProductSliderSection';

const NewArrivals = () => {
    const { newArrivalProducts } = useContext(ShopContext);

    const uniqueProducts = Array.from(new Map(newArrivalProducts.map(p => [p.id, p])).values());

    return (
        <ProductSliderSection
            id="new-arrivals"
            title="Arrival Products"
            viewAllLink="/shop"
            viewAllLabel="VIEW ALL"
            products={uniqueProducts}
        />
    );
};

export default NewArrivals;
