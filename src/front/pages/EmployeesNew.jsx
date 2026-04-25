import { useNavigate } from "react-router-dom";
import EmployeesForm from "../components/EmployeesForm.jsx";

export default function CreateEmployee() {

    const navigate = useNavigate();

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
            return response;
        } catch (error) {
            throw error;
        }
    };

    const handleCreate = async (formData) => {
        try {
            const res = await authFetch(`${API_URL}employees`, {
                method: "POST",
                body: JSON.stringify(formData) // Enviamos solo los datos del formulario
            });

            if (res.ok) {
                navigate("/employees");
            } else {
                const errorData = await res.json();
                alert("Error: " + (errorData.msg || "No se pudo crear"));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    return (
        <div className="container mt-4">
            <EmployeesForm onSubmit={handleCreate} />
        </div>
    );
}