import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const SchedulePlanner = () => {
    const { actions } = useGlobalReducer();
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState("");
    const [schedule, setSchedule] = useState({ day: "Monday", start: "09:00", end: "18:00" });

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await actions.getEmployees();
            setEmployees(data);
        };
        loadEmployees();
    }, []);

    const handleSave = async () => {
        if (!selectedEmp) return alert("Select an employee first");
        const { ok } = await actions.apiFetch(`/employees/${selectedEmp}/schedules`, "POST", schedule);
        if (ok) alert("Schedule saved!");
    };

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4 text-center">Weekly Schedule Planner</h2>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-3">Add Shift</h5>
                        <label className="small fw-bold">Employee</label>
                        <select className="form-select mb-3" onChange={e => setSelectedEmp(e.target.value)}>
                            <option value="">Select...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.first_name}</option>
                            ))}
                        </select>

                        <label className="small fw-bold">Day</label>
                        <select className="form-select mb-3" onChange={e => setSchedule({ ...schedule, day: e.target.value })}>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        <div className="row">
                            <div className="col-6">
                                <label className="small fw-bold">Start</label>
                                <input type="time" className="form-control" value={schedule.start} onChange={e => setSchedule({ ...schedule, start: e.target.value })} />
                            </div>
                            <div className="col-6">
                                <label className="small fw-bold">End</label>
                                <input type="time" className="form-control" value={schedule.end} onChange={e => setSchedule({ ...schedule, end: e.target.value })} />
                            </div>
                        </div>
                        <button className="btn btn-warning w-100 mt-4 fw-bold" onClick={handleSave}>Assign Shift</button>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card border-0 shadow-sm p-4 bg-light">
                        <h5 className="fw-bold mb-3 text-muted">Planning Overview</h5>
                        <p className="small">Select an employee on the left to manage their specific timeline. All times are based on the company's local region.</p>
                        {/* Aquí podrías mapear los horarios existentes del empleado seleccionado */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulePlanner;