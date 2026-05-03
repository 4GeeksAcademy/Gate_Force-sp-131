import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const CompanyDashboard = () => {
    const { actions } = useGlobalReducer();
    const [stats, setStats] = useState({ employees: 0, pendingVacations: 0, activeClocks: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const loadStats = async () => {
            // Hacemos una única petición al "radar"
            const { ok, data } = await actions.apiFetch("/company/stats");

            if (ok) {
                setStats({
                    employees: data.totalEmployees || 0,
                    pendingVacations: data.totalPending || 0,
                    activeClocks: data.activeClocks || 0 // ¡Aquí llega la magia!
                });
            }
        };

        // 1. Cargamos al entrar a la página
        loadStats();

        // 2. MAGIA: Configuramos un intervalo para que recargue las estadísticas cada 60 segundos
        const radarInterval = setInterval(() => {
            loadStats();
        }, 60000); // 60000 ms = 1 minuto

        // Limpiamos el intervalo si el usuario sale del dashboard
        return () => clearInterval(radarInterval);
    }, []);

    return (
        <div className="container py-4">
            <LogoutButton />

            <header className="mb-5 d-flex justify-content-between align-items-center">
                <div>
                    <h1 className="h3 fw-bold">Company Command Center</h1>
                    <p className="text-muted">Manage your workforce and operational tasks.</p>
                </div>
                <Link to="/create-employee" className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">
                    <i className="bi bi-person-plus me-2"></i>Add Employee
                </Link>
            </header>

            {/* SECCIÓN 1: ESTADÍSTICAS GLOBALES */}
            <h5 className="fw-bold mb-3 text-secondary text-uppercase small">Overview</h5>
            <div className="row g-4 mb-5">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 bg-primary text-white h-100 rounded-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="small fw-bold text-uppercase opacity-75 mb-1">Total Employees</h6>
                                <h2 className="display-4 fw-bold mb-0">{stats.employees}</h2>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bi bi-people-fill fs-1"></i>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/manage-employees")}
                            className="btn btn-light mt-4 fw-bold text-primary rounded-pill shadow-sm"
                        >
                            Manage Staff <i className="bi bi-arrow-right-short ms-1 fs-5"></i>
                        </button>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 bg-dark text-white h-100 rounded-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="small fw-bold text-uppercase opacity-75 mb-1">Currently Working</h6>
                                <h2 className="display-4 fw-bold mb-0">{stats.activeClocks}</h2>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bi bi-stopwatch fs-1 pulse"></i>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/work-logs")}
                            className="btn btn-outline-light mt-4 fw-bold rounded-pill"
                        >
                            View Live Logs <i className="bi bi-arrow-right-short ms-1 fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: HERRAMIENTAS DE GESTIÓN (FORMAS UNIFICADAS) */}
            <h5 className="fw-bold mb-3 text-secondary text-uppercase small">Management Tools</h5>
            <div className="row g-4 mb-5">
                {/* Aprobaciones */}
                <div className="col-md-4">
                    <Link to="/manage-approvals" className="text-decoration-none">
                        <div className="card h-100 border-0 shadow-sm text-center rounded-4 card-hover-effect">
                            <div className="card-body p-5 d-flex flex-column justify-content-center align-items-center">
                                <div className="bg-primary-subtle text-primary rounded-circle p-3 mb-3">
                                    <i className="bi bi-ui-checks fs-2"></i>
                                </div>
                                <h5 className="fw-bold text-dark mb-2">Requests & Approvals</h5>
                                <p className="text-muted small mb-0">Review vacations and incidents</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Nóminas */}
                <div className="col-md-4">
                    <Link to="/payroll-hub" className="text-decoration-none">
                        <div className="card h-100 border-0 shadow-sm text-center rounded-4 card-hover-effect">
                            <div className="card-body p-5 d-flex flex-column justify-content-center align-items-center">
                                <div className="bg-success-subtle text-success rounded-circle p-3 mb-3">
                                    <i className="bi bi-cash-stack fs-2"></i>
                                </div>
                                <h5 className="fw-bold text-dark mb-2">Upload Payrolls</h5>
                                <p className="text-muted small mb-0">Distribute monthly documents</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Encuestas */}
                <div className="col-md-4">
                    <Link to="/survey-builder" className="text-decoration-none">
                        <div className="card h-100 border-0 shadow-sm text-center rounded-4 card-hover-effect">
                            <div className="card-body p-5 d-flex flex-column justify-content-center align-items-center">
                                <div className="bg-warning-subtle text-warning rounded-circle p-3 mb-3">
                                    <i className="bi bi-clipboard-data fs-2"></i>
                                </div>
                                <h5 className="fw-bold text-dark mb-2">Climate Surveys</h5>
                                <p className="text-muted small mb-0">Create and manage feedback</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* SECCIÓN 3: PLANIFICACIÓN Y REGISTROS */}
            <h5 className="fw-bold mb-3 text-secondary text-uppercase small">Planning & Logs</h5>
            <div className="row g-4">
                {/* Horarios */}
                <div className="col-md-6">
                    <Link to="/schedule-planner" className="text-decoration-none">
                        <div className="card h-100 border-0 shadow-sm rounded-4 card-hover-effect">
                            <div className="card-body p-4 d-flex align-items-center">
                                <div className="bg-dark text-white rounded-circle p-3 me-4">
                                    <i className="bi bi-calendar-week fs-3"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Weekly Schedules</h5>
                                    <p className="text-muted small mb-0">Plan and assign shifts to your team</p>
                                </div>
                                <i className="bi bi-chevron-right ms-auto text-muted fs-4"></i>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-6">
                    <Link to="/AIRecommendationsHub" className="text-decoration-none">
                        <div className="card h-100 border-0 shadow-sm rounded-4 card-hover-effect">
                            <div className="card-body p-4 d-flex align-items-center">
                                <div className="bg-dark text-white rounded-circle p-3 me-4">
                                    <i className="bi bi-calendar-week fs-3"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">AI Recommendations</h5>
                                    <p className="text-muted small mb-0">Get personalized insights for your team</p>
                                </div>
                                <i className="bi bi-chevron-right ms-auto text-muted fs-4"></i>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default CompanyDashboard;