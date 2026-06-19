import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PremiumRouteGuard({ children }) {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin' || role === 'SUPER_ADMIN' || role === 'HR_ADMIN';

    if (!isAdmin) {
        // Redirect normal users to ThirdEye Data contact page
        window.location.href = "https://thirdeyedata.ai/contact-us/";
        return null;
    }

    return children;
}
