import { useEffect, useState } from "react";

export default function CompaniesPage() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const [companies, setCompanies] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        nombre_empresa: "",
        password: "",
        region: "",
        is_active: true
    });

    const getCompanies = async () => {
        const res = await fetch(`${API_URL}companies`);
        const data = await res.json();
        setCompanies(data);
    };

    useEffect(() => {
        getCompanies();
    }, []);

    const deleteCompany = async (id) => {
        await fetch(`${API_URL}companies/${id}`, { method: "DELETE" });
        getCompanies();
    };

    const startEdit = (company) => {
        setEditingId(company.id);
        setFormData(company);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ nombre_empresa: "", password: "", region: "", is_active: true });
    };

    const handleChange = (e) => {
        const value = e.target.name === "is_active" ? e.target.value === "true" : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${API_URL}companies/${editingId}` : `${API_URL}companies`;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        cancelEdit();
        getCompanies();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Companies</h1>

            <form onSubmit={handleSubmit}>
                <h3>{editingId ? "Edit Company" : "Create Company"}</h3>

                <input
                    name="nombre_empresa"
                    placeholder="Company name"
                    value={formData.nombre_empresa}
                    onChange={handleChange}
                    required
                />

                <input
                    name="region"
                    placeholder="Region"
                    value={formData.region}
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

                <select name="is_active" value={formData.is_active} onChange={handleChange}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit">{editingId ? "Update" : "Create"}</button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit}>Cancel</button>
                    )}
                </div>
            </form>

            <ul>
                {companies.map((company) => (
                    <li key={company.id} style={{ marginBottom: "10px" }}>
                        {company.nombre_empresa} - {company.region} - {company.is_active ? "✅ Active" : "❌ Inactive"}

                        <button onClick={() => startEdit(company)} style={{ marginLeft: "10px" }}>Edit</button>
                        <button onClick={() => deleteCompany(company.id)} style={{ marginLeft: "5px" }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}