import React, { useEffect, useState } from "react";

const Admin = () => {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [list, setList] = useState([]);

    const apiUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api/";



    function getAdmins() {
        fetch(`${apiUrl}admin`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setList(data);
                }
            })
            .catch(error => console.error(error));
    }
    useEffect(() => {
        getAdmins();
    }, []);

    function agregarAdmin(event) {
        event.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        };

        fetch(`${apiUrl}admin`, requestOptions)
            .then(response => {
                if (response.ok) {
                    setUser("");
                    setPass("");
                    getAdmins();
                }
            })
            .catch(error => console.error(error));
    }

    function eliminarAdmin(id) {
        fetch(`${apiUrl}admin/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    getAdmins();
                }
            })
            .catch(error => console.error(error));
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Admin</h2>

            <form onSubmit={agregarAdmin} className="mb-4">
                <div className="row">
                    <div className="col">
                        <input type="text" className="form-control" placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} required />
                    </div>
                    <div className="col">
                        <input type="password" className="form-control" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} required />
                    </div>
                    <div className="col-auto">
                        <button type="submit" className="btn btn-success"> Add </button>
                    </div>
                </div>
            </form>

            <ul className="list-group">
                {list.map((item) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            <strong>{item.id}</strong> - {item.username}
                            <small className="ms-3 text-muted">{item.created_at}</small>
                        </span>
                        <button className="btn btn-danger btn-sm" onClick={() => eliminarAdmin(item.id)}> Delete </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Admin;