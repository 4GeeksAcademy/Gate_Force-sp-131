import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const emptyForm = { day: "Lunes", start_time: "", end_time: "" };

export default function Horarios() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const token = localStorage.getItem("token");

    const [schedules, setSchedules] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    // Función auxiliar para fetch con token
    const authFetch = (url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Enviamos el token para evitar el 401
                ...options.headers
            }
        });
    };

    const getEmployee = async () => {
        try {
            const res = await authFetch(`${API_URL}employees/${employeeId}`);
            if (res.ok) {
                const data = await res.json();
                setEmployee(data);
            }
        } catch (error) { console.error("Error cargando empleado", error); }
    };

    const getSchedules = async () => {
        try {
            const res = await authFetch(`${API_URL}employees/${employeeId}/horarios`);
            const data = await res.json();
            // 🛡️ Si la respuesta no es un array (ej. error 401), seteamos []
            setSchedules(Array.isArray(data) ? data : []);
        } catch (error) {
            setSchedules([]);
            console.error("Error cargando horarios", error);
        }
    };

    useEffect(() => {
        if (employeeId) {
            getEmployee();
            getSchedules();
        }
    }, [employeeId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${API_URL}horarios/${editingId}`
            : `${API_URL}employees/${employeeId}/horarios`;

        const res = await authFetch(url, {
            method,
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setEditingId(null);
            setFormData(emptyForm);
            getSchedules();
        } else {
            alert("Error al guardar el horario");
        }
    };

    const startEdit = (s) => {
        setEditingId(s.id);
        setFormData({ day: s.day, start_time: s.start_time, end_time: s.end_time });
    };

    const deleteSchedule = async (id) => {
        if (window.confirm("¿Eliminar este horario?")) {
            const res = await authFetch(`${API_URL}horarios/${id}`, { method: "DELETE" });
            if (res.ok) getSchedules();
        }
    };

    return (
        <div className="container mt-4">
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Volver
            </button>

            <div className="card shadow-sm p-4 mb-4">
                <h2 className="text-primary mb-4">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Horarios de {employee ? `${employee.first_name} ${employee.last_name}` : `Empleado #${employeeId}`}
                </h2>
                <form onSubmit={handleSubmit} className="row g-3 align-items-end bg-light p-3 rounded border">
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Día</label>
                        <select className="form-select" name="day" value={formData.day} onChange={handleChange} required>
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Entrada</label>
                        <input type="time" className="form-control" name="start_time" value={formData.start_time} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Salida</label>
                        <input type="time" className="form-control" name="end_time" value={formData.end_time} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3 d-flex gap-2">
                        <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-success'} w-100`}>
                            {editingId ? "Actualizar" : "Añadir"}
                        </button>
                        {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData(emptyForm); }}>Cancelar</button>}
                    </div>
                </form>
            </div>
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-hover align-middle bg-white">
                    <thead className="table-dark">
                        <tr>
                            <th>Día</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-4 text-muted">No hay horarios registrados.</td></tr>
                        ) : (
                            schedules.map((s) => (
                                <tr key={s.id}>
                                    <td className="fw-bold">{s.day}</td>
                                    <td>{s.start_time}</td>
                                    <td>{s.end_time}</td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(s)}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteSchedule(s.id)}>
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