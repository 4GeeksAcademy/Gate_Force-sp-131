import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VacacionesNew() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ employee_id: "", vacations: "", taken_vacations: "", available_vacations: "" });

    const authFetch = (url, options = {}) => {
        const token = localStorage.getItem("token");
        return fetch(url, {
            ...options,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...options.headers }
        });
    };

    const getEmployees = async () => {
        const res = await authFetch(`${API_URL}employees`);
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
    };

    useEffect(() => { getEmployees(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const endpoint = role === "employee"
            ? `${API_URL}employee/vacaciones`
            : `${API_URL}employees/${formData.employee_id}/vacaciones`;

        await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        navigate("/vacaciones");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Create Vacacion</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <select name="employee_id" onChange={handleChange} required value={formData.employee_id}>
                    <option value="">Empleado</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                </select>
                <input name="vacations" placeholder="Total" type="number" value={formData.vacations} onChange={handleChange} required style={{ width: "100px" }} />
                <input name="taken_vacations" placeholder="Tomadas" type="number" value={formData.taken_vacations} onChange={handleChange} required style={{ width: "100px" }} />
                <input name="available_vacations" placeholder="Disponibles" type="number" value={formData.available_vacations} onChange={handleChange} required style={{ width: "100px" }} />
                <button type="submit" style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 15px", cursor: "pointer" }}>Create</button>
                <button type="button" onClick={() => navigate("/vacaciones")} style={{ padding: "5px 15px", cursor: "pointer" }}>Cancel</button>
            </form>
        </div>
    );
}