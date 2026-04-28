import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeesForm.jsx";

export default function EditEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    const role = localStorage.getItem("role");

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    ...options.headers
                }
            });
            if (!response.ok) {
                const errorDetail = await response.json().catch(() => ({ msg: "Error en la operación" }));
                throw new Error(errorDetail.msg || `Error ${response.status}`);
            }
            return response;
        } catch (err) {
            console.error("Error en authFetch:", err.message);
            throw err;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const employeeRes = await authFetch(`${API_URL}employees/${id}`);
                const employeeData = await employeeRes.json();

                if (role === "admin") {
                    const companiesRes = await authFetch(`${API_URL}companies`);
                    const companiesData = await companiesRes.json();
                    setCompanies(Array.isArray(companiesData) ? companiesData : []);
                }

                setEmployee({
                    ...employeeData,
                    company_id: employeeData.company_id || "",
                    profile_image: employeeData.profile_image || ""
                });
            } catch (err) {
                setError("No se pudo cargar la información del empleado.");
            }
        };

        fetchData();
    }, [id, role]);

    const handleChange = (e) => {
        setEmployee({
            ...employee,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);

            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const cloudinaryData = await cloudinaryRes.json();

            if (!cloudinaryRes.ok || !cloudinaryData.secure_url) {
                throw new Error("No se pudo subir la imagen");
            }

            setEmployee(prev => ({
                ...prev,
                profile_image: cloudinaryData.secure_url
            }));
        } catch (err) {
            alert("Error al subir imagen: " + err.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleRemoveImage = () => {
        setEmployee(prev => ({
            ...prev,
            profile_image: ""
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            await authFetch(`${API_URL}employees/${id}`, {
                method: "PUT",
                body: JSON.stringify(employee)
            });
            navigate("/employees");
        } catch (err) {
            alert("Error al actualizar: " + err.message);
        }
    };

    if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

    if (!employee) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card shadow-sm p-4">
                <h2 className="mb-4 text-center">Editar Empleado</h2>

                {role === "admin" && (
                    <>
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Empresa</label>
                            <select
                                name="company_id"
                                className="form-select"
                                value={employee.company_id}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una empresa</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.nombre_empresa}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold">Foto de perfil</label>
                            <div className="d-flex align-items-center gap-3">
                                {employee.profile_image ? (
                                    <img
                                        src={employee.profile_image}
                                        alt="Foto de perfil"
                                        className="rounded-circle border"
                                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: "80px", height: "80px", fontSize: "28px" }}
                                    >
                                        {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                    </div>
                                )}

                                <div className="d-flex flex-column gap-2">
                                    <label className="btn btn-sm btn-outline-secondary">
                                        {uploading ? "Subiendo..." : "Cambiar foto"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            disabled={uploading}
                                            onChange={handleProfileUpload}
                                        />
                                    </label>

                                    {employee.profile_image && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={handleRemoveImage}
                                        >
                                            Quitar foto
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <EmployeeForm
                    initialData={employee}
                    onSubmit={() => handleUpdate({ preventDefault: () => {} })}
                    isEdit={true}
                />
            </div>
        </div>
    );
}
