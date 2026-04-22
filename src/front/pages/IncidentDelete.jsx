import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IncidentDelete() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [employees, setEmployees] = useState([]);

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

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.id === employeeId);
        return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Delete Incidents</h1>
                <button
                    onClick={() => navigate("/incidents")}
                    style={{ padding: "8px 16px", cursor: "pointer" }}
                >
                    Back
                </button>
            </div>
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
                            onClick={() => deleteIncident(incident.employee_id, incident.id)}
                            style={{ marginLeft: "5px", backgroundColor: "#f44336", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}