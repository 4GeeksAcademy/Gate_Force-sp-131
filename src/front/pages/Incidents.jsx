import { useEffect, useState } from "react";

export default function Incidents() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const [incidents, setIncidents] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: "",
        type: "",
        status: "PENDING",
        category: "",
        admin_comment: ""
    });

    const getIncidents = async () => {
        const res = await fetch(`${API_URL}incidents`);
        const data = await res.json();
        setIncidents(data);
    };

    const getEmployees = async () => {
        const res = await fetch(`${API_URL}employees/simple`);
        const data = await res.json();
        setEmployees(data);
    };

    useEffect(() => {
        getIncidents();
        getEmployees();
    }, []);

    const deleteIncident = async (employeeId, incidentId) => {
        await fetch(`${API_URL}employees/${employeeId}/incidents/${incidentId}`, {
            method: "DELETE"
        });
        getIncidents();
    };

    const startEdit = (incident) => {
        setEditingId(incident.id);
        setFormData(incident);
        setShowForm(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setShowForm(false);
        setFormData({
            employee_id: "",
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
            ? `${API_URL}employees/${formData.employee_id}/incidents/${editingId}`
            : `${API_URL}employees/${formData.employee_id}/incidents`;
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        cancelEdit();
        getIncidents();
    };

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.id === employeeId);
        return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Incidents</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{ backgroundColor: "#FF9800", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                    >
                        Crear
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <h3>{editingId ? "Edit Incident" : "Create Incident"}</h3>
                    {!editingId && (
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
                        <button type="button" onClick={cancelEdit}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

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
                            <strong>{getEmployeeName(incident.employee_id)}</strong>
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                                <span>{incident.type}</span> |
                                <span style={{ margin: "0 5px", fontWeight: "bold" }}>{incident.status}</span> |
                                <span>{incident.category}</span> |
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
                            onClick={() => deleteIncident(incident.employee_id, incident.id)}
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