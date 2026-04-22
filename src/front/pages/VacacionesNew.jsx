import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VacacionesNew() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: "",
        vacations: "",
        taken_vacations: "",
        available_vacations: ""
    });

    const getEmployees = async () => {
        const res = await fetch(`${API_URL}employees/simple`);
        const data = await res.json();
        setEmployees(data);
    };

    useEffect(() => {
        getEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}employees/${formData.employee_id}/vacaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        navigate("/vacaciones");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Create Vacacion</h1>
            <form onSubmit={handleSubmit}>
                <select name="employee_id" value={formData.employee_id} onChange={handleChange} required>
                    <option value="">Select employee</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                        </option>
                    ))}
                </select>
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
                    <button type="submit">Create</button>
                    <button type="button" onClick={() => navigate("/vacaciones")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}