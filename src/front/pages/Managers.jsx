import { useEffect, useState } from "react";

export default function Managers() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";

    const [managers, setManagers] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        position: ""
    });

    const getManagers = async () => {
        const res = await fetch(`${API_URL}managers`);
        const data = await res.json();
        setManagers(data);
    };

    useEffect(() => {
        getManagers();
    }, []);

    const deleteManager = async (id) => {
        await fetch(`${API_URL}managers/${id}`, { method: "DELETE" });
        getManagers();
    };

    const startEdit = (m) => {
        setEditingId(m.id);
        setFormData({
            first_name: m.first_name,
            last_name: m.last_name,
            email: m.email,
            phone: m.phone || "",
            position: m.position || ""
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ first_name: "", last_name: "", email: "", password: "", phone: "", position: "" });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${API_URL}managers/${editingId}` : `${API_URL}managers`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        console.log("STATUS:", res.status, "RESPONSE:", data);

        cancelEdit();
        getManagers();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Managers</h1>

            <form onSubmit={handleSubmit}>
                <h3>{editingId ? "Edit Manager" : "Create Manager"}</h3>

                <input name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} required />
                <input name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} required />
                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

                {!editingId && (
                    <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required />
                )}

                <input name="phone" placeholder="Phone" value={formData.phone || ""} onChange={handleChange} />
                <input name="position" placeholder="Position" value={formData.position || ""} onChange={handleChange} />

                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit">{editingId ? "Update" : "Create"}</button>
                    {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
                </div>
            </form>

            <ul>
                {managers.map((m) => (
                    <li key={m.id} style={{
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        listStyle: "none",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px"
                    }}>
                        <div style={{ flexGrow: 1 }}>
                            <strong>{m.first_name} {m.last_name}</strong>
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                                <span>{m.email}</span> |
                                <span style={{ margin: "0 5px", fontWeight: "bold" }}>{m.position}</span> |
                                <span>{m.phone}</span>
                            </div>
                        </div>

                        <button onClick={() => startEdit(m)} style={{ marginLeft: "15px" }}>Edit</button>
                        <button onClick={() => deleteManager(m.id)} style={{ marginLeft: "5px", color: "red" }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}