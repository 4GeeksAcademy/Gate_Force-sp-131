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

            <div className="row g-4 mb-5 justify-content-center">
                {/* WIDGET PRINCIPAL: FICHAJE */}
                <div className="col-12 col-lg-6">
                    <TimeTracker />
                </div>

                {/* ACCESOS RÁPIDOS (Quick Links) */}
                <div className="col-12 col-lg-6 d-flex flex-column gap-4 justify-content-center">
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
                                <Link to="/wellness-survey" className="btn btn-outline-secondary">
                                    <i className="bi bi-calendar3 me-2"></i>Wellness Survey
                                </Link>
                                <Link to="/survey" className="btn btn-outline-secondary">
                                    <i className="bi bi-calendar3 me-2"></i>Employee Survey
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