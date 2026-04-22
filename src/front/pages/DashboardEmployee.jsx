import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashboardEmployee = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
            const token = store.token || localStorage.getItem("token");
            const res = await fetch(`${API_URL}employee/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployee(data);
            } else {
                navigate("/login-employee");
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleLogout = () => {
        actions.logout();
        navigate("/login-employee");
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bold text-primary">Panel de Empleado</h2>
                    <p className="text-muted mb-0">Bienvenido, {employee?.first_name}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center gap-2">
                    <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </div>

            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                                <i className="fas fa-user fa-2x text-secondary"></i>
                            </div>
                            <h4 className="card-title mb-1">{employee?.first_name} {employee?.last_name}</h4>
                            <span className="badge bg-primary px-3 py-2 rounded-pill">
                                {employee?.position || "Sin cargo"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Información General</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">ID</label>
                                    <p className="fs-5">{employee?.id}</p>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Teléfono</label>
                                    <p className="fs-5">{employee?.phone || "No especificado"}</p>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Email</label>
                                    <p className="fs-5 text-primary">{employee?.email}</p>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Rol</label>
                                    <p className="fs-5">{employee?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardEmployee;