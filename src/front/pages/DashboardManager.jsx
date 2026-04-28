import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DashboardManager = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            // Asumimos que tienes una acción similar para cargar datos del manager
            const success = await actions.getManagerData();
            if (!success) {
                navigate("/login-manager");
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleLogout = () => {
        actions.logout();
        navigate("/login-employee");
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    const manager = store.managerInfo;

    return (
        <div className="container mt-5">
            {/* Header con Perfil */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0 text-primary">Panel de Gestión: Manager</h2>
                    <p className="text-muted">Hola, {manager?.first_name}. Gestiona tu equipo y tus tareas.</p>
                </div>
                <button onClick={handleLogout} className="btn btn-outline-danger shadow-sm">
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
            </div>

            <div className="row g-4">
                {/* SECCIÓN 1: GESTIÓN DE EQUIPO */}
                <div className="col-12">
                    <h4 className="text-secondary border-bottom pb-2 mb-3">Supervisión de Equipo</h4>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 border-top border-warning border-3 h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                            <h5 className="card-title">Incidencias del Equipo</h5>
                            <p className="small text-muted">Aprobar o rechazar reportes de tus empleados.</p>
                            <button className="btn btn-warning text-dark fw-bold w-100" onClick={() => navigate("/incidents")}>
                                Gestionar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 border-top border-success border-3 h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-calendar-check fa-2x text-success mb-3"></i>
                            <h5 className="card-title">Horarios y Turnos</h5>
                            <p className="small text-muted">Supervisa que todos estén en su puesto.</p>
                            <button className="btn btn-success w-100" onClick={() => navigate("/employees/schedules")}>
                                Ver Horarios
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 border-top border-info border-3 h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-chart-pie fa-2x text-info mb-3"></i>
                            <h5 className="card-title">Feedback / Encuestas</h5>
                            <p className="small text-muted">Resultados de las encuestas de pulso.</p>
                            <button className="btn btn-info text-dark fw-bold w-100" onClick={() => navigate("/surveys")}>
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: ÁREA PERSONAL (Como empleado) */}
                <div className="col-12 mt-5">
                    <h4 className="text-secondary border-bottom pb-2 mb-3">Mi Área Personal</h4>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100 bg-light">
                        <div className="card-body d-flex align-items-center">
                            <div className="me-3">
                                <i className="fas fa-user-circle fa-3x text-secondary"></i>
                            </div>
                            <div>
                                <h6 className="mb-0">Mi Perfil y Nóminas</h6>
                                <Link to="/mis-nominas" className="small text-primary text-decoration-none">Ver mis documentos</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100 bg-light">
                        <div className="card-body d-flex align-items-center">
                            <div className="me-3">
                                <i className="fas fa-clock fa-3x text-secondary"></i>
                            </div>
                            <div>
                                <h6 className="mb-0">Mi Registro de Jornada</h6>
                                <Link to="/work-records" className="small text-primary text-decoration-none">Fichar entrada/salida</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardManager;