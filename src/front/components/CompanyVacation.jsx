import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VacacionesCompany() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const [solicitudes, setSolicitudes] = useState([]);
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

    const getSolicitudes = async () => {
        try {
            const res = await authFetch(`${API_URL}vacaciones`);
            const data = await res.json();
            if (Array.isArray(data)) setSolicitudes(data);
        } catch (error) {
            console.error("Error obteniendo solicitudes:", error);
        }
    };

    // Función para aprobar o denegar
    const handleStatusChange = async (employee_id, vacacion_id, newStatus) => {
        try {
            const res = await authFetch(`${API_URL}employees/${employee_id}/vacaciones/${vacacion_id}`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Si la API responde bien, actualizamos la vista sin recargar la página
                setSolicitudes(solicitudes.map(sol =>
                    sol.id === vacacion_id ? { ...sol, status: newStatus } : sol
                ));
            }
        } catch (error) {
            console.error("Error al actualizar estado:", error);
        }
    };

    useEffect(() => {
        getSolicitudes();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Panel de Vacaciones - Empresa</h1>

            <ul style={{ padding: 0 }}>
                {solicitudes.length === 0 ? (
                    <p>No hay registros de vacaciones.</p>
                ) : (
                    solicitudes.map((vacacion) => (
                        <li key={vacacion.id} style={{
                            marginBottom: "15px", display: "flex", alignItems: "center",
                            borderBottom: "1px solid #eee", paddingBottom: "10px"
                        }}>
                            <div style={{ flexGrow: 1 }}>
                                <h5 style={{ margin: 0 }}>{vacacion.employee_name || "Empleado Desconocido"}</h5>
                                <div style={{ fontSize: "0.9em", color: "#666" }}>
                                    <span>Solicitados: {vacacion.days_requested || 0} días</span> |
                                    <span style={{ margin: "0 5px" }}>Estado: <b style={{ textTransform: "uppercase" }}>{vacacion.status || "pending"}</b></span> |
                                    <span> Inicio: {vacacion.start_date ? vacacion.start_date.split("T")[0] : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Botones de acción solo si está pendiente */}
                            {(!vacacion.status || vacacion.status === "pending") && (
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={() => handleStatusChange(vacacion.employee_id, vacacion.id, "approved")}
                                        style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px" }}
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(vacacion.employee_id, vacacion.id, "rejected")}
                                        style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px" }}
                                    >
                                        Denegar
                                    </button>
                                </div>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}