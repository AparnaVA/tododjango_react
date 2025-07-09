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
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const { userId, status_type } = useParams();
    const statusType = status_type || 'all'; // fallback to all

    useEffect(() => {
    axios.get(`http://localhost:8000/todolist/all/${userId}/${statusType}/`, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
        },
        params: {
            page: currentPage,
            search: searchTerm
        }
    })
    .then(response => {
        setTodolists(response.data.results);
        setTotalPages(response.data.total_pages);
    })
    .catch(error => {
        setErrorMessage("Failed to retrieve TodoLists");
    });
}, [userId, statusType, currentPage, searchTerm]);


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
                
                    {/* add options for seeing all task,pending tasks,completed tasks in same page*/}

                    <h2 className="text-center">TodoLists</h2>
                    <div className="row mb-3">


    {/* Search Bar */}
    <input
    type="text"
    className="form-control"
    placeholder="Search TodoLists..."
    value={searchTerm}
    onChange={(e) => {
        setCurrentPage(1); // reset to first page on search
        setSearchTerm(e.target.value);
    }}
/>


</div>

                    <div className="form-group">
                        <label htmlFor="statusType" className='mr-4'>Filter by Status:</label>
                        <button className="btn btn-filter mx-3" onClick={() => navigate(`/todolist/all/${userId}/all`)}>All Tasks</button>
                        <button className="btn btn-filter mx-3" onClick={() => navigate(`/todolist/all/${userId}/pending`)}>Pending Tasks</button>
                        <button className="btn btn-filter mx-3" onClick={() => navigate(`/todolist/all/${userId}/completed`)}>Completed Tasks</button>
                    </div>


                    {/* map through todolists and display them */}
                    <ul className="list-group">
    {todolists.length === 0 ? (
        <li className="list-group-item">No TodoLists found.</li>
    ) : (
        todolists.map(todolist => (
            <li key={todolist.id} className="list-group-item">
                <div style={{ textDecoration: todolist.is_completed ? 'line-through' : 'none' }}>
                    <h5>{todolist.name}</h5>
                </div>
                <p>{todolist.date}</p>
                <button className="btn btn-edit col-2" onClick={() => handleEdit(todolist.id)}>Edit</button>
                <button className="btn btn-delete col-2" onClick={() => handleDelete(todolist.id)}>Delete</button>
                <button className="btn btn-complete col-2" onClick={() => handleMarkComplete(todolist.id)}>Complete</button>
            </li>
        ))
    )}
</ul>

              
               {/* Pagination */}
            {totalPages > 0 && (
                <div className="pagination mt-4">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            className={`badge badge-dark mx-1 px-3 ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
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
