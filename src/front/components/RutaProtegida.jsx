import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const RutaProtegida = ({ children, allowedRole }) => {
    const { store } = useGlobalReducer();

    const token = store.token || localStorage.getItem("token");
    const role = store.role || localStorage.getItem("role");

    if (token && (role === allowedRole || role === "admin")) {
        return children;
    }

    const redirectMap = {
        "employee": "/login-employee",
        "company": "/login-company",
        "admin": "/login-admin"
    };

    return <Navigate to={redirectMap[allowedRole] || "/login-company"} replace />;
};

export default RutaProtegida;