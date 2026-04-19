import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PayrollPage() {
    const { id } = useParams();
    const [nomina, setNomias] = useState([]);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchPayrolls = async () => {
            const res = await fetch(`${API_URL}employees/${id}/nominas`);
            const data = await res.json();
            setNomias(data);
        };
        fetchPayrolls();
    }, [id, API_URL]);

    return (
        <div>
            <h1>Nóminas del Empleado #{id}</h1>
            {nomina.map(p => (
                <div key={p.id}>{p.month}</div>
            ))}
        </div>
    );
}