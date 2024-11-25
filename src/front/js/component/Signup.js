import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { actions } = useContext(Context);
  const [usersData, setUsersData] = useState({
    email: "",
    username: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUsersData({
      ...usersData, [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    console.log("Submitting usersData:", usersData);
    e.preventDefault();
    const result = await actions.register(usersData);
    if (result && result.status === 201) {
      navigate("/"); // Redirige al login después de registrarse.
    }
  };

  return (
    <div className='container d-flex flex-column align-items-center' style={{ margin: "10% auto" }}>
      <div className='d-flex flex-column' style={{ width: "300px", padding: "10px", border: "1px solid gray" }}>
        <form onSubmit={handleSubmit}>
          <h1 className='mb-5' style={{ marginLeft: "25%" }}>Signup</h1>
          <div className="mb-3">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={usersData.email}
              onChange={handleChange}
              id="email"
              placeholder="name@example.com"
              required />
          </div>
          <div className="mb-3">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              value={usersData.username}
              onChange={handleChange}
              id="username"
              placeholder="Username"
              required />
          </div>
          <div className="mb-3">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={usersData.password}
              onChange={handleChange}
              id="password"
              placeholder="Enter password"
              required />
          </div>
          <button className="btn btn-primary mt-5" style={{ width: "40%", marginLeft: "30%" }} type="submit">Register</button>
        </form>
      </div>
      <a href="/">Click to Login</a>
    </div >

  )
}


export default Signup