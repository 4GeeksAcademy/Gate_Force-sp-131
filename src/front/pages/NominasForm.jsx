import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function NominaForm() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const employeeIdFromQuery = searchParams.get("employee_id");
    const role = localStorage.getItem("role");

    const [employees, setEmployees] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        employee_id: employeeIdFromQuery || "",
        monthName: "",
        year: "",
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

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => String(currentYear - 2 + i));

    useEffect(() => {
        authFetch(`${API_URL}employees`)
            .then(res => res.json())
            .then(data => setEmployees(Array.isArray(data) ? data : []))
            .catch(() => setEmployees([]));
    }, []);

    useEffect(() => {
        if (id) {
            authFetch(`${API_URL}nominas/${id}`)
                .then(res => res.json())
                .then(data => {
                    const monthParts = (data.month || "").split(" ");
                    const parsedMonthName = monthParts[0] || "";
                    const parsedYear = monthParts[1] || "";

                    setForm({
                        employee_id: String(data.employee_id || ""),
                        monthName: parsedMonthName,
                        year: parsedYear,
                        document_url: data.document_url || ""
                    });
                });
        }
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("upload_preset", uploadPreset);

            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                {
                    method: "POST",
                    body: uploadData
                }
            );

            const cloudinaryJson = await cloudinaryRes.json();

            if (!cloudinaryRes.ok || !cloudinaryJson.secure_url) {
                throw new Error("No se pudo subir el archivo");
            }

            setForm(prev => ({
                ...prev,
                document_url: cloudinaryJson.secure_url
            }));
        } catch (error) {
            alert(error.message || "Error al subir la nómina");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}nominas/${id}` : `${API_URL}nominas`;
        const formattedMonth = `${form.monthName} ${form.year}`.trim();

        await authFetch(url, {
            method,
            body: JSON.stringify({
                employee_id: parseInt(form.employee_id),
                month: formattedMonth,
                document_url: form.document_url
            })
        });

        if ((role === "company" || role === "admin") && form.employee_id) {
            navigate(`/mis-nominas?employee_id=${form.employee_id}`);
        } else {
            navigate("/nominas");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm p-4" style={{ maxWidth: "520px", margin: "0 auto" }}>
                <h1 className="h3 mb-4">{id ? "Editar Nómina" : "Crear Nómina"}</h1>

                <form onSubmit={handleSubmit} className="d-grid gap-3">
                    <div>
                        <label className="form-label">Empleado</label>
                        <select
                            name="employee_id"
                            value={form.employee_id}
                            onChange={handleChange}
                            required
                            disabled={!!employeeIdFromQuery}
                            className="form-select"
                        >
                            <option value="">Seleccionar empleado</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <label className="form-label">Mes</label>
                            <select
                                name="monthName"
                                value={form.monthName}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="" disabled>Seleccionar mes</option>
                                {months.map(month => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Año</label>
                            <select
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="" disabled>Seleccionar año</option>
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Archivo de nómina</label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="form-control"
                            disabled={uploading}
                        />
                        {uploading && (
                            <small className="text-muted">Subiendo archivo...</small>
                        )}
                    </div>

                    <div>
                        <label className="form-label">URL documento</label>
                        <input
                            type="text"
                            name="document_url"
                            placeholder="URL documento"
                            value={form.document_url}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    {form.document_url && (
                        <div className="border rounded p-3 bg-light">
                            <small className="text-muted d-block mb-2">Archivo cargado</small>
                            <a
                                href={form.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                            >
                                Ver documento
                            </a>
                        </div>
                    )}

                    <button type="submit" className="btn btn-success">
                        {id ? "Actualizar" : "Crear"}
                    </button>
                </form>
            </div>
        </div>
    );
}
