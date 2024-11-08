import React from "react";
import { Link, useNavigate } from "react-router-dom";


export const Navbar = () => {
	const navigate = useNavigate();

	const Logout = () => {
		localStorage.removeItem("jwt_token");
		navigate("/");
		alert("You are logged out.")

	}
	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Home</span>
				</Link>
				<div className="ml-auto">
					<button onClick={Logout} className="btn btn-primary"><i class="fa-solid fa-right-from-bracket"></i></button>
				</div>
			</div>
		</nav>
	);
};
