import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Vacaciones() {
    // Limpiamos la URL para asegurar que termine en /api/ igual que en EmployeesPage
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const [vacaciones, setVacaciones] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Tu función reutilizable para peticiones con Token
    const authFetch = (url, options = {}) => {
        const token = localStorage.getItem("token");
        return fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...options.headers
            }
        });
    };

    const getVacaciones = async () => {
        try {
            const res = await authFetch(`${API_URL}vacaciones`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setVacaciones(data);
            } else {
                console.error("No se pudieron cargar las vacaciones:", data);
                setVacaciones([]);
            }
        } catch (error) {
            console.error("Error en getVacaciones:", error);
        }
    };

    const getEmployees = async () => {
        try {
            const res = await authFetch(`${API_URL}employees`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                console.error("La API de empleados no devolvió un array:", data);
                setEmployees([]);
            }
        } catch (error) {
            console.error("Error en getEmployees:", error);
            setEmployees([]);
        }
    };

    useEffect(() => {
        getVacaciones();
        getEmployees();
    }, []);

    const getEmployeeName = (employeeId) => {
        if (!Array.isArray(employees) || employees.length === 0) return `ID: ${employeeId}`;

        const emp = employees.find(e => e.id === employeeId);
        return emp ? `${emp.first_name} ${emp.last_name}` : `ID: ${employeeId}`;
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Vacaciones</h1>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => navigate("/vacaciones/new")}
                        style={{ backgroundColor: "#9C27B0", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                    >
                        Crear
                    </button>
                    <button
                        onClick={() => navigate("/vacaciones/delete")}
                        style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            <ul style={{ padding: 0 }}>
                {vacaciones.length === 0 ? (
                    <p>No hay registros de vacaciones.</p>
                ) : (
                    vacaciones.map((vacacion) => (
                        <li key={vacacion.id} style={{
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            listStyle: "none",
                            borderBottom: "1px solid #eee",
                            paddingBottom: "5px"
                        }}>
                            <div style={{ flexGrow: 1 }}>
                                <strong>{getEmployeeName(vacacion.employee_id)}</strong>
                                <div style={{ fontSize: "0.9em", color: "#666" }}>
                                    <span>Total: {vacacion.vacations}</span> |
                                    <span style={{ margin: "0 5px" }}>Taken: {vacacion.taken_vacations}</span> |
                                    <span style={{ fontWeight: "bold" }}>Available: {vacacion.available_vacations}</span> |
                                    <span>{vacacion.created_at}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/vacaciones/edit/${vacacion.id}`)}
                                style={{ marginLeft: "15px" }}
                            >
                                Edit
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}