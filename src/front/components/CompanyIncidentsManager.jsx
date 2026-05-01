import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Incidents() {
    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [employees, setEmployees] = useState([]);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

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

    const getIncidents = async () => {
        try {
            const endpoint =
                role === "employee"
                    ? `${API_URL}employee/incidents`
                    : `${API_URL}incidents`;

            const res = await authFetch(endpoint);
            const data = await res.json();
            setIncidents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando incidencias:", error);
            setIncidents([]);
        }
    };

    const getEmployees = async () => {
        try {
            const res = await authFetch(`${API_URL}employees/simple`);
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando empleados:", error);
            setEmployees([]);
        }
    };

    useEffect(() => {
        if (!token || !["employee", "company", "admin", "manager"].includes(role)) {
            return;
        }

        getIncidents();

        if (role !== "employee") {
            getEmployees();
        }
    }, [token, role]);

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.id === employeeId);
        return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
    };

    if (!token || !["employee", "company", "admin", "manager"].includes(role)) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Debes estar logueado para ver esta vista de incidencias.
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Incidents</h1>
                <div style={{ display: "flex", gap: "10px" }}>
                    {role === "employee" && (
                        <button
                            onClick={() => navigate("/incidents/new")}
                            style={{ backgroundColor: "#FF9800", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                        >
                            Nueva Incidencia
                        </button>
                    )}
                    {role !== "employee" && (
                        <>
                            <button
                                onClick={() => navigate("/incidents/new")}
                                style={{ backgroundColor: "#FF9800", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                            >
                                Crear
                            </button>
                            <button
                                onClick={() => navigate("/incidents/delete")}
                                style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                            >
                                Eliminar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <ul>
                {incidents.map((incident) => (
                    <li
                        key={incident.id}
                        style={{
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            listStyle: "none",
                            borderBottom: "1px solid #eee",
                            paddingBottom: "5px"
                        }}
                    >
                        <div style={{ flexGrow: 1 }}>
                            {role !== "employee" && (
                                <strong>{getEmployeeName(incident.employee_id)}</strong>
                            )}
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                                <span>{incident.type}</span> |
                                <span style={{ margin: "0 5px", fontWeight: "bold" }}>{incident.status}</span> |
                                <span>{incident.category}</span> |
                                <span>{incident.admin_comment}</span> |
                                <span>{incident.created_at}</span>
                            </div>
                        </div>
                        {role !== "employee" && (
                            <button
                                onClick={() => navigate(`/incidents/edit/${incident.id}`)}
                                style={{ marginLeft: "15px" }}
                            >
                                Edit
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
