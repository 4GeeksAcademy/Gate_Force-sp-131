import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { store } = useGlobalReducer();
    const location = useLocation();

    const token = store.token || localStorage.getItem("token");
    const role = store.role || localStorage.getItem("role");

    // 1. Si no hay token, al login unificado
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Verificamos si el rol está permitido (Usamos mayúsculas para coincidir con el backend)
    if (allowedRoles.includes(role)) {
        return children;
    }

    // 3. Si está logueado pero intenta entrar a donde no debe:
    const dashboardRedirect = {
        "ADMIN": "/admin-dashboard",
        "COMPANY": "/company-dashboard",
        "EMPLOYEE": "/employee-dashboard"
    }[role] || "/login";

    return <Navigate to={dashboardRedirect} replace />;
};

export default PrivateRoute;