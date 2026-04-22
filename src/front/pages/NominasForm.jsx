import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NominaForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        employee_id: "",
        month: "",
        document_url: ""
    });

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

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

    useEffect(() => {
        authFetch(`${API_URL}employees`)
            .then(res => res.json())
            .then(data => setEmployees(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        if (id) {
            authFetch(`${API_URL}nominas/${id}`)
                .then(res => res.json())
                .then(data => {
                    setForm({
                        employee_id: data.employee_id,
                        month: data.month,
                        document_url: data.document_url || ""
                    });
                });
        }
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}nominas/${id}` : `${API_URL}nominas`;

        await authFetch(url, {
            method,
            body: JSON.stringify({
                employee_id: parseInt(form.employee_id),
                month: form.month,
                document_url: form.document_url
            })
        });

        navigate("/nominas");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>{id ? "Editar Nómina" : "Crear Nómina"}</h1>

            <form onSubmit={handleSubmit}>
                <select name="employee_id" value={form.employee_id} onChange={handleChange} required>
                    <option value="">Seleccionar empleado</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    name="month"
                    placeholder="Ej: Marzo 2026"
                    value={form.month}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="document_url"
                    placeholder="URL documento"
                    value={form.document_url}
                    onChange={handleChange}
                />

                <button type="submit">{id ? "Actualizar" : "Crear"}</button>
            </form>
        </div>
    );
}