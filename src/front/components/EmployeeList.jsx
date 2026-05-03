import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EmployeeList = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState(null);

    useEffect(() => {
        const loadEmployees = async () => {
            const { ok, data } = await actions.apiFetch("/employees");
            if (ok) setEmployees(data);
            setLoading(false);
        };
        loadEmployees();
    }, []);

    const handleDeactivate = async (id) => {
        const { ok } = await actions.apiFetch(`/employees/${id}`, "DELETE");
        if (ok) {
            setEmployees(prev => prev.map(emp =>
                emp.id === id ? { ...emp, is_active: false } : emp
            ));
            setConfirmingId(null);
        }
    };

    if (loading) return (
        <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="card border-0 shadow-sm">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="px-4 py-3">Empleado</th>
                            <th>Puesto</th>
                            <th>Estado</th>
                            <th>Phone</th>
                            <th className="text-end px-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.id}>
                                <td className="px-4">
                                    <div className="d-flex align-items-center gap-2">
                                        {emp.profile_image ? (
                                            <img
                                                src={emp.profile_image}
                                                alt={emp.first_name}
                                                className="rounded-circle object-fit-cover"
                                                style={{ width: 36, height: 36 }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: 36, height: 36 }}
                                            >
                                                <i className="bi bi-person-fill text-white" style={{ fontSize: 16 }}></i>
                                            </div>
                                        )}
                                        <div>
                                            <span className="fw-bold text-dark">{emp.first_name} {emp.last_name}</span>
                                            <div className="small text-muted">{emp.email}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Si position viene nulo o vacío del backend, mostrará "Staff" */}
                                <td>{emp.position || "Staff"}</td>

                                <td>
                                    <span className={`badge ${emp.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {emp.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>{emp.phone || '---'}</td>
                                <td className="text-end px-4">
                                    <div className="d-flex justify-content-end gap-2">
                                        {confirmingId === emp.id ? (
                                            <>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleDeactivate(emp.id)}
                                                    title="Confirmar baja"
                                                >
                                                    {/* Corregido a className */}
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                                <button

                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setConfirmingId(null)}
                                                    title="Cancelar"
                                                ><i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => navigate(`/edit-employee/${emp.id}`)}
                                                    title="Editar"
                                                >
                                                    {/* Corregido a className */}
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => navigate(`/employee-details/${emp.id}`)}
                                                    title="Ver detalles"
                                                >
                                                    {/* Corregido a className */}
                                                    <i className="fa-solid fa-circle-info"></i>
                                                </button>
                                                {emp.is_active && (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => setConfirmingId(emp.id)}
                                                        title="Dar de baja"
                                                    >
                                                        {/* Corregido a className */}
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default EmployeeList;