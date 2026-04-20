import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Vacaciones() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const { id } = useParams();
    const [vacaciones, setVacaciones] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        vacations: "",
        taken_vacations: "",
        available_vacations: ""
    });

    const getVacaciones = async () => {
        const res = await fetch(`${API_URL}employees/${id}/vacaciones`);
        const data = await res.json();
        setVacaciones(data);
    };

    useEffect(() => {
        getVacaciones();
    }, []);

    const deleteVacacion = async (vacacionId) => {
        await fetch(`${API_URL}employees/${id}/vacaciones/${vacacionId}`, {
            method: "DELETE"
        });
        getVacaciones();
    };

    const startEdit = (vacacion) => {
        setEditingId(vacacion.id);
        setFormData(vacacion);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
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
            ? `${API_URL}employees/${id}/vacaciones/${editingId}`
            : `${API_URL}employees/${id}/vacaciones`;
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        cancelEdit();
        getVacaciones();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Vacaciones</h1>
            <form onSubmit={handleSubmit}>
                <h3>{editingId ? "Edit Vacacion" : "Create Vacacion"}</h3>
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
                    {editingId && (
                        <button type="button" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
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
                            <strong>Total: {vacacion.vacations}</strong>
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                                <span>Taken: {vacacion.taken_vacations}</span> |
                                <span style={{ margin: "0 5px", fontWeight: "bold" }}>Available: {vacacion.available_vacations}</span> |
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
                            onClick={() => deleteVacacion(vacacion.id)}
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