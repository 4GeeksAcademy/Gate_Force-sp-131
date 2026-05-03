import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CompanyRequestsHub = () => {
    const { actions } = useGlobalReducer();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

    const loadRequests = async () => {
        setLoading(true);
        // 1. Llamamos a la nueva ruta que nos trae el objeto { vacations: [], incidents: [] }
        const { ok, data } = await actions.apiFetch("/approvals/pending");

        if (ok && data) {
            // 2. Unificamos ambos arrays en uno solo para la tabla
            const mergedRequests = [
                ...(data.vacations || []).map(v => ({ ...v, is_vacation: true, request_type: "Vacaciones" })),
                ...(data.incidents || []).map(i => ({ ...i, is_vacation: false, request_type: "Incidencia" }))
            ];

            // 3. Ordenamos: Pendientes arriba
            const sortedData = mergedRequests.sort((a, b) => {
                const statusA = (a.status || 'PENDING').toUpperCase();
                const statusB = (b.status || 'PENDING').toUpperCase();
                if (statusA === 'PENDING' && statusB !== 'PENDING') return -1;
                if (statusA !== 'PENDING' && statusB === 'PENDING') return 1;
                return 0;
            });

            setRequests(sortedData);
        } else {
            setAlertMsg({ type: "danger", text: "No se pudieron cargar las solicitudes." });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // --- NUEVA FUNCIÓN: Conectada al nuevo backend ---
    const handleUpdateStatus = async (id, isVacation, newStatus) => {
        // Determinamos el tipo para la URL de la API
        const typePath = isVacation ? "vacation" : "incident";

        // Hacemos el PUT a la ruta /approvals/<type>/<id>
        const { ok } = await actions.apiFetch(`/approvals/${typePath}/${id}`, "PUT", {
            status: newStatus
        });

        if (ok) {
            // Actualizamos la interfaz al instante
            setRequests(prevRequests =>
                prevRequests.map(req =>
                    (req.id === id && req.is_vacation === isVacation)
                        ? { ...req, status: newStatus }
                        : req
                )
            );
            setAlertMsg({ type: "success", text: `Solicitud ${newStatus === 'APPROVED' ? 'Aprobada' : 'Rechazada'} con éxito.` });

            // Ocultar la alerta después de 3 segundos
            setTimeout(() => setAlertMsg({ type: "", text: "" }), 3000);
        } else {
            setAlertMsg({ type: "danger", text: "Hubo un error al actualizar el estado en el servidor." });
        }
    };

    const getStatusBadge = (status) => {
        const s = status?.toUpperCase() || 'PENDING';
        if (s === 'APPROVED') return <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm"><i className="bi bi-check-circle me-1"></i> Aprobado</span>;
        if (s === 'REJECTED') return <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm"><i className="bi bi-x-circle me-1"></i> Rechazado</span>;
        return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm"><i className="bi bi-clock-history me-1"></i> Pendiente</span>;
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1"><i className="bi bi-inbox-fill text-primary me-2"></i>Bandeja de Solicitudes</h2>
                    <p className="text-muted mb-0">Gestiona las peticiones de vacaciones e incidencias del personal.</p>
                </div>
                <button className="btn btn-outline-secondary rounded-pill shadow-sm" onClick={loadRequests}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
                </button>
            </div>

            {/* Sistema de Alertas */}
            {alertMsg.text && (
                <div className={`alert alert-${alertMsg.type} shadow-sm border-0 d-flex align-items-center`} role="alert">
                    <i className={`bi bi-${alertMsg.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2 fs-5`}></i>
                    <div className="fw-medium">{alertMsg.text}</div>
                </div>
            )}

            <div className="card border-0 shadow-lg overflow-hidden rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-dark text-white text-uppercase small">
                            <tr>
                                <th className="ps-4 py-3 border-0">Empleado</th>
                                <th className="py-3 border-0">Tipo</th>
                                <th className="py-3 border-0">Detalles</th>
                                <th className="text-center py-3 border-0">Estado</th>
                                <th className="text-end pe-4 py-3 border-0">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {requests.length > 0 ? requests.map((item, idx) => (
                                <tr key={idx} className={item.status !== 'PENDING' ? "bg-light opacity-75" : ""}>
                                    <td className="ps-4 py-3">
                                        <div className="fw-bold text-dark">{item.employee_name || "Nombre no disponible"}</div>
                                        <div className="text-muted small">ID: #{item.employee_id}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.is_vacation ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'} rounded-pill px-3`}>
                                            {item.request_type}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="text-dark small fw-medium">
                                            {item.is_vacation
                                                ? <><i className="bi bi-calendar-range me-1 text-muted"></i> Del {item.start_date || item.start} al {item.end_date || item.end}</>
                                                : <><i className="bi bi-chat-left-text me-1 text-muted"></i> {item.description || "Sin descripción"}</>}
                                        </div>
                                    </td>
                                    <td className="text-center">{getStatusBadge(item.status)}</td>
                                    <td className="text-end pe-4">
                                        <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, item.is_vacation, 'APPROVED')}
                                                className={`btn btn-sm ${item.status === 'APPROVED' ? 'btn-success' : 'btn-outline-success'} px-3`}
                                                title="Aprobar"
                                                disabled={item.status !== 'PENDING'}
                                            >
                                                <i className="fa-solid fa-check"></i>
                                            </button>

                                            <button
                                                onClick={() => handleUpdateStatus(item.id, item.is_vacation, 'REJECTED')}
                                                className={`btn btn-sm ${item.status === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'} px-3`}
                                                title="Rechazar"
                                                disabled={item.status !== 'PENDING'}
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                                            <h5 className="fw-bold text-dark">Bandeja Vacía</h5>
                                            <p>No hay solicitudes pendientes en este momento.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompanyRequestsHub;