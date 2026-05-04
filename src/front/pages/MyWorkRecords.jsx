import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import LocationCell from "../components/LocationCell";

const MyWorkRecords = () => {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { ok, data } = await actions.apiFetch("/work-records/mine");
            if (ok) setRecords(data);
            setLoading(false);
        };
        load();
    }, []);

    const totalHours = records
        .filter(r => r.total_hours)
        .reduce((sum, r) => sum + r.total_hours, 0);

    return (
        <div className="container py-4">
            <button
                className="btn btn-link text-decoration-none p-0 mb-3"
                onClick={() => navigate("/employee-dashboard")}
            >
                <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
            </button>

            <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
                <div>
                    <h2 className="fw-bold mb-0">My Work Records</h2>
                    <p className="text-muted small mb-0">
                        {store.user?.first_name} {store.user?.last_name} — {records.length} fichajes registrados
                    </p>
                </div>
                <div className="d-flex gap-3">
                    <div className="card border-0 shadow-sm px-4 py-2 text-center">
                        <div className="small text-muted fw-semibold text-uppercase">Sessions</div>
                        <div className="fw-bold fs-5">{records.length}</div>
                    </div>
                    <div className="card border-0 shadow-sm px-4 py-2 text-center">
                        <div className="small text-muted fw-semibold text-uppercase">Total Hours</div>
                        <div className="fw-bold fs-5">{totalHours.toFixed(1)}h</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                </div>
            ) : records.length === 0 ? (
                <div className="card border-0 shadow-sm text-center py-5 rounded-4">
                    <i className="bi bi-clock-history fs-1 text-muted mb-2 d-block"></i>
                    <p className="text-muted mb-0">No work records yet. Clock in to start tracking.</p>
                </div>
            ) : (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="px-4">Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(r => (
                                    <tr key={r.id}>
                                        <td className="px-4 fw-medium text-dark">
                                            {new Date(r.check_in).toLocaleDateString("es-ES", {
                                                weekday: "short", day: "2-digit", month: "short", year: "numeric"
                                            })}
                                        </td>
                                        <td className="text-success fw-bold">
                                            {new Date(r.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                        <td>
                                            {r.check_out ? (
                                                <span className="text-danger fw-bold">
                                                    {new Date(r.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            ) : (
                                                <span className="badge bg-success-subtle text-success fw-semibold">
                                                    <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.45rem" }}></i>
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {r.total_hours ? (
                                                <span className="badge bg-light text-dark border fw-semibold">
                                                    {r.total_hours.toFixed(2)}h
                                                </span>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${r.status?.toUpperCase() === "APPROVED" ? "bg-success" : "bg-warning text-dark"}`}>
                                                {r.status?.toUpperCase() || "PENDING"}
                                            </span>
                                        </td>
                                        <td style={{ minWidth: 200, maxWidth: 320 }}>
                                            <LocationCell location={r.location} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyWorkRecords;
