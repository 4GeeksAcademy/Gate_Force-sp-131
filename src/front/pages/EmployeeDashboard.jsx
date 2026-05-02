import React, { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import TimeTracker from "../components/TimeTracker";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
    const { store, actions } = useGlobalReducer();

    useEffect(() => {
        // Al cargar, nos aseguramos de tener la data fresca del empleado
        // Podríamos llamar a una acción que cargue records, vacaciones, etc.
    }, []);

    return (
        <div className="container py-4">
            <LogoutButton />

            <header className="mb-4">
                <h1 className="h3">Welcome back, {store.user?.first_name}!</h1>
                <p className="text-muted">Here's what's happening today.</p>
            </header>

            <div className="row g-4">
                {/* WIDGET PRINCIPAL: FICHAJE */}
                <div className="col-12 col-md-4">
                    <TimeTracker />
                </div>

                {/* RESUMEN DE ESTADO */}
                <div className="col-12 col-md-8">
                    <div className="row g-3">
                        {/* Vacations Card */}
                        <div className="col-sm-6">
                            <div className="card h-100 border-0 shadow-sm p-3">
                                <h6 className="text-muted small fw-bold text-uppercase">Available Vacations</h6>
                                <h2 className="fw-bold text-primary">12 Days</h2>
                                <Link to="/my-vacations" className="small text-decoration-none mt-auto">Request time off →</Link>
                            </div>
                        </div>

                        {/* Surveys Card */}
                        <div className="col-sm-6">
                            <div className="card h-100 border-0 shadow-sm p-3">
                                <h6 className="text-muted small fw-bold text-uppercase">Pending Surveys</h6>
                                <h2 className="fw-bold text-warning">2</h2>
                                <Link to="/surveys" className="small text-decoration-none mt-auto">Complete surveys →</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCESOS RÁPIDOS (Quick Links) */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Employee Services</h5>
                            <div className="d-flex flex-wrap gap-2">
                                <Link to="/my-payroll" className="btn btn-outline-secondary">
                                    <i className="bi bi-file-earmark-pdf me-2"></i>My Payrolls
                                </Link>
                                <Link to="/report-request" className="btn btn-outline-secondary">
                                    <i className="bi bi-exclamation-triangle me-2"></i>Report Incident
                                </Link>
                                <Link to="/my-schedules" className="btn btn-outline-secondary">
                                    <i className="bi bi-calendar3 me-2"></i>View Schedule
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;