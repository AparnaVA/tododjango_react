import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap"; // ✅ Add this

function Navbar() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅

    const confirmLogout = () => {
        axios.post('http://localhost:8000/logout/', {}, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("token")}`
            }
        })
        .then(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            navigate("/login");
        })
        .catch(error => {
            console.error("There was an error logging out!", error);
        });
    };

    return (
        <>
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
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
                <div className="collapse navbar-collapse mr-auto" id="navbarNav">
                    <ul className="navbar-nav ml-auto" style={{ color: "#ffffff" }}>
                        <li className="nav-item">
                            <NavLink to={"/"} className="nav-link text-white"><b>Home</b></NavLink>
                        </li>
                    </ul>

                    {userId ? (
                        <ul className="navbar-nav" style={{ color: "#ffffff" }}>
                            <li className="nav-item">
                                <NavLink to={`/todolist/all/${userId}/all/`} className="nav-link text-white">
                                    <b>TodoLists</b>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to={`/todolist/create/`} className="nav-link text-white">
                                    <b>Create</b>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <button onClick={() => setShowLogoutModal(true)} className="btn text-white">
                                    Logout
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <ul className="navbar-nav ml-auto" style={{ color: "#ffffff" }}>
                            <li className="nav-item">
                                <NavLink to={"/login"} className="nav-link text-white"><b>Login</b></NavLink>
                            </li>
                        </ul>
                    )}
                </div>
            </nav>

            {/* ✅ Logout Confirmation Modal */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to logout?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmLogout}>Logout</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Navbar;
