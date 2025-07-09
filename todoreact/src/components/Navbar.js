import { NavLink } from "react-router-dom";
import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useParams } from "react-router-dom";


function Navbar() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const logout = () => {
        axios.post('http://localhost:8000/logout/', {}, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("token")}`
            }
        })
        .then(response => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            navigate("/login");
        })
        .catch(error => {
            console.error("There was an error logging out!", error);
        });
    }

    return <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
        <div className="navbar-brand">
            <h4>My TO-DO</h4>
        </div>
        <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
        >
            <span className="navbar-toggler-icon"></span>
        </button>
        <div
        className="collapse navbar-collapse mr-auto"
        id="navbarNav"
        style={{ float: "left" }}
        >
            <ul className="navbar-nav ml-auto" style={{ color: "#ffffff" }}>
                <li className="nav-item">
                <NavLink to={"/"} className="nav-link text-white">
                    <b>Home</b>
                </NavLink>
                </li>
                
            </ul>
            {userId ? (
                <ul className="navbar-nav ml-auto" style={{ color: "#ffffff" }}>
                    <li className="nav-item">
                        <NavLink to={`/todolist/all/${userId}/`} className="nav-link text-white">
                            <b>TodoLists</b>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={`/todolist/create/`} className="nav-link text-white">
                            <b>Create TodoList</b>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <button onClick={logout} className="btn btn-danger">Logout</button>
                    </li>
                </ul>
            ) : (
                <ul className="navbar-nav ml-auto" style={{ color: "#ffffff" }}>
                    <li className="nav-item">
                        <NavLink to={"/login"} className="nav-link text-white">
                            <b>Login</b>
                        </NavLink>
                    </li>
                </ul>
            )}

        </div>
    </nav>;
}

export default Navbar;