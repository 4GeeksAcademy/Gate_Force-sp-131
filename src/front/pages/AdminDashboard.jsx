import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const AdminDashboard = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
            const token = store.token || localStorage.getItem("token");
            const res = await fetch(`${API_URL}admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAdmin(data);
            } else {
                navigate("/login-admin");
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleLogout = () => {
        actions.logout();
        navigate("/login-admin");
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bold text-danger">Panel de Administrador</h2>
                    <p className="text-muted mb-0">Acceso total al sistema</p>
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
                                <i className="fas fa-user-shield fa-2x text-danger"></i>
                            </div>
                            <h4 className="card-title mb-1">{admin?.username}</h4>
                            <span className="badge bg-danger px-3 py-2 rounded-pill">
                                Administrador
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
                                    <p className="fs-5">{admin?.id}</p>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Username</label>
                                    <p className="fs-5">{admin?.username}</p>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Creado el</label>
                                    <p className="fs-5">{admin?.created_at}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Accesos rápidos</h5>
                        </div>
                        <div className="card-body d-flex flex-wrap gap-3">
                            <button onClick={() => navigate("/employees")} className="btn btn-outline-primary">
                                <i className="fas fa-users me-2"></i>Empleados
                            </button>
                            <button onClick={() => navigate("/company")} className="btn btn-outline-success">
                                <i className="fas fa-building me-2"></i>Empresas
                            </button>
                            <button onClick={() => navigate("/managers")} className="btn btn-outline-warning">
                                <i className="fas fa-user-tie me-2"></i>Managers
                            </button>
                            <button onClick={() => navigate("/nominas")} className="btn btn-outline-info">
                                <i className="fas fa-file-invoice me-2"></i>Nóminas
                            </button>
                            <button onClick={() => navigate("/work-records")} className="btn btn-outline-secondary">
                                <i className="fas fa-clock me-2"></i>Registros
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;