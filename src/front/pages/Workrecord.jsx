import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PayrollPage() {
    const { id } = useParams();
    const [record, setRecords] = useState([]);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchPayrolls = async () => {
            const res = await fetch(`${API_URL}employees/${id}/work-records`);
            const data = await res.json();
            setRecords(data);
        };
        fetchPayrolls();
    }, [id, API_URL]);

    return (
        <div>
            <h1>Registros del Empleado #{id}</h1>
            {record.map(p => (
                <div key={p.id}>{p.check_in}{p.total_hours}</div>
            ))}
        </div>
    );
}