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
import { Modal, Button } from 'react-bootstrap';


function Retrieve() {
    const [todolists, setTodolists] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [todolistToDelete, setTodolistToDelete] = useState(null);

    const navigate = useNavigate();
    const { userId, status_type } = useParams();
    const statusType = status_type || 'all'; // fallback to all

    useEffect(() => {
        axios.get(`http://localhost:8000/todolist/all/${userId}/${statusType}/`, {
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
    }, [userId, statusType, currentPage]);

    function handleEdit(todolistId) {
        navigate(`/todolist/${userId}/edit/${todolistId}/`);
    }

    function handleDelete(todolistId) {
        setShowConfirmModal(true);
        setTodolistToDelete(todolistId);
    }

    function handleConfirmedDelete() {
        axios.delete(`http://localhost:8000/todolist/delete/${todolistToDelete}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setTodolists(todolists.filter(todolist => todolist.id !== todolistToDelete));
            setErrorMessage('');
        })
        .catch(error => {
            console.error(error);
        setErrorMessage(error.response.data.error || 'Failed to delete TodoList. Please try again.');
    })
    .finally(() => {
        setShowConfirmModal(false);
        setTodolistToDelete(null);
    });
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
            setErrorMessage(response.data.message || 'TodoList marked as complete successfully.');
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
                {errorMessage && <div className='alert alert-danger'><span>{errorMessage}</span></div>}
                <ul className="list-group">
                    {/* add options for seeing all task,pending tasks,completed tasks in same page*/}

                    <h2 className="mt-1">TodoLists</h2>
                    <div className="form-group">
                        <button className="btn btn-primary" onClick={() => navigate(`/todolist/create/`)}>Create TodoList</button>
                    </div>
                    <div className="form-group">
                        <button className="btn btn-secondary" onClick={() => navigate(`/todolist/all/${userId}/all`)}>All Tasks</button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/todolist/all/${userId}/pending`)}>Pending Tasks</button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/todolist/all/${userId}/completed`)}>Completed Tasks</button>
                    </div>


                    {/* map through todolists and display them */}
                    <ul className="list-group">
                        {todolists.map(todolist => (
                            <li key={todolist.id} className="list-group-item">
                                {/* make todo item line through if completed */}
                                <div style={{ textDecoration: todolist.is_completed ? 'line-through' : 'none' }}>
                                    <h5>{todolist.name}</h5>
                            </div>
                                <p>{todolist.date}</p>
                                <button className="btn btn-warning" onClick={() => handleEdit(todolist.id)}>Edit</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(todolist.id)}>Delete</button>
                                <button className="btn btn-success" onClick={() => handleMarkComplete(todolist.id)}>Mark as Complete</button>
                        </li>
                    ))}
                </ul>
                </ul>

                <div className="pagination">
                    <button className="btn btn-secondary" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                    <button className="btn btn-secondary" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
    <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
    </Modal.Header>
    <Modal.Body>Are you sure you want to delete this TodoList?</Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
        <Button variant="danger" onClick={handleConfirmedDelete}>Delete</Button>
    </Modal.Footer>
</Modal>


        </div>

        
    );
}

export default Retrieve;
