import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashBoardCompany = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const success = await actions.getCompanyData();
            setLoading(false);
            if (!success) {
                console.error("No se pudo cargar la información");
            }
        };
        init();
    }, []);

    const handleLogout = () => {
        actions.logout(); // Asegúrate de tener esta acción en store.js
        navigate("/login-company");
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    const company = store.companyInfo;

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bold text-primary">Panel de Empresa</h2>
                    <p className="text-muted mb-0">Gestiona la información de tu organización</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger d-flex align-items-center gap-2"
                >
                    <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </div>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                                <i className="fas fa-building fa-2x text-secondary"></i>
                            </div>
                            <h4 className="card-title mb-1">{company?.nombre_empresa || "Nombre no disponible"}</h4>
                            <span className="badge bg-success-soft text-success border border-success px-3 py-2 rounded-pill">
                                Perfil Verificado
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
                                    <label className="text-muted small text-uppercase fw-bold">ID de Empresa</label>
                                    <p className="fs-5">{company?.id || "N/A"}</p>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Región</label>
                                    <p className="fs-5">{company?.region || "No especificada"}</p>
                                </div>
                                <div className="col-sm-12">
                                    <label className="text-muted small text-uppercase fw-bold">Correo Electrónico</label>
                                    <p className="fs-5 mb-0 text-primary">{company?.email || "Sin correo registrado"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashBoardCompany;