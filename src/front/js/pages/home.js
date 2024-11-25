import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

const Home = () => {
	const { actions } = useContext(Context);
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
			navigate("/signup")
		}
	}


	return (
		<div className='container d-flex flex-column align-items-center' style={{ margin: "10% auto" }}>
			<div className='d-flex flex-column' style={{ width: "300px", padding: "10px", border: "1px solid gray" }}>
				<form onSubmit={handleSubmit}>
					<h1 className='mb-5' style={{ marginLeft: "30%" }}>Login</h1>
					<div className="mb-3">
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
					<div className="mb-3">
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
					<button className="btn btn-primary mt-5" style={{ width: "40%", marginLeft: "30%" }} type="submit">Login</button>
				</form>
			</div>
			<a href="/signup">Click to register</a>
		</div >
	);
};
export default Home;