import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


const RutaProtegida = ({ children }) => {
    const { store } = useGlobalReducer();

    // Verificación ultra-segura:
    const token = store.token || localStorage.getItem("token");
    const role = store.role || localStorage.getItem("role");

    console.log("DEBUG GUARDIA -> Token:", !!token, "Role:", role);

    if (token && role === "company") {
        return children;
    }

    // Si llegamos aquí, algo falló
    return <Navigate to="/login-company" replace />;
};
export default RutaProtegida;