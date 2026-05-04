import React from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const LogoutButton = ({ className = "btn-outline-danger" }) => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();

    const handleLogout = () => {
        actions.logout(); // Ejecuta la limpieza
        navigate("/login"); // Redirige al inicio
    };

    return (
        <button
            onClick={handleLogout}
            className={`btn d-flex align-items-center gap-2 fw-bold ${className}`}
        >
            <i className="bi bi-box-arrow-right"></i>
            <span>Cerrar Sesión</span>
        </button>
    );
};

export default LogoutButton;