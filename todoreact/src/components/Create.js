//add a functionality to create a todolist with name and date input from specific User and save it to db
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './Navbar';
import '../Create.css';

function Create() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) {
            navigate(`/login/`);
        }
    }, [navigate]);

    function createTodoList() {
        const userId = localStorage.getItem('userId');

        // 🔍 Validation before making the request
    if (!name.trim()) {
        toast.warning('Please enter a name');
        return;
    }
    if (!date.trim()) {
        toast.warning('Please select a date');
        return;
    }
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
            toast.success('TodoList created successfully');
            navigate(`/todolist/all/${userId}/all/`, {
                state: { successMessage: 'Task created successfully' }
            });
        })
        .catch(error => {
            console.error(error);
            toast.error(error.response?.data?.error || 'Failed to create TodoList. Please try again.');
        });
    }

    return (
        <div>
            <Navbar />
            <ToastContainer
  position="top-right"
  autoClose={3000}
  style={{ marginTop: '50px', marginRight: '600px' }} /> // ← Add your custom margins here
            <h2 className="mt-1">Create TodoList</h2>
            <div className="container create-todolist signup">
                <div className="row">
                    <div className="col-10 offset-1">
                        <h1 className="mb-5">Create TodoList</h1>
                    </div>
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
