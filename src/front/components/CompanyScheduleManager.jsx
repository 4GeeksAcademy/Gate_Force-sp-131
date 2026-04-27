import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CompanyScheduleManager() {
    const { employee_id } = useParams();
    const navigate = useNavigate();
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        day: "Lunes",
        start_time: "09:00",
        end_time: "18:00"
    });

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const token = localStorage.getItem("token");

    const fetchHorarios = async () => {
        try {
            const res = await fetch(`${API_URL}employees/${employee_id}/horarios`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setHorarios(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => { fetchHorarios(); }, [employee_id]);

    const handleAddHorario = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}employees/${employee_id}/horarios`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchHorarios();
                alert("Horario añadido con éxito");
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (error) {
            console.error("Error al añadir:", error);
        }
    };

    const deleteHorario = async (id) => {
        if (!window.confirm("¿Eliminar este turno?")) return;
        try {
            const res = await fetch(`${API_URL}horarios/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchHorarios();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando horarios...</div>;

    return (
        <div className="container mt-4">
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate("/employees")}>
                <i className="fas fa-arrow-left me-2"></i>Volver a Empleados
            </button>

            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm p-4">
                        <h4 className="fw-bold mb-4">Asignar Turno</h4>
                        <form onSubmit={handleAddHorario}>
                            <div className="mb-3">
                                <label className="form-label">Día de la semana</label>
                                <select
                                    className="form-select"
                                    value={formData.day}
                                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                >
                                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Hora Entrada</label>
                                <input
                                    type="time" className="form-control"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Hora Salida</label>
                                <input
                                    type="time" className="form-control"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="fas fa-save me-2"></i>Guardar Horario
                            </button>
                        </form>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm p-4">
                        <h4 className="fw-bold mb-4">Horarios Registrados</h4>
                        <table className="table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Día</th>
                                    <th>Entrada</th>
                                    <th>Salida</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horarios.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center text-muted">No hay horarios asignados</td></tr>
                                ) : (
                                    horarios.map(h => (
                                        <tr key={h.id}>
                                            <td className="fw-bold">{h.day}</td>
                                            <td>{h.start_time}</td>
                                            <td>{h.end_time}</td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => deleteHorario(h.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}