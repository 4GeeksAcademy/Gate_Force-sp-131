import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function WorkRecordForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        employee_id: "",
        check_in: "",
        check_out: "",
        status: "pending"
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
            authFetch(`${API_URL}work-records/${id}`)
                .then(res => res.json())
                .then(data => {
                    setForm({
                        employee_id: data.employee_id,
                        check_in: data.check_in?.slice(0, 16),
                        check_out: data.check_out?.slice(0, 16) || "",
                        status: data.status
                    });
                });
        }
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toUTC = (dateStr) => {
        const local = new Date(dateStr);
        return local.toISOString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}work-records/${id}` : `${API_URL}work-records`;

        await authFetch(url, {
            method,
            body: JSON.stringify({
                employee_id: parseInt(form.employee_id),
                check_in: toUTC(form.check_in),
                check_out: form.check_out ? toUTC(form.check_out) : null,
                status: form.status
            })
        });

        navigate("/work-records");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>{id ? "Editar registro" : "Crear registro"}</h1>

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
                    type="datetime-local"
                    name="check_in"
                    value={form.check_in}
                    onChange={handleChange}
                    required
                />

                <input
                    type="datetime-local"
                    name="check_out"
                    value={form.check_out}
                    onChange={handleChange}
                />

                <select name="status" value={form.status} onChange={handleChange}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>

                <button type="submit">{id ? "Actualizar" : "Crear"}</button>
            </form>
        </div>
    );
}