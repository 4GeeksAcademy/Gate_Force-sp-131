import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const RutaProtegida = ({ children, allowedRole }) => {
    const { store } = useGlobalReducer();

    const token = store.token || localStorage.getItem("token");
    const role = store.role || localStorage.getItem("role");

    console.log("DEBUG GUARDIA -> Token:", !!token, "Role:", role);

    if (token && role === allowedRole) {
        return children;
    }

    return <Navigate to={allowedRole === "employee" ? "/login-employee" : "/login-company"} replace />;
};

export default RutaProtegida;