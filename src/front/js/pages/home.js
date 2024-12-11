import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/home.css";

const Home = () => {
	const { actions, store } = useContext(Context);
	const [loginData, setLoginData] = useState({
		email: "",
		password: ""
	});
	const navigate = useNavigate();

	const handleChange = (e) => {
		setLoginData({
			...loginData, [e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const result = await actions.login(loginData);
		if (result.jwt_token && result.msg === "ok") {
			localStorage.setItem("jwt_token", result.jwt_token);
			navigate("/stock")
		}
	}

	return (
		<div className='container login'>
			<div className='login'>
				<form onSubmit={handleSubmit}>
					<h1>Login</h1>
					<div className="inputAndLabelEmail">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							name="email"
							value={loginData.email}
							onChange={handleChange}
							id="email"
							placeholder="name@example.com"
							required />
					</div>
					<div className="inputAndLabelPassword">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							name="password"
							value={loginData.password}
							onChange={handleChange}
							id="password" placeholder="Enter password"
							required
						/>
					</div>
					<div className="loginButton">
					<button className="btn login" type="submit"><p>Login</p><i className="fa-solid fa-door-open"></i></button>
					</div>
				</form>
			</div>
			<Link className="anchorSignup" to="/signup">
				<span>Click to Register</span>
			</Link>
		</div >
	);
};
export default Home;