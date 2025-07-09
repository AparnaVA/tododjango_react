// add read functionality to retrieve all todolists of specific user and a pagination of 5 items per page
// and display them in a list with name and date
// and a button to edit,delete and mark as complete details of each todolist
// and a button to create a new todolist
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import '../Retrieve.css';

function Retrieve() {
    const [todolists, setTodolists] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { userId } = useParams();
    const userid = userId;

    useEffect(() => {
        axios.get(`http://localhost:8000/todolist/all/${userid}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setTodolists(response.data.results);
            setTotalPages(response.data.total_pages);
        })
        .catch(error => {
            console.error(error);
            setErrorMessage(error.response.data.error || 'Failed to retrieve TodoLists. Please try again.');
        });
    }, [userId, currentPage]);

    function handleEdit(todolistId) {
        navigate(`/todolist/${userId}/edit/${todolistId}/`);
    }

    function handleDelete(todolistId) {
        if (window.confirm("Are you sure you want to delete this TodoList?")) {
            axios.delete(`http://localhost:8000/todolist/${userId}/delete/${todolistId}/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                setTodolists(todolists.filter(todolist => todolist.id !== todolistId));
                navigate(`/todolist/all/${userId}/`);
                setErrorMessage('');
            })
            .catch(error => {
                console.error(error);
                setErrorMessage(error.response.data.error || 'Failed to delete TodoList. Please try again.');
            });
        }
    }

    function handleMarkComplete(todolistId) {
        axios.patch(`http://localhost:8000/todolist/${todolistId}/`, {
            completed: true
        }, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setTodolists(todolists.map(todolist => {
                if (todolist.id === todolistId) {
                    return { ...todolist, completed: true };
                }
                return todolist;
            }));
            navigate(`/todolist/all/${userId}/`);
            setErrorMessage('');
        })
        .catch(error => {
            console.error(error);
            setErrorMessage(error.response.data.error || 'Failed to mark TodoList as complete. Please try again.');
        });
    }

    return (
        <div>
            <Navbar />
            <div className="container retrieve-todolist">
                {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
                <ul className="list-group">
                    {todolists.map(todolist => (
                        <li key={todolist.id} className="list-group-item">
                            <h5>{todolist.name}</h5>
                            <p>{todolist.date}</p>
                            <button className="btn btn-warning" onClick={() => handleEdit(todolist.id)}>Edit</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(todolist.id)}>Delete</button>
                            <button className="btn btn-success" onClick={() => handleMarkComplete(todolist.id)}>Mark as Complete</button>
                        </li>
                    ))}
                </ul>
                <div className="pagination">
                    <button className="btn btn-secondary" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                    <button className="btn btn-secondary" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default Retrieve;
