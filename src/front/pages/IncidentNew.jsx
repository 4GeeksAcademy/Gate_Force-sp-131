import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function IncidentNew() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: "",
        type: "",
        status: "PENDING",
        category: "",
        admin_comment: ""
    });

    const getEmployees = async () => {
        const res = await fetch(`${API_URL}employees/simple`);
        const data = await res.json();
        setEmployees(data);
    };

    useEffect(() => {
        getEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}employees/${formData.employee_id}/incidents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        navigate("/incidents");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Create Incident</h1>
            <form onSubmit={handleSubmit}>
                <select name="employee_id" value={formData.employee_id} onChange={handleChange} required>
                    <option value="">Select employee</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                        </option>
                    ))}
                </select>
                <select name="type" value={formData.type} onChange={handleChange} required>
                    <option value="">Select type</option>
                    <option value="LABORAL">LABORAL</option>
                    <option value="PERSONAL">PERSONAL</option>
                </select>
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="PENDING">PENDING</option>
                    <option value="APROVE">APROVE</option>
                </select>
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MID">MID</option>
                    <option value="LOW">LOW</option>
                </select>
                <input
                    name="admin_comment"
                    placeholder="Admin comment"
                    value={formData.admin_comment || ""}
                    onChange={handleChange}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit">Create</button>
                    <button type="button" onClick={() => navigate("/incidents")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}