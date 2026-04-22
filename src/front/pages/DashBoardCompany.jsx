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
        actions.logout();
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
        // ... dentro del return de DashBoardCompany.jsx ...

        <div className="container mt-5">
            {/* Botón de Logout arriba a la derecha */}
            <div className="d-flex justify-content-end mb-3">
                <button onClick={handleLogout} className="btn btn-outline-danger shadow-sm">
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
            </div>

            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white py-3">
                    <h3 className="mb-0">Perfil de la Empresa</h3>
                </div>
                <div className="card-body p-4">
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <label className="text-muted small fw-bold text-uppercase">Nombre Comercial</label>
                            <p className="fs-4 fw-semibold border-bottom pb-2">{company?.nombre_empresa}</p>
                        </div>
                        <div className="col-md-6 mb-4">
                            <label className="text-muted small fw-bold text-uppercase">Correo Corporativo</label>
                            <p className="fs-4 fw-semibold border-bottom pb-2">{company?.email || "Sin email registrado"}</p>
                        </div>
                        <div className="col-md-6 mb-4">
                            <label className="text-muted small fw-bold text-uppercase">Región / Ubicación</label>
                            <p className="fs-4 fw-semibold border-bottom pb-2">{company?.region}</p>
                        </div>
                        <div className="col-md-3 mb-4">
                            <label className="text-muted small fw-bold text-uppercase">Fecha de Registro</label>
                            <p className="fs-5 border-bottom pb-2">{company?.created_at}</p>
                        </div>
                        <div className="col-md-3 mb-4">
                            <label className="text-muted small fw-bold text-uppercase">Estado</label>
                            <div>
                                <span className={`badge ${company?.is_active ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                                    {company?.is_active ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DashBoardCompany;