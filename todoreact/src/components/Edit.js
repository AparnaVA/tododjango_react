//add edit functionality to edit a todolist with name and date input from specific User and save it to db
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './Navbar';
import '../Edit.css';

function Edit() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger'
    const navigate = useNavigate();
    const { userId, todolistId } = useParams();

    React.useEffect(() => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            if (!userId || !token) {
                navigate(`/login/`);
            }
        }, [navigate]);
    

    useEffect(() => {
        // Fetch the existing TodoList details
        axios.get(`http://localhost:8000/todolist/${userId}/${todolistId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setName(response.data.name);
            setDate(response.data.date);
        })
        .catch(error => {
            console.error(error);
            toast.warning('Failed to fetch TodoList details. Please try again.');
        });
    }, [todolistId]);

    function updateTodoList() {
        const updatedTodolist = {
            name: name,
            date: date
        };

        axios.put(`http://localhost:8000/todolist/${userId}/edit/${todolistId}/`, updatedTodolist, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            navigate(`/todolist/all/${userId}/all/`, {
                state: { successMessage: 'TodoList updated successfully' }
            });
        })
        .catch(error => {
            console.error(error);
            toast.warning('Failed to update TodoList. Please try again.');
        });
    }

    return (
        <div>
            <Navbar />
            <div className="container edit-todolist edit-container edit">
                <div className="row">
                    <div className="col-10 offset-1">
                        <h1 className="mb-5">Edit TodoList</h1>
                    
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                            <input
                                className='form-control'
                                type="date"
                                placeholder="Date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                            />
                            <button className="btn btn-block btn-primary" onClick={updateTodoList}>Update</button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default Edit;
