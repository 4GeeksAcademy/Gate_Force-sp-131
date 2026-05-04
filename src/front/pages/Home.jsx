import React, { useEffect } from "react"
import { Link } from "react-router-dom";
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";


export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (

		<div className="text-center mt-5">
			<Link to="/login" className="btn btn-primary mb-4">
				Go to Login
			</Link>
			<h1 className="display-4">Hello Rigo!</h1>
			<p className="lead">This is a boilerplate for a full-stack application using React and Flask.</p>
			<hr className="my-4" />
			<p>Click the button below to see the magic happen!</p>
			<Link to="/demo" className="btn btn-primary btn-lg">
				Go to Demo
			</Link>
			<p className="mt-4">
				Made with <span className="text-danger">❤</span> by{" "}
				<a href="https://www.linkedin.com/in/rigoberto-hernandez/" target="_blank" rel="noopener noreferrer">
					Rigoberto Hernández
				</a>
				.
			</p>
			<p className="lead">

				<img src={rigoImageUrl} className="img-fluid rounded-circle mb-3" alt="Rigo Baby" />
			</p>
			<div className="alert alert-info">
				{store.message ? (
					<span>{store.message}</span>
				) : (
					<span className="text-danger">
						Loading message from the backend (make sure your python 🐍 backend is running)...
					</span>
				)}
			</div>
		</div>
	);
}; 