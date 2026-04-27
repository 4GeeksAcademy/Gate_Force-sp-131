import { useState, useEffect } from "react";

export default function EmployeeForm({ initialData = {}, onSubmit, isEdit }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        position: ""
    });

    useEffect(() => {
        if (isEdit && initialData) {
            setFormData({
                first_name: initialData.first_name || "",
                last_name: initialData.last_name || "",
                email: initialData.email || "",
                password: "",
                phone: initialData.phone || "",
                position: initialData.position || ""
            });
        }
    }, [initialData, isEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            <h4 className="mb-4 text-primary">
                {isEdit ? "Modificar Datos del Empleado" : "Registrar Nuevo Empleado"}
            </h4>

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input name="first_name" className="form-control" placeholder="Ej. Juan"
                        value={formData.first_name} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Apellido</label>
                    <input name="last_name" className="form-control" placeholder="Ej. Pérez"
                        value={formData.last_name} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Correo Electrónico</label>
                    <input type="email" name="email" className="form-control" placeholder="correo@empresa.com"
                        value={formData.email} onChange={handleChange} required />
                </div>

                {!isEdit && (
                    <div className="col-md-6">
                        <label className="form-label">Contraseña</label>
                        <input type="password" name="password" className="form-control"
                            value={formData.password} onChange={handleChange} required />
                    </div>
                )}

                <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input name="phone" className="form-control" placeholder="+56 9..."
                        value={formData.phone} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Cargo / Posición</label>
                    <input name="position" className="form-control" placeholder="Ej. Desarrollador"
                        value={formData.position} onChange={handleChange} />
                </div>
            </div>

            <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary px-4">
                    {isEdit ? "Guardar Cambios" : "Registrar Empleado"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => window.history.back()}>
                    Cancelar
                </button>
            </div>
        </form>
    );
}