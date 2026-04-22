import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const SignupEmployee = () => {
    const { actions } = useGlobalReducer();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        first_name: "", last_name: "", email: "", password: "", phone: "", position: ""
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await actions.signupEmployee(formData);
        if (result.success) {
            navigate("/login-employee");
        } else {
            setError(result.msg || "Error al registrarse");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
                <h2 className="text-center">Registro Empleado</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input name="first_name" className="form-control mb-2" placeholder="Nombre" onChange={handleChange} required />
                    <input name="last_name" className="form-control mb-2" placeholder="Apellido" onChange={handleChange} required />
                    <input name="email" type="email" className="form-control mb-2" placeholder="Email" onChange={handleChange} required />
                    <input name="password" type="password" className="form-control mb-2" placeholder="Password" onChange={handleChange} required />
                    <input name="phone" className="form-control mb-2" placeholder="Teléfono" onChange={handleChange} />
                    <input name="position" className="form-control mb-2" placeholder="Cargo" onChange={handleChange} />
                    <button type="submit" className="btn btn-primary w-100 mt-2">Registrarse</button>
                </form>
            </div>
        </div>
    );
};

export default SignupEmployee;