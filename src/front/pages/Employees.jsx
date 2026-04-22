import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function EmployeesPage() {
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const navigate = useNavigate();

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

    const [employees, setEmployees] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        position: ""
    });

    const getEmployees = async () => {
        const res = await authFetch(`${API_URL}employees`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setEmployees(data);
        } else {
            console.error("Error al obtener empleados:", data);
            setEmployees([]);
        }
    };

    useEffect(() => {
        getEmployees();
    }, []);

    const deleteEmployee = async (id) => {
        await authFetch(`${API_URL}employees/${id}`, { method: "DELETE" });
        getEmployees();
    };

    const startEdit = (emp) => {
        setEditingId(emp.id);
        setFormData({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            phone: emp.phone || "",
            position: emp.position || ""
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            phone: "",
            position: ""
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${API_URL}employees/${editingId}`
            : `${API_URL}employees`;

        const res = await authFetch(url, {
            method,
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", data);

        cancelEdit();
        getEmployees();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Employees</h1>

            <form onSubmit={handleSubmit}>
                <h3>{editingId ? "Edit Employee" : "Create Employee"}</h3>

                <input
                    name="first_name"
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="last_name"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {!editingId && (
                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                )}
                <input
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                />
                <input
                    name="position"
                    placeholder="Position"
                    value={formData.position || ""}
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
                {employees.map((emp) => (
                    <li key={emp.id} style={{
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        listStyle: "none",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px"
                    }}>
                        <div style={{ flexGrow: 1 }}>
                            <strong>{emp.first_name} {emp.last_name}</strong>
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                                <span>{emp.email}</span> |
                                <span style={{ margin: "0 5px", fontWeight: "bold" }}>{emp.position}</span> |
                                <span>{emp.phone}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/horarios/${emp.id}`)}
                            style={{ marginLeft: "5px", backgroundColor: "#FF9800", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                        >
                            Horarios
                        </button>

                        <button
                            onClick={() => startEdit(emp)}
                            style={{ marginLeft: "15px" }}
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => deleteEmployee(emp.id)}
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