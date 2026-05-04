import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const { actions } = useGlobalReducer();
    const [stats, setStats] = useState({ totalCompanies: 0, totalEmployees: 0, totalLogs: 0 });
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const load = async () => {
            const [companiesRes, employeesRes, logsRes] = await Promise.all([
                actions.apiFetch("/companies"),
                actions.apiFetch("/employees"),
                actions.apiFetch("/admin/audit-logs"),
            ]);
            if (companiesRes.ok) setCompanies(companiesRes.data);
            setStats({
                totalCompanies: companiesRes.ok ? companiesRes.data.length : 0,
                totalEmployees: employeesRes.ok ? employeesRes.data.length : 0,
                totalLogs: logsRes.ok ? logsRes.data.length : 0,
            });
        };
        load();
    }, []);

    return (
        <div className="container py-4">
            <header className="mb-5">
                <h1 className="display-5 fw-bold text-dark">System Administration</h1>
                <p className="lead text-muted">Global oversight of the GateForce Platform.</p>
            </header>

            {/* STATS */}
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
                        <h2 className="display-4 fw-bold text-danger">{stats.totalLogs}</h2>
                        <Link to="/audit-logs" className="text-danger text-decoration-none small mt-3">Security review →</Link>
                    </div>
                </div>
            </div>

            {/* COMPANY LOGOS GRID */}
            <h5 className="fw-bold mb-3 text-secondary text-uppercase small">Client Companies</h5>
            <div className="row g-3 mb-5">
                {companies.map(c => (
                    <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={c.id}>
                        <div className="card border-0 shadow-sm text-center p-3 h-100">
                            {c.logo_url ? (
                                <img
                                    src={c.logo_url}
                                    alt={c.nombre_empresa}
                                    className="rounded-circle mx-auto mb-2 object-fit-cover"
                                    style={{ width: 56, height: 56 }}
                                />
                            ) : (
                                <div
                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mx-auto mb-2 fw-bold fs-5"
                                    style={{ width: 56, height: 56 }}
                                >
                                    {c.nombre_empresa.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="small fw-semibold text-dark mb-0 text-truncate" title={c.nombre_empresa}>
                                {c.nombre_empresa}
                            </p>
                            <p className="small text-muted mb-0">{c.region}</p>
                        </div>
                    </div>
                ))}
                {companies.length === 0 && (
                    <div className="col-12 text-muted small">No companies registered yet.</div>
                )}
            </div>

            {/* MASTER CONTROLS */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">Master Controls</h5>
                    <div className="d-grid gap-3 d-md-flex">
                        <Link to="/manage-companies" className="btn btn-outline-dark px-4">
                            <i className="bi bi-building me-2"></i>Company Directory
                        </Link>
                        <Link to="/audit-logs" className="btn btn-outline-danger px-4">
                            <i className="bi bi-shield-lock me-2"></i>Audit Log
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
