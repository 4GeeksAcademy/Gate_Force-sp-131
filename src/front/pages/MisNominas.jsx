import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MisNominas() {
    const [nominas, setNominas] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const employeeId = searchParams.get("employee_id");

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
        let endpoint = `${API_URL}employee/nominas`;

        if (role === "admin" && !employeeId) {
            endpoint = `${API_URL}nominas`;
        } else if ((role === "company" || role === "admin") && employeeId) {
            endpoint += `?employee_id=${employeeId}`;
        }

        const res = await authFetch(endpoint);
        const data = await res.json();

        if (Array.isArray(data)) {
            setNominas(data);
        } else {
            setNominas([]);
        }
    };

    useEffect(() => {
        if (!token || !role) return;

        if (role === "employee") {
            fetchNominas();
        }

        if (role === "admin") {
            fetchNominas();
        }

        if (role === "company" && employeeId) {
            fetchNominas();
        }
    }, [token, role, employeeId]);

    const handleDelete = async (nominaId) => {
        const confirmed = window.confirm("¿Seguro que quieres borrar esta nómina?");
        if (!confirmed) return;

        try {
            const res = await authFetch(`${API_URL}nominas/${nominaId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchNominas();
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.msg || "No se pudo borrar la nómina.");
            }
        } catch (error) {
            console.error("Error al borrar nómina:", error);
            alert("Error al borrar la nómina.");
        }
    };

    if (!token || !role) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Debes iniciar sesión.
                </div>
            </div>
        );
    }

    if (role === "company" && !employeeId) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Falta seleccionar empleado.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">
                    {role === "employee"
                        ? "Mis Nóminas"
                        : role === "admin" && !employeeId
                            ? "Todas las Nóminas"
                            : "Nóminas del empleado"}
                </h1>

                {(role === "company" || role === "admin") && employeeId && (
                    <button
                        className="btn btn-success"
                        onClick={() => navigate(`/nominas/new?employee_id=${employeeId}`)}
                    >
                        Subir nómina
                    </button>
                )}
            </div>

            {nominas.length === 0 ? (
                <p className="text-muted">No hay nóminas registradas.</p>
            ) : (
                <ul className="list-group">
                    {nominas.map(n => (
                        <li
                            key={n.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <strong>{n.month}</strong>
                                {(role === "company" || role === "admin") && n.employee_name && (
                                    <span className="ms-2 text-muted">- {n.employee_name}</span>
                                )}
                            </div>

                            <div className="d-flex gap-2">
                                {n.document_url ? (
                                    <a
                                        href={n.document_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        Descargar
                                    </a>
                                ) : (
                                    <span className="text-muted">Sin documento</span>
                                )}

                                {(role === "company" || role === "admin") && (
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(n.id)}
                                    >
                                        Borrar
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
