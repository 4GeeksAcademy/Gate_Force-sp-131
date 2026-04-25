import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Vacaciones() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();
    const [vacaciones, setVacaciones] = useState([]);
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

    const getVacaciones = async () => {
        try {
            const endpoint = role === "employee" ? "employee/vacaciones" : "vacaciones";
            const res = await authFetch(`${API_URL}${endpoint}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setVacaciones(data);
            } else {
                setVacaciones([]);
            }
        } catch (error) {
            console.error("Error en getVacaciones:", error);
        }
    };

    useEffect(() => {
        getVacaciones();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Vacaciones</h1>
                {!token ? (
                    <p>Debes estar logueado para gestionar tus vacaciones</p>
                ) : null}
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => navigate("/vacaciones/new")}
                        style={{ backgroundColor: "#9C27B0", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                    >
                        Crear
                    </button>
                    {role !== "employee" && (
                        <button
                            onClick={() => navigate("/vacaciones/delete")}
                            style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                        >
                            Eliminar
                        </button>
                    )}
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
                                <div style={{ fontSize: "0.9em", color: "#666" }}>
                                    <span>Total: {vacacion.vacations}</span> |
                                    <span style={{ margin: "0 5px" }}>Taken: {vacacion.taken_vacations}</span> |
                                    <span style={{ fontWeight: "bold" }}>Available: {vacacion.available_vacations}</span> |
                                    <span>{vacacion.created_at}</span>
                                </div>
                            </div>
                            {role !== "employee" && (
                                <button
                                    onClick={() => navigate(`/vacaciones/edit/${vacacion.id}`)}
                                    style={{ marginLeft: "15px" }}
                                >
                                    Edit
                                </button>
                            )}
                        </li>
                    ))
                )}
            </ul>
            <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/company-dashboard")}>
                <i className="fas fa-arrow-left me-2"></i>
                Volver al Panel
            </button>
        </div>
    );
}