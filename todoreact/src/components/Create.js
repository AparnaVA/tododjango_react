//add a functionality to create a todolist with name and date input from specific User and save it to db
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../Create.css';

function Create() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    function createTodoList() {
        const userId = localStorage.getItem('userId');
        const todolist = {
            name: name,
            date: date
        };
        axios.post('http://localhost:8000/todolist/create/', todolist, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            console.log(response.data);
            setErrorMessage('');
            navigate(`/todolist/all/${userId}`);
        })
        .catch(error => {
            console.error(error);
            setErrorMessage(error.response.data.error || 'Failed to create TodoList. Please try again.');
        });
    }

    return (
        <div>
            <Navbar />
            <h2 className="mt-1">Create TodoList</h2>
            <div className="container create-todolist signup">
                <div className="row">
                    <div className="col-10 offset-1">
                        <h1 className="mb-5">Create TodoList</h1>
                    </div>
                </div>
            <div className="form-group">
                {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
            </div>
            <div className="form-group">
            <input
            className="form-control"
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <input
            className='form-control'
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
            />
            <button className="btn btn-primary btn-block" onClick={createTodoList}>Create</button>
            
        </div>
        </div>
        </div>
    );
}

export default Create;
