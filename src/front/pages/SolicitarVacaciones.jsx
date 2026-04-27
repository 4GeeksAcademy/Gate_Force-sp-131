import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SolicitarVacaciones() {
    const [vacaciones, setVacaciones] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [daysRequested, setDaysRequested] = useState(0);
    const [status, setStatus] = useState({ type: "", msg: "" });
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const navigate = useNavigate();

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

    const fetchVacaciones = async () => {
        const res = await authFetch(`${API_URL}employee/vacaciones`);
        const data = await res.json();
        if (Array.isArray(data)) setVacaciones(data);
    };

    useEffect(() => {
        if (token && role === "employee") fetchVacaciones();
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end >= start) {
                const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                setDaysRequested(diff);
            } else {
                setDaysRequested(0);
            }
        }
    }, [startDate, endDate]);

    const availableDays = vacaciones.length > 0
        ? vacaciones[vacaciones.length - 1].available_vacations ?? 0
        : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (daysRequested > availableDays) {
            setStatus({ type: "danger", msg: "No tienes suficientes dias disponibles." });
            return;
        }
        const res = await authFetch(`${API_URL}employee/vacaciones`, {
            method: "POST",
            body: JSON.stringify({
                start_date: startDate,
                end_date: endDate
            })
        });
        if (res.ok) {
            setStatus({ type: "success", msg: "Solicitud enviada correctamente. Pendiente de aprobacion." });
            setStartDate("");
            setEndDate("");
            setDaysRequested(0);
            fetchVacaciones();
        } else {
            setStatus({ type: "danger", msg: "Error al enviar la solicitud." });
        }
    };

    if (!token || role !== "employee") {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Debes estar logueado como empleado para solicitar vacaciones.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1 className="fw-bold mb-4">Solicitar Vacaciones</h1>

            <div className="card shadow-sm p-4 mb-4" style={{ maxWidth: "500px" }}>
                <ul className="list-group list-group-flush mb-4">
                    <li className="list-group-item d-flex justify-content-between">
                        <span className="text-muted fw-semibold">Dias disponibles</span>
                        <span className="fw-bold text-success">{availableDays}</span>
                    </li>
                </ul>

                {status.msg && (
                    <div className={`alert alert-${status.type}`}>{status.msg}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Fecha de inicio</label>
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Fecha de fin</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Dias solicitados</label>
                        <input
                            type="number"
                            className="form-control"
                            value={daysRequested}
                            readOnly
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={daysRequested <= 0}
                    >
                        Solicitar
                    </button>
                </form>
            </div>

            <h4 className="fw-bold mb-3">Mis solicitudes</h4>
            <ul className="list-group">
                {vacaciones.filter(v => v.start_date).length === 0 ? (
                    <li className="list-group-item text-muted">No tienes solicitudes previas.</li>
                ) : (
                    vacaciones.filter(v => v.start_date).map(v => (
                        <li key={v.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{v.start_date}</strong> al <strong>{v.end_date}</strong>
                                <span className="ms-2 text-muted">({v.days_requested} dias)</span>
                            </div>
                            <span className={`badge ${v.status === "approved" ? "bg-success" : v.status === "rejected" ? "bg-danger" : "bg-warning text-dark"}`}>
                                {v.status}
                            </span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}