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
import { useLocation } from 'react-router-dom';



function Retrieve() {
    const [todolists, setTodolists] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [todolistToDelete, setTodolistToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const successMessage = location.state?.successMessage;

    const navigate = useNavigate();
    const { userId, status_type } = useParams();
    const statusType = status_type || 'all'; // fallback to all


    useEffect(() => {
    const successMessage = location.state?.successMessage;
    if (successMessage) {
        setMessage(successMessage);
        setMessageType('success');

        // Clear the state so it doesn't repeat on future renders
        window.history.replaceState({}, document.title);
    }
}, [location.state]);

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
        setMessage("Failed to retrieve TodoLists");
        setMessageType('danger');
    });
}, [userId, statusType, currentPage, searchTerm]);


useEffect(() => {
    if (message) {
        const timer = setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 2000); // Adjust duration if needed

        return () => clearTimeout(timer); // Cleanup
    }
}, [message]);


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
            setMessage('Task deleted successfully');
            setMessageType('success');
        })
        .catch(error => {
            console.error(error);
            setMessage(error.response.data.error || 'Failed to delete TodoList. Please try again.');
            setMessageType('danger');
        })
    .finally(() => {
        setShowConfirmModal(false);
        setTodolistToDelete(null);
    });
    }

    function handleMarkComplete(todolistId, currentStatus) {
    const newStatus = !currentStatus;

    axios.patch(`http://localhost:8000/todolist/${todolistId}/`, {
        completed: newStatus
    }, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        setTodolists(todolists.map(todolist => {
            if (todolist.id === todolistId) {
                return { ...todolist, is_completed: newStatus };
            }
            return todolist;
        }));

        setMessage(newStatus ? 'Task marked as complete.' : 'Task unmarked as complete.');
        setMessageType('success');
    })
    .catch(error => {
        console.error(error);
        setMessage(error.response?.data?.error || 'Failed to update task status.');
        setMessageType('danger');
    });
}


    return (
        <div>
            <Navbar />
            <div className="container retrieve-todolist">
                {message && (
  <div className={`alert alert-${messageType || 'success'}`}>
    <span>{message}</span>
  </div>
)}


                    {/* add options for seeing all task,pending tasks,completed tasks in same page*/}

                    <h2 className="text-center">TodoLists</h2>
                    <div className="row">


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
                        <button className="btn btn-filter mx-3" onClick={() => navigate(`/todolist/all/${userId}/all`)}>All</button>
                        <button className="btn btn-filter mx-3" onClick={() => navigate(`/todolist/all/${userId}/pending`)}>Pending</button>
                        <button className="btn btn-filter mx-3" onClick={() => navigate(`/todolist/all/${userId}/completed`)}>Completed</button>
                    </div>


                   <ul className="list-group">
  {todolists.length === 0 ? (
    <li className="list-group-item text-center py-4">
      <strong>No TodoLists found.</strong>
    </li>
  ) : (
    todolists.map(todolist => (
      <li
        key={todolist.id}
        className="list-group-item shadow-sm mb-3 rounded"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5
              className={`mb-1 ${
                todolist.is_completed ? "text-success" : "text-dark"
              }`}
              style={{
                textDecoration: todolist.is_completed ? "line-through" : "none",
              }}
            >
              {todolist.name}
            </h5>
            <small className="text-secondary">{todolist.date}</small>
          </div>

          <div className="d-flex gap-3">
            <i
              className="fas fa-edit "
              title="Edit"
              onClick={() => handleEdit(todolist.id)}
              style={{ fontSize: "20px", cursor: "pointer", marginLeft: "15px" }}
            ></i>
            <i
              className="fas fa-trash-alt text-danger"
              title="Delete"
              onClick={() => handleDelete(todolist.id)}
              style={{ fontSize: "20px", cursor: "pointer", marginLeft: "15px" }}
            ></i>
            <i
  className={`fas fa-check-circle ${todolist.is_completed ? "text-success" : "text-muted"}`}
  title={todolist.is_completed ? "Unmark" : "Mark as Complete"}
  onClick={() => handleMarkComplete(todolist.id, todolist.is_completed)}
  style={{ fontSize: "20px", cursor: "pointer", marginLeft: "15px" }}
></i>

          </div>
        </div>
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
