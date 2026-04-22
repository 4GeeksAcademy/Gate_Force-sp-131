import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NominasPage() {
    const [nominas, setNominas] = useState([]);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_BACKEND_URL
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api/";

    const fetchNominas = async () => {
        const res = await fetch(`${API_URL}nominas`);
        const data = await res.json();
        setNominas(data);
    };

    useEffect(() => {
        fetchNominas();
    }, []);

    const handleDelete = async (id) => {
        await fetch(`${API_URL}nominas/${id}`, {
            method: "DELETE"
        });
        fetchNominas();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Nóminas</h1>

            <button onClick={() => navigate("/nominas/new")}>
                Crear Nómina
            </button>

            {nominas.map(n => (
                <div key={n.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                    <p><strong>Empleado:</strong> {n.employee_name}</p>
                    <p><strong>Mes:</strong> {n.month}</p>
                    <p><strong>Documento:</strong> {n.document_url}</p>


                    <button onClick={() => navigate(`/nominas/edit/${n.id}`)}>
                        Editar
                    </button>

                    <button onClick={() => handleDelete(n.id)}>
                        Eliminar
                    </button>
                </div>
            ))}
        </div>
    );
}