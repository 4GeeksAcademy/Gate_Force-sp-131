import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function WorkRecordForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        check_in: "",
        check_out: "",
        status: "pending"
    });

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

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

    useEffect(() => {
        if (id) {
            authFetch(`${API_URL}work-records/${id}`)
                .then(res => res.json())
                .then(data => {
                    setForm({
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
        const url = id ? `${API_URL}work-records/${id}` : `${API_URL}employee/work-records`;

        await authFetch(url, {
            method,
            body: JSON.stringify({
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