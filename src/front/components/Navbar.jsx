import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const token = localStorage.getItem("token");
	const role = localStorage.getItem("role");
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		localStorage.removeItem("username");
		navigate("/");
	};

	const username = localStorage.getItem("username");

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="ml-auto d-flex align-items-center gap-3">
					{token && role === "employee" && (
						<div className="d-flex align-items-center gap-2">
							<Link to="/employee-dashboard" className="btn btn-outline-dark btn-sm">
								👤 {username || "Mi perfil"}
							</Link>
							<button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
								Cerrar sesión
							</button>
						</div>
					)}

					{token && role === "company" && (
						<div className="d-flex align-items-center gap-2">
							<Link to="/company-dashboard" className="btn btn-outline-dark btn-sm">
								🏢 Mi empresa
							</Link>
							<button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
								Cerrar sesión
							</button>
						</div>
					)}

					{token && role === "admin" && (
						<div className="d-flex align-items-center gap-2">
							<Link to="/admin-dashboard" className="btn btn-outline-dark btn-sm">
								🛡️ {username || "Panel admin"}
							</Link>
							<button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
								Cerrar sesión
							</button>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};
