//add edit functionality to edit a todolist with name and date input from specific User and save it to db
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import '../Edit.css';

function Edit() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { userId, todolistId } = useParams();

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
            setErrorMessage('Failed to fetch TodoList details. Please try again.');
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
            console.log(response.data);
            setErrorMessage(response.data);
            navigate(`/todolist/all/${userId}/`);
        })
        .catch(error => {
            console.error(error);
            setErrorMessage('Failed to update TodoList. Please try again.');
        });
    }

    return (
        <div>
            <Navbar />
            <h2 className="mt-1">Edit TodoList</h2>
            <div className="container edit-todolist">
                <div className="row">
                    <div className="col-10 offset-1">
                        <h1 className="mb-5">Edit TodoList</h1>
                        {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
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
                            <button className="btn btn-primary" onClick={updateTodoList}>Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Edit;
