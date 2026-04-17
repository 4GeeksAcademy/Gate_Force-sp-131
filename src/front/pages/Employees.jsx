import { useEffect, useState } from "react";

export default function EmployeesPage() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

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
        const res = await fetch(`${API_URL}employees`);
        const data = await res.json();
        setEmployees(data);
    };

    useEffect(() => {
        getEmployees();
    }, []);

    const deleteEmployee = async (id) => {
        await fetch(`${API_URL}${id}`, {
            method: "DELETE"
        });

        getEmployees();
    };

    const startEdit = (emp) => {
        setEditingId(emp.id);
        setFormData(emp);
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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${API_URL}employees/${editingId}`
            : `${API_URL}employees`;

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        cancelEdit();
        getEmployees();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Employees</h1>

            <form
                onSubmit={handleSubmit}
            >
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
                    <li key={emp.id} style={{ marginBottom: "10px" }}>
                        {emp.first_name} {emp.last_name} - {emp.email}

                        <button
                            onClick={() => startEdit(emp)}
                            style={{ marginLeft: "10px" }}
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => deleteEmployee(emp.id)}
                            style={{ marginLeft: "5px" }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}