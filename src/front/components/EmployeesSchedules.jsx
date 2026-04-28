import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

export default function EmployeesSchedules() {
    const { store, actions } = useGlobalReducer();
    const { employeeId } = useParams();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";
    const idFinal = employeeId || store.employeeInfo?.id;

    const getSchedules = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}employees/${id}/horarios`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setSchedules(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando horarios:", error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    if (store.role !== "employee" && store.role !== "manager") {
        navigate("/login-employee");
    }

    if (loading) return <div className="text-center mt-5">Cargando horario...</div>;

    return (
        <div className="card shadow-sm p-4">
            <h4 className="fw-bold mb-4 text-primary">Mi Jornada Laboral</h4>
            <div className="table-responsive">
                <table className="table table-hover border">
                    <thead className="table-light">
                        <tr>
                            <th>Día</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length > 0 ? (
                            schedules.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.day}</td>
                                    <td>{s.start_time}</td>
                                    <td>{s.end_time}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center text-muted">
                                    No tienes turnos asignados para esta semana.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div>
                <Link to="/employee-dashboard" className="btn btn-secondary">
                    <i className="fas fa-arrow-left me-2"></i>Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}