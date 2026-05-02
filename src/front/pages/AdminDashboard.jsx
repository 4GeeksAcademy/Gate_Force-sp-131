import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const { actions } = useGlobalReducer();
    const [stats, setStats] = useState({ totalCompanies: 0, totalEmployees: 0, systemLogs: 0 });

    useEffect(() => {
        const loadGlobalStats = async () => {
            const companies = await actions.apiFetch("/companies");
            const employees = await actions.apiFetch("/employees"); // El admin ve TODOS
            if (companies.ok && employees.ok) {
                setStats({
                    totalCompanies: companies.data.length,
                    totalEmployees: employees.data.length,
                    systemLogs: 150 // Dato de ejemplo o de endpoint de logs
                });
            }
        };
        loadGlobalStats();
    }, []);

    return (
        <div className="container py-4">
            <header className="mb-5">
                <h1 className="display-5 fw-bold text-dark">System Administration</h1>
                <p className="lead text-muted">Global oversight of the GateForce Platform.</p>
            </header>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100 bg-dark text-white">
                        <h6 className="text-secondary text-uppercase small fw-bold">Active Companies</h6>
                        <h2 className="display-4 fw-bold">{stats.totalCompanies}</h2>
                        <Link to="/manage-companies" className="text-primary text-decoration-none small mt-3">View directory →</Link>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h6 className="text-muted text-uppercase small fw-bold">Total Users Logged</h6>
                        <h2 className="display-4 fw-bold">{stats.totalEmployees}</h2>
                        <p className="text-muted small">Combined workforce across all clients.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h6 className="text-muted text-uppercase small fw-bold">Audit Events</h6>
                        <h2 className="display-4 fw-bold text-danger">{stats.systemLogs}</h2>
                        <Link to="/audit-logs" className="text-danger text-decoration-none small mt-3">Security review →</Link>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">Master Controls</h5>
                    <div className="d-grid gap-3 d-md-flex">
                        <Link to="/manage-companies" className="btn btn-outline-dark px-4">
                            <i className="bi bi-building me-2"></i>Company Directory
                        </Link>
                        <button className="btn btn-outline-secondary px-4">
                            <i className="bi bi-shield-lock me-2"></i>System Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;