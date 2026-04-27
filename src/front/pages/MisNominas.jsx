import { useEffect, useState } from "react";

export default function MisNominas() {
    const [nominas, setNominas] = useState([]);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

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

    const fetchNominas = async () => {
        const endpoint = role === "admin" ? `${API_URL}nominas` : `${API_URL}employee/nominas`;
        const res = await authFetch(endpoint);
        const data = await res.json();
        if (Array.isArray(data)) {
            setNominas(data);
        } else {
            setNominas([]);
        }
    };

    useEffect(() => {
        if (token && (role === "employee" || role === "admin")) {
            fetchNominas();
        }
    }, []);

    if (!token || (role !== "employee" && role !== "admin")) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Debes estar logueado como empleado para ver tus nominas.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1 className="fw-bold mb-4">Mis Nominas</h1>
            {nominas.length === 0 ? (
                <p className="text-muted">No tienes nominas registradas.</p>
            ) : (
                <ul className="list-group">
                    {nominas.map(n => (
                        <li key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>{n.month}</strong>
                            {n.document_url ? (
                                <a href={n.document_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                    Descargar
                                </a>
                            ) : (
                                <span className="text-muted">Sin documento</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}