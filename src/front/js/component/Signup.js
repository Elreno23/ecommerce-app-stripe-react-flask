import React from 'react'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const navigate = useNavigate()
  const backUrl = process.env.BACKEND_URL;

  const register = async (event) => {
    event.preventDefault();

    try {
      const resp = await fetch(`${backUrl}signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "email": document.getElementById("email").value,
          "password": document.getElementById("password").value
        })
      });
      
      if (!resp.ok) {
        throw new Error("Error!");
      }
      const data = await resp.json();
      if (data.msg === "Successfully registered user") { //Si salió todo bien me envía a login.
        console.log(data);
        navigate('/')

      } else {
        alert("Error registering!"); //Si no mostramos una alerta(error).
      }
    } catch (err) {
      console.error(err);
      alert("Error http!")
    }
  }
  return (

    <div className='container d-flex flex-column align-items-center' style={{ margin: "10% auto" }}>
      <div className='d-flex flex-column' style={{ width: "300px", padding: "10px", border: "1px solid gray" }}>
        <form onSubmit={register}>
          <h1 className='mb-5' style={{ marginLeft: "25%" }}>Signup</h1>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" placeholder="name@example.com" />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder='Enter password' />
          </div>
          <button className="btn btn-primary mt-5" style={{ width: "40%", marginLeft: "30%" }} type="submit">Register</button>
        </form>
      </div>
      <a href="/">Click to Login</a>
    </div >

  )
}

export default Signup