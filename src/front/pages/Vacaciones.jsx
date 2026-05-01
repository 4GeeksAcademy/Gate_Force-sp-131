import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VacacionesEmployee() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const [misVacaciones, setMisVacaciones] = useState([]);
    const token = localStorage.getItem("token");


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

    const getMisVacaciones = async () => {
        try {
            const res = await authFetch(`${API_URL}employee/vacaciones`);
            const data = await res.json();
            if (Array.isArray(data)) setMisVacaciones(data);
        } catch (error) {
            console.error("Error obteniendo mis vacaciones:", error);
        }
    };

    useEffect(() => {
        getMisVacaciones();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>Mis Vacaciones</h1>
                <button
                    onClick={() => navigate("/vacaciones/new")}
                    style={{ backgroundColor: "#9C27B0", color: "white", border: "none", padding: "8px 16px", cursor: "pointer", borderRadius: "4px" }}
                >
                    + Solicitar Días
                </button>
            </div>

            <ul style={{ padding: 0 }}>
                {misVacaciones.length === 0 ? (
                    <p>No tienes solicitudes de vacaciones aún.</p>
                ) : (
                    misVacaciones.map((vacacion) => (
                        <li key={vacacion.id} style={{
                            marginBottom: "10px", padding: "10px",
                            border: "1px solid #ddd", borderRadius: "5px", listStyle: "none"
                        }}>
                            <div>
                                <strong>Estado: </strong>
                                <span style={{
                                    color: vacacion.status === "approved" ? "green" : vacacion.status === "rejected" ? "red" : "orange",
                                    textTransform: "uppercase", fontWeight: "bold"
                                }}>
                                    {vacacion.status || "PENDING"}
                                </span>
                            </div>
                            <div style={{ fontSize: "0.9em", color: "#666", marginTop: "5px" }}>
                                <span>Total Días: {vacacion.vacations}</span> |
                                <span style={{ margin: "0 5px" }}>Tomados: {vacacion.taken_vacations}</span> |
                                <span>Disponibles: {vacacion.available_vacations}</span>
                            </div>
                            <div style={{ fontSize: "0.85em", color: "#888", marginTop: "5px" }}>
                                Fechas solicitadas: {vacacion.start_date ? vacacion.start_date.split("T")[0] : 'N/A'} - {vacacion.end_date ? vacacion.end_date.split("T")[0] : 'N/A'}
                            </div>
                        </li>
                    ))
                )}
            </ul>
            <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/employee-dashboard")}>
                Volver al Panel
            </button>
        </div>
    );
}