import React from "react";
import { Link, useLocation } from "react-router-dom";
import Cart from "./Cart";
import '../../styles/Navbar.css'


export const Navbar = () => {
	const location = useLocation();
	const hideDropdownRoutes = ['/', '/signup'];
	return (
		<nav className="navbar">
			<div className="container">
			{!hideDropdownRoutes.includes(location.pathname) && (
				<>
				<Link to="/stock">
					<span className="navbar-brand mb-0 h1">Stock</span>
				</Link>
				<div className="ml-auto">
					<Cart/>
				</div>
				</>
			)}
			{hideDropdownRoutes.includes(location.pathname) && (
				<strong className="welcome">Welcome</strong>
			)}
			</div>
		</nav>
	);
};
