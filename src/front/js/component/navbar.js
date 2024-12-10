import React from "react";
import { Link } from "react-router-dom";
import Cart from "./Cart";
import '../../styles/Navbar.css'


export const Navbar = () => {

	return (
		<nav className="navbar">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Home</span>
				</Link>
				<div className="ml-auto">
					<Cart/>
				</div>
			</div>
		</nav>
	);
};
