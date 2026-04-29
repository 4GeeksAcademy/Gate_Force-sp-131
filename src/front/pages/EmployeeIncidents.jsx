import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EmployeeIncidents() {
    // Obtenemos el ID del empleado de la URL (ej: /employee/3/incidents)
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const token = localStorage.getItem("token");

    const [incidents, setIncidents] = useState([]);
    const [formData, setFormData] = useState({
        type: "",
        category: "",
        description: ""
    });
    const statusConfig = {
        'PENDING': { label: 'Pendiente', color: 'bg-warning text-dark' },
        'APROVE': { label: 'Aprobado', color: 'bg-success' },
        'REJECTED': { label: 'Rechazado', color: 'bg-danger' }
    };

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

    const getMyIncidents = async () => {
        try {
            const res = await authFetch(`${API_URL}employees/${employeeId}/incidents`);
            if (res.ok) {
                const data = await res.json();
                setIncidents(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error cargando incidencias:", error);
        }
    };

    useEffect(() => {
        if (employeeId) {
            getMyIncidents();
        }
    }, [employeeId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await authFetch(`${API_URL}employees/${employeeId}/incidents`, {
            method: "POST",
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setFormData({ type: "", category: "" });
            getMyIncidents();
            alert("Incidencia reportada correctamente a la empresa.");
        } else {
            alert("Hubo un error al enviar la incidencia.");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><i className="fas fa-ticket-alt me-2"></i>Mis Incidencias</h2>
            </div>

            {/* Formulario de Reporte para el Empleado */}
            <div className="card shadow-sm p-4 mb-4 border-primary border-top border-3">
                <h4 className="mb-3">Reportar un problema</h4>
                <form onSubmit={handleSubmit} className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Tipo de Incidencia</label>
                        <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
                            <option value="">Seleccionar...</option>
                            <option value="LABORAL">Laboral</option>
                            <option value="PERSONAL">Personal</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Nivel de Prioridad</label>
                        <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                            <option value="">Seleccionar...</option>
                            <option value="HIGH">Alta</option>
                            <option value="MID">Media</option>
                            <option value="LOW">Baja</option>
                        </select>
                    </div>
                    {/* NUEVO: Campo de descripción */}
                    <div className="col-md-12">
                        <label className="form-label fw-bold">Descripción del problema</label>
                        <textarea
                            className="form-control"
                            name="description"
                            rows="3"
                            placeholder="Explica brevemente tu situación..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <div className="col-md-4 mt-3">
                        <button type="submit" className="btn btn-primary w-100">
                            <i className="fas fa-paper-plane me-2"></i>Enviar Reporte
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla de Seguimiento */}
            <div className="card shadow-sm p-4">
                <h4 className="mb-3">Historial y Estado</h4>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Respuesta de Empresa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">No has reportado ninguna incidencia.</td></tr>
                            ) : (
                                incidents.map((incident) => (
                                    <tr key={incident.id}>
                                        <td className="small">{new Date(incident.created_at).toLocaleDateString()}</td>
                                        <td>{incident.type}</td>
                                        <td>
                                            <span className={`badge ${incident.category === 'HIGH' ? 'bg-danger' : incident.category === 'MID' ? 'bg-warning text-dark' : 'bg-info'}`}>
                                                {incident.category}
                                            </span>
                                        </td>
                                        <td>
                                            {(() => {
                                                const currentStatus = statusConfig[incident.status] || { label: incident.status, color: 'bg-secondary' };
                                                return (
                                                    <span className={`badge ${currentStatus.color}`}>
                                                        {currentStatus.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="text-muted fst-italic">
                                            {incident.admin_comment ? `"${incident.admin_comment}"` : "Sin respuesta aún..."}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}