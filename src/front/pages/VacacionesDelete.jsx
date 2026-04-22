import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VacacionesDelete() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [vacaciones, setVacaciones] = useState([]);
    const [employees, setEmployees] = useState([]);

    const getVacaciones = async () => {
        const res = await fetch(`${API_URL}vacaciones`);
        const data = await res.json();
        setVacaciones(data);
    };

    const getEmployees = async () => {
        try {
            const res = await fetch(`${API_URL}employees`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                console.error("La respuesta no es un array:", data);
                setEmployees([]);
            }
        } catch (error) {
            console.error("Error cargando empleados:", error);
            setEmployees([]);
        }
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

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.id === employeeId);
        return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Delete Vacaciones</h1>
                <button
                    onClick={() => navigate("/vacaciones")}
                    style={{ padding: "8px 16px", cursor: "pointer" }}
                >
                    Back
                </button>
            </div>
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
                            onClick={() => deleteVacacion(vacacion.employee_id, vacacion.id)}
                            style={{ marginLeft: "5px", backgroundColor: "#f44336", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}