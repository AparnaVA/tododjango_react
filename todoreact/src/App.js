// add an attractive front page of todo app with signup and login side by side with effects and hover effects
import React from 'react';
import './App.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (userId && token) {
            navigate(`/todolist/all/${userId}/all`);
        } else {
            navigate('/');
        }
    }, []);

    return (
        <div className="container-fluid bg-dark min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <h1 className="display-4 text-white mb-3 animate-title">🎯 Welcome to My TO-DO App</h1>
                <p className="lead text-light mb-4 animate-subtitle">Organize your tasks effortlessly</p>
                <div className="d-flex justify-content-center gap-3 animate-buttons">
                    <a href="/signup" className="btn btn-primary btn-lg shadow-custom px-5 py-2">
                        Sign Up
                    </a>
                    <a href="/login" className="btn btn-outline-light btn-lg shadow-custom px-5 py-2">
                        Login
                    </a>
                </div>
            </div>
        </div>
    );
}
export default App;