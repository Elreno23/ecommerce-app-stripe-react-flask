import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Signup.css";

const Signup = () => {
  const { actions } = useContext(Context);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [usersData, setUsersData] = useState({
    email: "",
    username: "",
    password: ""
  });

  
  const handleChange = (e) => {
    setUsersData({
      ...usersData, [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmPassword !== usersData.password) {
      alert("Passwords don't match!")
      return null
    } else {
      const result = await actions.register(usersData);
      if (result && result.status === 201) {
        navigate("/"); // Redirige al login después de registrarse.
      }
    }
  };

  return (
    <div className='container signup'>
      <div className='Signup'>
        <form onSubmit={handleSubmit}>
          <h1>Signup</h1>
          <div className="inputAndLabelEmailSignup">
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
          <div className="inputAndLabelUsernameSignup">
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
          <div className="inputAndLabelPasswordSignup">
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
          <div className="inputAndLabelConfirmPasswordSignup">
            <label htmlFor="ConfirmPassword">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="ConfirmPassword"
              placeholder="Enter password"
              required />
          </div>
          <div className="loginButton">
            <button className="btn login" type="submit"><p>Signup</p><i className="fa-solid fa-user-plus"></i></button>
          </div>
        </form>
      </div>
      <Link className="anchorLogin" to="/">
        <span>Click to Login</span>
      </Link>
    </div >

  )
}


export default Signup