import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VacacionesNew() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: "",
        vacations: "",
        taken_vacations: "",
        available_vacations: "",
        start_date: "",
        end_date: "",
        days_requested: "",
        status: "pending"
    });

    const authFetch = (url, options = {}) => {
        const token = localStorage.getItem("token");
        return fetch(url, {
            ...options,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...options.headers }
        });
    };

    const getEmployees = async () => {
        const res = await authFetch(`${API_URL}employees/simple`);
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
    };

    useEffect(() => {
        if (role !== "employee") getEmployees();
    }, []);

    const handleChange = (e) => {
        const updated = { ...formData, [e.target.name]: e.target.value };
        if (e.target.name === "start_date" || e.target.name === "end_date") {
            const start = new Date(updated.start_date);
            const end = new Date(updated.end_date);
            if (updated.start_date && updated.end_date && end >= start) {
                updated.days_requested = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
            } else {
                updated.days_requested = "";
            }
        }
        setFormData(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const endpoint = role === "employee"
            ? `${API_URL}employee/vacaciones`
            : `${API_URL}employees/${formData.employee_id}/vacaciones`;
        await authFetch(endpoint, {
            method: "POST",
            body: JSON.stringify(formData)
        });
        navigate("/vacaciones");
    };

    if (role === "employee") {
        return (
            <div className="container mt-4" style={{ maxWidth: "500px" }}>
                <h1 className="fw-bold mb-4">Solicitar Vacaciones</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Fecha de inicio</label>
                        <input type="date" name="start_date" className="form-control" value={formData.start_date} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Fecha de fin</label>
                        <input type="date" name="end_date" className="form-control" value={formData.end_date} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Dias solicitados</label>
                        <input type="number" className="form-control" value={formData.days_requested} readOnly />
                    </div>
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary w-100" disabled={!formData.days_requested}>Solicitar</button>
                        <button type="button" className="btn btn-secondary w-100" onClick={() => navigate("/vacaciones")}>Cancelar</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Create Vacacion</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <select name="employee_id" onChange={handleChange} required value={formData.employee_id}>
                    <option value="">Empleado</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                </select>
                <input name="vacations" placeholder="Total" type="number" value={formData.vacations} onChange={handleChange} style={{ width: "100px" }} />
                <input name="taken_vacations" placeholder="Tomadas" type="number" value={formData.taken_vacations} onChange={handleChange} style={{ width: "100px" }} />
                <input name="available_vacations" placeholder="Disponibles" type="number" value={formData.available_vacations} onChange={handleChange} style={{ width: "100px" }} />
                <input name="start_date" placeholder="Inicio" type="date" value={formData.start_date} onChange={handleChange} />
                <input name="end_date" placeholder="Fin" type="date" value={formData.end_date} onChange={handleChange} />
                <input name="days_requested" placeholder="Dias" type="number" value={formData.days_requested} onChange={handleChange} style={{ width: "80px" }} />
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button type="submit" style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 15px", cursor: "pointer" }}>Create</button>
                <button type="button" onClick={() => navigate("/vacaciones")} style={{ padding: "5px 15px", cursor: "pointer" }}>Cancel</button>
            </form>
        </div>
    );
}