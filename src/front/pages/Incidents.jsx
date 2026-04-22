import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Incidents() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const { id } = useParams();
    const [incidents, setIncidents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: "",
        status: "PENDING",
        category: "",
        admin_comment: ""
    });

    const getIncidents = async () => {
        const res = await fetch(`${API_URL}employees/${id}/incidents`);
        const data = await res.json();
        setIncidents(data);
    };

    useEffect(() => {
        getIncidents();
    }, []);

    const deleteIncident = async (incidentId) => {
        await fetch(`${API_URL}employees/${id}/incidents/${incidentId}`, {
            method: "DELETE"
        });
        getIncidents();
    };

    const startEdit = (incident) => {
        setEditingId(incident.id);
        setFormData(incident);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            type: "",
            status: "PENDING",
            category: "",
            admin_comment: ""
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${API_URL}employees/${id}/incidents/${editingId}`
            : `${API_URL}employees/${id}/incidents`;
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        cancelEdit();
        getIncidents();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Incidents</h1>
            <form onSubmit={handleSubmit}>
                <h3>{editingId ? "Edit Incident" : "Create Incident"}</h3>
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
                    <button type="submit">
                        {editingId ? "Update" : "Create"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            <ul>
                {incidents.map((incident) => (
                    <li key={incident.id} style={{
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        listStyle: "none",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px"
                    }}>
                        <div style={{ flexGrow: 1 }}>
                            <strong>{incident.type}</strong>
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                                <span>{incident.status}</span> |
                                <span style={{ margin: "0 5px", fontWeight: "bold" }}>{incident.category}</span> |
                                <span>{incident.admin_comment}</span> |
                                <span>{incident.created_at}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => startEdit(incident)}
                            style={{ marginLeft: "15px" }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteIncident(incident.id)}
                            style={{ marginLeft: "5px", color: "red" }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}