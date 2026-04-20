import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const emptyForm = { day: "Lunes", start_time: "", end_time: "" };

export default function Horarios() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";

    const [schedules, setSchedules] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const getEmployee = async () => {
        const res = await fetch(`${API_URL}employees/${employeeId}`);
        const data = await res.json();
        setEmployee(data);
    };

    const getSchedules = async () => {
        const res = await fetch(`${API_URL}employees/${employeeId}/horarios`);
        const data = await res.json();
        setSchedules(data);
    };

    useEffect(() => {
        getEmployee();
        getSchedules();
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

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        setEditingId(null);
        setFormData(emptyForm);
        getSchedules();
    };

    const startEdit = (s) => {
        setEditingId(s.id);
        setFormData({ day: s.day, start_time: s.start_time, end_time: s.end_time });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData(emptyForm);
    };

    const deleteSchedule = async (id) => {
        await fetch(`${API_URL}horarios/${id}`, { method: "DELETE" });
        getSchedules();
    };

    return (
        <div style={{ padding: "20px" }}>
            <button onClick={() => navigate(-1)}>← Volver</button>

            <h1>
                Horarios — {employee ? `${employee.first_name} ${employee.last_name}` : `#${employeeId}`}
            </h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <select name="day" value={formData.day} onChange={handleChange} required>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
                <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required />

                <button type="submit">{editingId ? "Actualizar" : "Añadir"}</button>
                {editingId && <button type="button" onClick={cancelEdit}>Cancelar</button>}
            </form>

            {schedules.length === 0 ? (
                <p style={{ color: "#999" }}>No hay horarios registrados.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                            <th style={{ padding: "8px" }}>Día</th>
                            <th style={{ padding: "8px" }}>Entrada</th>
                            <th style={{ padding: "8px" }}>Salida</th>
                            <th style={{ padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((s) => (
                            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "8px" }}>{s.day}</td>
                                <td style={{ padding: "8px" }}>{s.start_time}</td>
                                <td style={{ padding: "8px" }}>{s.end_time}</td>
                                <td style={{ padding: "8px", display: "flex", gap: "5px" }}>
                                    <button onClick={() => startEdit(s)}>Editar</button>
                                    <button onClick={() => deleteSchedule(s.id)} style={{ color: "red" }}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}