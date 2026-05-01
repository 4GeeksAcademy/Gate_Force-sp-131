import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function WorkRecordPage() {
    const [records, setRecords] = useState([]);
    const { store, actions } = useGlobalReducer();
    const [activeRecord, setActiveRecord] = useState(null);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        const userRole = store.role || role;
        if (!token || (userRole !== "employee" && userRole !== "manager" && userRole !== "admin")) {
            navigate("/login-employee");
        }
    }, [store.role, role, token, navigate]);

    const authFetch = (url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...options.headers
            }
        });
    };

    const fetchRecords = async () => {
        if (!token) return;
        try {
            const endpoint = role === "admin" ? `${API_URL}work-records` : `${API_URL}employee/work-records`;
            const res = await authFetch(endpoint);
            const data = await res.json();
            if (Array.isArray(data)) {
                setRecords(data);
                const open = data.find(r => !r.check_out);
                setActiveRecord(open || null);
            } else {
                setRecords([]);
                setActiveRecord(null);
            }
        } catch (error) {
            console.error("Error al obtener registros:", error);
            setRecords([]);
            setActiveRecord(null);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [role]);

    const handleCheckIn = async () => {
        const now = new Date().toISOString();
        const endpoint = role === "admin" ? `${API_URL}work-records` : `${API_URL}employee/work-records`;

        await authFetch(endpoint, {
            method: "POST",
            body: JSON.stringify({
                check_in: now,
                status: "pending"
            })
        });
        fetchRecords();
    };

    const handleCheckOut = async () => {
        const now = new Date().toISOString();
        const endpoint = role === "admin"
            ? `${API_URL}work-records/${activeRecord.id}`
            : `${API_URL}employee/work-records/${activeRecord.id}`;

        await authFetch(endpoint, {
            method: "PUT",
            body: JSON.stringify({
                check_out: now
            })
        });
        fetchRecords();
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este registro?")) {
            const res = await authFetch(`${API_URL}work-records/${id}`, { method: "DELETE" });
            if (res.ok) fetchRecords();
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold text-primary">
                    {role === "admin" ? "Registros de Fichaje" : "Control de Fichajes"}
                </h1>
            </div>

            {!token || (role !== "employee" && role !== "admin" && role !== "manager") ? (
                <div className="alert alert-warning shadow-sm">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Debes estar logueado para gestionar los fichajes.
                </div>
            ) : (
                <>
                    {role === "employee" && (
                        <div className="d-flex justify-content-center mb-4">
                            {!activeRecord ? (
                                <button
                                    className="btn btn-success btn-lg px-5"
                                    onClick={handleCheckIn}
                                >
                                    <i className="fas fa-sign-in-alt me-2"></i> Entrada
                                </button>
                            ) : (
                                <button
                                    className="btn btn-danger btn-lg px-5"
                                    onClick={handleCheckOut}
                                >
                                    <i className="fas fa-sign-out-alt me-2"></i> Salida
                                </button>
                            )}
                        </div>
                    )}

                    <div className="row">
                        {records.length === 0 ? (
                            <div className="col-12 text-center text-muted mt-5">
                                <p>No hay registros de actividad todavía.</p>
                            </div>
                        ) : (
                            records.map(r => (
                                <div key={r.id} className="col-md-6 col-lg-4 mb-3">
                                    <div className="card shadow-sm border-start border-4 border-primary">
                                        <div className="card-body">
                                            <div className="mb-2">
                                                <small className="text-muted d-block uppercase fw-bold">Entrada</small>
                                                <span>{formatDate(r.check_in)}</span>
                                            </div>
                                            <div className="mb-2">
                                                <small className="text-muted d-block uppercase fw-bold">Salida</small>
                                                <span>{formatDate(r.check_out)}</span>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="badge bg-info text-dark">{r.total_hours || "0"} hrs</span>
                                                <span className={`badge ${r.status === "completed" ? "bg-success" : "bg-warning text-dark"}`}>
                                                    {r.status}
                                                </span>
                                            </div>
                                            <div className="mt-3 d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary w-100"
                                                    onClick={() => navigate(`/work-records/edit/${r.id}`)}
                                                >
                                                    <i className="fas fa-edit me-1"></i> Editar
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger w-100"
                                                    onClick={() => handleDelete(r.id)}
                                                >
                                                    <i className="fas fa-trash-alt me-1"></i> Borrar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}