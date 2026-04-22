import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WorkRecordPage() {
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const fetchRecords = async () => {
        const res = await fetch(`${API_URL}work-records`);
        const data = await res.json();
        setRecords(data);
    };

    const toUTC = (dateStr) => {
        const local = new Date(dateStr);
        return local.toISOString();
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleDelete = async (id) => {
        await fetch(`${API_URL}work-records/${id}`, {
            method: "DELETE"
        });
        fetchRecords();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Control de Fichajes</h1>

            <button onClick={() => navigate("/work-records/new")}>
                Crear registro
            </button>
            {records.map(r => (
                <div key={r.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                    <p><strong>Empleado:</strong> {r.employee_name}</p>
                    <p><strong>Check-in:</strong> {new Date(r.check_in).toLocaleString()}</p>
                    <p><strong>Check-out:</strong> {new Date(r.check_out).toLocaleString()}</p>
                    <p><strong>Horas:</strong> {r.total_hours}</p>
                    <p><strong>Status:</strong> {r.status}</p>

                    <button onClick={() => navigate(`/work-records/edit/${r.id}`)}>
                        Editar
                    </button>
                    <button onClick={() => handleDelete(r.id)}>
                        Eliminar
                    </button>
                </div>
            ))}
        </div>
    );
}