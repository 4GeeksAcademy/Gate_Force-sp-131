import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CompanyRequestsHub = () => {
    const { actions } = useGlobalReducer();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        const { ok, data } = await actions.apiFetch("/company/all-requests");
        if (ok && Array.isArray(data)) {
            const sortedData = data.sort((a, b) => {
                if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
                if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
                return 0;
            });
            setRequests(sortedData);
        }
        setLoading(false);
    };

    useEffect(() => { loadRequests(); }, []);

    // --- NUEVA FUNCIÓN: Maneja los clics de Aprobar/Rechazar ---
    const handleUpdateStatus = async (id, isVacation, newStatus) => {
        // Hacemos la petición al backend
        const { ok } = await actions.apiFetch("/company/resolve-request", "PUT", {
            id: id,
            is_vacation: isVacation,
            status: newStatus
        });

        if (ok) {
            // Si el backend dice OK, actualizamos nuestra tabla visualmente al instante
            setRequests(prevRequests =>
                prevRequests.map(req =>
                    (req.id === id && req.is_vacation === isVacation)
                        ? { ...req, status: newStatus }
                        : req
                )
            );
        } else {
            alert("Hubo un error al actualizar el estado de la solicitud.");
        }
    };

    const getStatusBadge = (status) => {
        const s = status?.toUpperCase() || 'PENDING';
        if (s === 'APPROVED') return <span className="badge bg-success">Aprobado</span>;
        if (s === 'REJECTED') return <span className="badge bg-danger">Rechazado</span>;
        return <span className="badge bg-warning text-dark">Pendiente</span>;
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4"><i className="bi bi-inbox-fill me-2"></i>Bandeja de Solicitudes</h2>

            <div className="card border-0 shadow-sm overflow-hidden rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-dark text-white text-uppercase small">
                            <tr>
                                <th className="ps-4">Empleado</th>
                                <th>Tipo</th>
                                <th>Detalle / Fechas</th>
                                <th className="text-center">Estado</th>
                                <th className="text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? requests.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.employee_name}</div>
                                        <div className="text-muted small">ID: #{item.employee_id}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.is_vacation ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'}`}>
                                            {item.request_type}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="text-dark small fw-medium">
                                            {item.is_vacation
                                                ? `Del ${item.start} al ${item.end}`
                                                : (item.description || "Sin descripción")}
                                        </div>
                                    </td>
                                    <td className="text-center">{getStatusBadge(item.status)}</td>
                                    <td className="text-end pe-4">
                                        <div className="btn-group shadow-sm">
                                            {/* Conectamos el botón APROBAR */}
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, item.is_vacation, 'APPROVED')}
                                                className="btn btn-sm btn-outline-success"
                                                title="Aprobar"
                                                disabled={item.status === 'APPROVED'}
                                            >
                                                <i className="fa-solid fa-check"></i>
                                            </button>

                                            {/* Conectamos el botón RECHAZAR */}
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, item.is_vacation, 'REJECTED')}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Rechazar"
                                                disabled={item.status === 'REJECTED'}
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        No hay solicitudes registradas en la empresa.
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