import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EmployeeRequestHub = () => {
    const { actions } = useGlobalReducer();
    const [activeTab, setActiveTab] = useState("incident");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    // IMPORTANTE: Valores iniciales en minúsculas para cumplir con el ENUM de la DB
    const [incident, setIncident] = useState({ type: "PERSONAL", description: "" });
    const [vacation, setVacation] = useState({ start_date: "", end_date: "" });

    const loadHistory = async () => {
        const { ok, data } = await actions.apiFetch("/employee/my-requests");
        if (ok) setHistory(data);
    };

    useEffect(() => { loadHistory(); }, []);

    const handleAction = async (type) => {
        setLoading(true);
        const endpoint = type === "incident" ? "/incidents/request" : "/vacations/request";
        const payload = type === "incident" ? incident : vacation;

        const { ok, data } = await actions.apiFetch(endpoint, "POST", payload);

        if (ok) {
            alert(type === "incident" ? "Incidencia reportada" : "Vacaciones solicitadas");
            loadHistory();
            // Resetear formularios con valores correctos (minúsculas)
            type === "incident"
                ? setIncident({ type: "PERSONAL", description: "" })
                : setVacation({ start_date: "", end_date: "" });
        } else {
            alert("Error: " + (data?.msg || "No se pudo procesar la solicitud"));
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase() || 'pending';
        const config = {
            pending: { color: 'warning', text: 'Pendiente' },
            approved: { color: 'success', text: 'Aprobado' },
            rejected: { color: 'danger', text: 'Rechazado' }
        };
        const { color, text } = config[s] || config.pending;
        return (
            <span className={`badge bg-${color}-subtle text-${color} border border-${color}-subtle px-3`}>
                {text}
            </span>
        );
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center g-4">
                {/* FORMULARIO */}
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header bg-dark p-0 border-0">
                            <div className="d-flex text-center">
                                <button
                                    className={`flex-fill py-3 border-0 bg-transparent fw-bold ${activeTab === 'incident' ? 'text-primary border-bottom border-primary border-3' : 'text-white-50 opacity-50'}`}
                                    onClick={() => setActiveTab("incident")}
                                >
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>Incidencia
                                </button>
                                <button
                                    className={`flex-fill py-3 border-0 bg-transparent fw-bold ${activeTab === 'vacation' ? 'text-success border-bottom border-success border-3' : 'text-white-50 opacity-50'}`}
                                    onClick={() => setActiveTab("vacation")}
                                >
                                    <i className="bi bi-calendar-heart-fill me-2"></i>Vacaciones
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            {activeTab === "incident" ? (
                                <form onSubmit={(e) => { e.preventDefault(); handleAction("incident"); }}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Motivo</label>
                                        <select
                                            className="form-select border-0 bg-light"
                                            value={incident.type}
                                            onChange={e => setIncident({ ...incident, type: e.target.value })}
                                        >
                                            <option value="PERSONAL">Asunto Personal</option>
                                            <option value="LABORAL">Problema Laboral</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Descripción</label>
                                        <textarea
                                            className="form-control border-0 bg-light"
                                            rows="3"
                                            value={incident.description}
                                            onChange={e => setIncident({ ...incident, description: e.target.value })}
                                            placeholder="Explique brevemente lo sucedido..."
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" disabled={loading} className="btn btn-primary w-100 fw-bold shadow-sm">
                                        {loading ? "Enviando..." : "Enviar Reporte"}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); handleAction("vacation"); }}>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Inicio</label>
                                            <input type="date" className="form-control border-0 bg-light" value={vacation.start_date} onChange={e => setVacation({ ...vacation, start_date: e.target.value })} required />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Fin</label>
                                            <input type="date" className="form-control border-0 bg-light" value={vacation.end_date} onChange={e => setVacation({ ...vacation, end_date: e.target.value })} required />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="btn btn-success w-100 fw-bold shadow-sm">
                                        {loading ? "Procesando..." : "Solicitar Vacaciones"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* HISTORIAL */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Estatus de mis Solicitudes</h5>
                                <button className="btn btn-link btn-sm text-decoration-none p-0" onClick={loadHistory}>
                                    <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="small text-muted text-uppercase">
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Detalle / Fechas</th>
                                            <th className="text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {history.length > 0 ? history.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <span className={`badge ${item.start ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'} small`}>
                                                        {item.start ? 'VACACIONES' : (item.type || 'INCIDENCIA')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-dark small fw-medium">
                                                        {/* Lógica mejorada para mostrar el detalle correcto */}
                                                        {item.start
                                                            ? `Del ${item.start} al ${item.end}`
                                                            : (item.description || "Sin descripción")}
                                                    </div>
                                                </td>
                                                <td className="text-center">{getStatusBadge(item.status)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="text-center py-5 text-muted small">
                                                    No tienes solicitudes registradas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeRequestHub;