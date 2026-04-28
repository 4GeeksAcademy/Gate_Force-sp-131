import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const emptyForm = {
    employee_id: "",
    type: "",
    status: "PENDING",
    category: "",
    admin_comment: ""
};

export default function CompanyIncidentsManager() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [incidents, setIncidents] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
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

    const fetchData = async () => {
        try {
            const [resIncidents, resEmployees] = await Promise.all([
                authFetch(`${API_URL}incidents`),
                authFetch(`${API_URL}employees/simple`)
            ]);

            if (resIncidents.ok) setIncidents(await resIncidents.json());
            if (resEmployees.ok) setEmployees(await resEmployees.json());
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${API_URL}employees/${formData.employee_id}/incidents/${editingId}`
            : `${API_URL}employees/${formData.employee_id}/incidents`;

        const res = await authFetch(url, {
            method,
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setFormData(emptyForm);
            setEditingId(null);
            fetchData();
        } else {
            alert("Error al guardar la incidencia");
        }
    };

    const startEdit = (incident) => {
        setEditingId(incident.id);
        setFormData({
            employee_id: incident.employee_id,
            type: incident.type,
            status: incident.status,
            category: incident.category,
            admin_comment: incident.admin_comment || ""
        });
    };

    const deleteIncident = async (employeeId, incidentId) => {
        if (window.confirm("¿Estás seguro de eliminar esta incidencia?")) {
            const res = await authFetch(`${API_URL}employees/${employeeId}/incidents/${incidentId}`, {
                method: "DELETE"
            });
            if (res.ok) fetchData();
        }
    };

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.id === employeeId);
        return emp ? `${emp.first_name} ${emp.last_name}` : `Emp #${employeeId}`;
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><i className="fas fa-exclamation-triangle me-2"></i>Gestión de Incidencias</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left me-2"></i>Volver
                </button>
            </div>

            <div className="card shadow-sm p-4 mb-4">
                <h4 className="mb-3">{editingId ? "Editar Incidencia" : "Nueva Incidencia"}</h4>
                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Empleado</label>
                        <select className="form-select" name="employee_id" value={formData.employee_id} onChange={handleChange} required disabled={editingId !== null}>
                            <option value="">Selecciona un empleado</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Tipo</label>
                        <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
                            <option value="">Seleccionar...</option>
                            <option value="LABORAL">LABORAL</option>
                            <option value="PERSONAL">PERSONAL</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Categoría</label>
                        <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                            <option value="">Seleccionar...</option>
                            <option value="HIGH">ALTA</option>
                            <option value="MID">MEDIA</option>
                            <option value="LOW">BAJA</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Estado</label>
                        <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                            <option value="PENDING">PENDIENTE</option>
                            <option value="APROVE">APROBADO</option>
                            <option value="REJECTED">RECHAZADO</option>
                        </select>
                    </div>
                    <div className="col-md-12">
                        <label className="form-label fw-bold">Comentario Admin</label>
                        <input type="text" className="form-control" name="admin_comment" placeholder="Añadir un comentario..." value={formData.admin_comment} onChange={handleChange} />
                    </div>
                    <div className="col-md-12 d-flex gap-2 mt-3">
                        <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-success'}`}>
                            <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                            {editingId ? "Actualizar Incidencia" : "Crear Incidencia"}
                        </button>
                        {editingId && (
                            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData(emptyForm); }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de Incidencias */}
            <div className="table-responsive shadow-sm rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Empleado</th>
                            <th>Tipo / Categoría</th>
                            <th>Estado</th>
                            <th>Comentario</th>
                            <th>Fecha</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4 text-muted">No hay incidencias registradas.</td></tr>
                        ) : (
                            incidents.map((incident) => (
                                <tr key={incident.id}>
                                    <td className="fw-bold">{getEmployeeName(incident.employee_id)}</td>
                                    <td>
                                        <div className="mb-1">
                                            <span className="badge bg-secondary me-1">{incident.type}</span>
                                            <span className={`badge ${incident.category === 'HIGH' ? 'bg-danger' : incident.category === 'MID' ? 'bg-warning text-dark' : 'bg-info'}`}>{incident.category}</span>
                                        </div>
                                        <small className="text-muted d-block" style={{ maxWidth: "250px", whiteSpace: "normal" }}>
                                            <strong>Detalle:</strong> {incident.description}
                                        </small>
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
                                    <td className="text-muted small">{incident.admin_comment || "-"}</td>
                                    <td className="small">{new Date(incident.created_at).toLocaleDateString()}</td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(incident)} title="Editar">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteIncident(incident.employee_id, incident.id)} title="Eliminar">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}