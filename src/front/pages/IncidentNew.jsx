import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function IncidentNew() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: "",
        type: "",
        status: "PENDING",
        category: "",
        admin_comment: ""
    });

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

    const getEmployees = async () => {
        const res = await authFetch(`${API_URL}employees/simple`);
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
    };

    useEffect(() => {
        if (role !== "employee") getEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = role === "employee"
            ? `${API_URL}employee/incidents`
            : `${API_URL}employees/${formData.employee_id}/incidents`;
        await authFetch(url, {
            method: "POST",
            body: JSON.stringify(formData)
        });
        navigate("/incidents");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Create Incident</h1>
            <form onSubmit={handleSubmit}>
                {role !== "employee" && (
                    <select name="employee_id" value={formData.employee_id} onChange={handleChange} required>
                        <option value="">Select employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                            </option>
                        ))}
                    </select>
                )}
                <select name="type" value={formData.type} onChange={handleChange} required>
                    <option value="">Select type</option>
                    <option value="LABORAL">LABORAL</option>
                    <option value="PERSONAL">PERSONAL</option>
                </select>
                {role !== "employee" && (
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="PENDING">PENDING</option>
                        <option value="APROVE">APROVE</option>
                    </select>
                )}
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MID">MID</option>
                    <option value="LOW">LOW</option>
                </select>
                <textarea
                    name="admin_comment"
                    placeholder={role === "employee" ? "Describe la incidencia..." : "Admin comment"}
                    value={formData.admin_comment || ""}
                    onChange={handleChange}
                    rows={3}
                    style={{ width: "100%", marginTop: "10px" }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit">Create</button>
                    <button type="button" onClick={() => navigate("/incidents")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}