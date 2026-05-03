import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const ACTION_ICON = {
    Created: { icon: "bi-person-plus-fill", color: "text-success" },
    Deactivated: { icon: "bi-person-dash-fill", color: "text-danger" },
    Updated: { icon: "bi-pencil-fill", color: "text-primary" },
};

const getActionStyle = (action = "") => {
    const key = Object.keys(ACTION_ICON).find(k => action.startsWith(k));
    return ACTION_ICON[key] ?? { icon: "bi-activity", color: "text-secondary" };
};

const AuditLog = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const load = async () => {
            const { ok, data } = await actions.apiFetch("/admin/audit-logs");
            if (ok) setLogs(data);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = logs.filter(l =>
        !search ||
        l.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.action?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container py-4">
            <button className="btn btn-link text-decoration-none p-0 mb-3" onClick={() => navigate("/admin-dashboard")}>
                <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
            </button>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h2 className="fw-bold mb-0">
                        <i className="bi bi-shield-lock-fill text-danger me-2"></i>Audit Log
                    </h2>
                    <p className="text-muted small mb-0">Company actions on employees — {logs.length} events</p>
                </div>
                <input
                    type="search"
                    className="form-control form-control-sm rounded-pill shadow-sm"
                    style={{ maxWidth: 240 }}
                    placeholder="Search company or action…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card border-0 shadow-sm text-center py-5 rounded-4">
                    <p className="text-muted mb-0">No audit events found.</p>
                </div>
            ) : (
                <div className="card border-0 shadow-sm overflow-hidden rounded-4">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="px-4">Company</th>
                                <th>Action</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(log => {
                                const { icon, color } = getActionStyle(log.action);
                                return (
                                    <tr key={log.id}>
                                        <td className="px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                {log.company_logo ? (
                                                    <img
                                                        src={log.company_logo}
                                                        alt={log.company_name}
                                                        className="rounded-circle object-fit-cover flex-shrink-0"
                                                        style={{ width: 32, height: 32 }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                                        style={{ width: 32, height: 32, fontSize: 13 }}
                                                    >
                                                        {log.company_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="fw-semibold text-dark">{log.company_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`d-flex align-items-center gap-2 small ${color}`}>
                                                <i className={`bi ${icon}`}></i>
                                                <span className="text-dark">{log.action}</span>
                                            </span>
                                        </td>
                                        <td className="text-muted small">{log.created_at}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLog;
