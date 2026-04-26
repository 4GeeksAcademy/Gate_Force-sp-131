import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function VacacionesEdit() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        employee_id: "",
        vacations: "",
        taken_vacations: "",
        available_vacations: ""
    });

    useEffect(() => {
        const getVacacion = async () => {
            const res = await fetch(`${API_URL}vacaciones`);
            const data = await res.json();
            const vacacion = data.find(v => v.id === parseInt(id));
            if (vacacion) setFormData(vacacion);
        };
        getVacacion();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/employees${formData.employee_id}/vacaciones/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        navigate("/vacaciones");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Edit Vacacion</h1>
            <form onSubmit={handleSubmit}>
                <input
                    name="vacations"
                    placeholder="Total vacations"
                    type="number"
                    value={formData.vacations || ""}
                    onChange={handleChange}
                />
                <input
                    name="taken_vacations"
                    placeholder="Taken vacations"
                    type="number"
                    value={formData.taken_vacations || ""}
                    onChange={handleChange}
                />
                <input
                    name="available_vacations"
                    placeholder="Available vacations"
                    type="number"
                    value={formData.available_vacations || ""}
                    onChange={handleChange}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit">Update</button>
                    <button type="button" onClick={() => navigate("/vacaciones")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}