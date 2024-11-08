import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

const Home = () => {

	const backUrl = process.env.BACKEND_URL;//Url del fetch
	const navigate = useNavigate();

	const Login = async (event) => {//Función para ejecutar el fetch.
		event.preventDefault();//Evito el comportamiento del formulario(recarga la página).

		try { //Captura errores, bloquea la ejecución y envia el error a catch.
			const resp = await fetch(`${backUrl}login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					"email": document.getElementById("email").value, //Obtengo el valor de email, evitamos estados(app sencillas).
					"password": document.getElementById("password").value
				})
			});
			console.log(resp);

			if (!resp.ok) {
				throw new Error(`Error! ${resp}`)
			}
			const data = await resp.json();
			console.log(data);

			if (data.jwt_token && data.msg === "ok") { //Verifico que exista el token y el statusCode sea 0k.
				localStorage.setItem("jwt_token", data.jwt_token) //Si es así guardo el token en localStorage.
				navigate('/private')//Me redirige a private.
			} else {
				alert("Error logging, try again!")
			}
		} catch (err) {//Manejamos errores.
			console.error(err);
			alert("Incorrect email or password")

		}
	};


	return (
		<div className='container d-flex flex-column align-items-center' style={{ margin: "10% auto" }}>
			<div className='d-flex flex-column' style={{ width: "300px", padding: "10px", border: "1px solid gray" }}>
				<form onSubmit={Login}>
					<h1 className='mb-5' style={{ marginLeft: "30%" }}>Login</h1>
					<div className="mb-3">
						<label className="form-label">Email address</label>
						<input type="email" className="form-control" id="email" placeholder="name@example.com" />
					</div>
					<div className="mb-3">
						<label className="form-label">Password</label>
						<input type="password" className="form-control" id="password" placeholder='Enter password' />
					</div>
					<button className="btn btn-primary mt-5" style={{ width: "40%", marginLeft: "30%" }} type="submit">Login</button>
				</form>
			</div>
			<a href="/signup">Click to register</a>
		</div >
	);
};
export default Home;