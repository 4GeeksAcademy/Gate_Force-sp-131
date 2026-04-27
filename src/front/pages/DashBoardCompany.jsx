import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashBoardCompany = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const success = await actions.getCompanyData();
                console.log("respuesta:", success);
            } catch (error) {
                console.error("ERROR:", error);
            } finally {
                setLoading(false);
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
        <div className="container mt-5">
            <div className="d-flex justify-content-end mb-3">
                <button onClick={handleLogout} className="btn btn-outline-danger shadow-sm">
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
            </div>
            <div className="text-center mb-4">
                <h1 className="display-5 fw-bold">Bienvenido, {company?.nombre_empresa || "Empresa"}</h1>
                <p className="lead text-muted">Panel de Gestión Administrativa</p>
            </div>
            <div className="row mt-4">
                <div className="col-md-6 mb-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title"> Empleados</h5>
                            <p className="text-muted">Gestiona tu equipo</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/employees")}
                            >
                                Ver empleados
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title">Vacaciones</h5>
                            <p className="text-muted">Controla días libres</p>
                            <button
                                className="btn btn-success"
                                onClick={() => navigate("/vacaciones")}
                            >
                                Ver vacaciones
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DashBoardCompany;