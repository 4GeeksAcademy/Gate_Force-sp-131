import { useEffect, useState } from "react";

export default function Vacaciones() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const [vacaciones, setVacaciones] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: "",
        vacations: "",
        taken_vacations: "",
        available_vacations: ""
    });

    const getVacaciones = async () => {
        const res = await fetch(`${API_URL}vacaciones`);
        const data = await res.json();
        setVacaciones(data);
    };

    const getEmployees = async () => {
        const res = await fetch(`${API_URL}employees/simple`);
        const data = await res.json();
        setEmployees(data);
    };

    useEffect(() => {
        getVacaciones();
        getEmployees();
    }, []);

    const deleteVacacion = async (employeeId, vacacionId) => {
        await fetch(`${API_URL}employees/${employeeId}/vacaciones/${vacacionId}`, {
            method: "DELETE"
        });
        getVacaciones();
    };

    const startEdit = (vacacion) => {
        setEditingId(vacacion.id);
        setFormData(vacacion);
        setShowForm(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setShowForm(false);
        setFormData({
            employee_id: "",
            vacations: "",
            taken_vacations: "",
            available_vacations: ""
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${API_URL}employees/${formData.employee_id}/vacaciones/${editingId}`
            : `${API_URL}employees/${formData.employee_id}/vacaciones`;
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        cancelEdit();
        getVacaciones();
    };

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.id === employeeId);
        return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Vacaciones</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{ backgroundColor: "#9C27B0", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                    >
                        Crear
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <h3>{editingId ? "Edit Vacacion" : "Create Vacacion"}</h3>
                    {!editingId && (
                        <select name="employee_id" value={formData.employee_id} onChange={handleChange} required>
                            <option value="">Select employee</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    )}
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
                        <button type="submit">
                            {editingId ? "Update" : "Create"}
                        </button>
                        <button type="button" onClick={cancelEdit}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <ul>
                {vacaciones.map((vacacion) => (
                    <li key={vacacion.id} style={{
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        listStyle: "none",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px"
                    }}>
                        <div style={{ flexGrow: 1 }}>
                            <strong>{getEmployeeName(vacacion.employee_id)}</strong>
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                                <span>Total: {vacacion.vacations}</span> |
                                <span style={{ margin: "0 5px" }}>Taken: {vacacion.taken_vacations}</span> |
                                <span style={{ fontWeight: "bold" }}>Available: {vacacion.available_vacations}</span> |
                                <span>{vacacion.created_at}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => startEdit(vacacion)}
                            style={{ marginLeft: "15px" }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteVacacion(vacacion.employee_id, vacacion.id)}
                            style={{ marginLeft: "5px", color: "red" }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}