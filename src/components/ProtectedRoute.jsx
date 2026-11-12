import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useContext(ShopContext);

    if (!user) {
        return <Navigate to="/" replace />; // Default redirect
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If logged in but wrong role, send them to their respectful dashboard or home
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
        if (user.role === 'reseller') return <Navigate to="/reseller/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
