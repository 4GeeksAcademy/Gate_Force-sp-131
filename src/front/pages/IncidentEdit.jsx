import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function IncidentEdit() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        employee_id: "",
        type: "",
        status: "PENDING",
        category: "",
        admin_comment: ""
    });

    useEffect(() => {
        const getIncident = async () => {
            const res = await fetch(`${API_URL}incidents`);
            const data = await res.json();
            const incident = data.find(i => i.id === parseInt(id));
            if (incident) setFormData(incident);
        };
        getIncident();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}employees/${formData.employee_id}/incidents/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        navigate("/incidents");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Edit Incident</h1>
            <form onSubmit={handleSubmit}>
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
                    <button type="submit">Update</button>
                    <button type="button" onClick={() => navigate("/incidents")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}