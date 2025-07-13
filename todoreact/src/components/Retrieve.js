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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';




function Retrieve() {
    const [todolists, setTodolists] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [todolistToDelete, setTodolistToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentImportFormat, setCurrentImportFormat] = useState(''); // Added state for import format
    const location = useLocation();

    const navigate = useNavigate();
    const { userId, status_type } = useParams();
    const statusType = status_type || 'all'; // fallback to all

    React.useEffect(() => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            if (!userId || !token) {
                navigate(`/login/`);
            }
        }, [navigate]);

        useEffect(() => {

    const successMessage = location.state?.successMessage;
    if (successMessage) {
        toast.success(successMessage); // ✅ Show as toast
        window.history.replaceState({}, document.title); // Clear state
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
  toast.danger("Failed to retrieve todolist")
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
            toast.success('Task deleted successfully');

        })
        .catch(error => {
            console.error(error);
           toast.error(error.response?.data?.error || 'Failed to delete TodoList. Please try again.');
        })
    .finally(() => {
        setShowConfirmModal(false);
        setTodolistToDelete(null);
    });
    }


    function handleExport(format) {
    let dataToExport = todolists; // Replace with your actual data
    let content = '';
    let filename = `todolist_export.${format}`;

    if (format === 'json') {
        content = JSON.stringify(dataToExport, null, 2);
    } else if (format === 'csv') {
        const headers = Object.keys(dataToExport[0] || {}).join(',');
        const rows = dataToExport.map(obj => Object.values(obj).join(',')).join('\n');
        content = `${headers}\n${rows}`;
    } else if (format === 'plain-text') {
        content = dataToExport.map(t => `${t.name} - ${t.date}`).join('\n');
    } else if (format === 'sql') {
        content = dataToExport.map(t =>
            `INSERT INTO todolist (name, date, is_completed) VALUES ('${t.name}', '${t.date}', ${t.is_completed});`
        ).join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function handleImport(format) {
    setCurrentImportFormat(format); // Save selected format to use inside handleFileRead
    document.getElementById('fileInput').click(); // Trigger file input
}
function handleFileRead(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        let dataToImport = [];
        if (currentImportFormat === 'json') {
            try {
                dataToImport = JSON.parse(content);
            } catch (error) {
                toast.danger('Invalid JSON Format');

                return;
            }
        } else if (currentImportFormat === 'csv') {
            const rows = content.split('\n').map(row => row.split(','));
            const headers = rows[0];
            dataToImport = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.trim()] = row[index].trim();
                });
                return obj;
            });
        } else if (currentImportFormat === 'plain-text') {
            const rows = content.split('\n');
            dataToImport = rows.map(row => {
                const [name, date] = row.split(' - ');
                return { name: name.trim(), date: date.trim(), is_completed: false };
            });
        } else if (currentImportFormat === 'sql') {
            const sqlStatements = content.split(';').map(stmt => stmt.trim()).filter(Boolean);
            dataToImport = sqlStatements.map(stmt => {
                const match = stmt.match(/INSERT INTO todolist \(name, date, is_completed\) VALUES \('(.+)', '(.+)', (\d+)\);/);
                if (match) {
                    return {
                        name: match[1],
                        date: match[2],
                        is_completed: match[3] === '1'
                    };
                }
                return null;
            }).filter(Boolean);
        }
        // Now send dataToImport to the backend


        const cleanedData = dataToImport.map(item => ({
  name: item.name,
  date: item.date,
  is_completed: item.is_completed === 'true' || item.is_completed === true  // Convert properly
}));

        console.log("Data being sent for import:", cleanedData);
        axios.post(`http://localhost:8000/todolist/import/${userId}/`, cleanedData, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
    toast.success('Import Successful');


    // Fetch updated list
    axios.get(`http://localhost:8000/todolist/all/${userId}/${statusType}/`, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
        },
        params: {
            page: currentPage,
            search: searchTerm
        }
    })
    .then(res => {
        setTodolists(res.data.results);
        setTotalPages(res.data.total_pages);
    })
    .catch(err => {
        console.error(err);
        toast.warning('Filed to retrieve todo list after import');

    });
})

        .catch(error => {
            console.error(error);
            toast.warning('Filed to import Tasks');

        });
    };
    reader.readAsText(file);
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

       toast.success(newStatus ? 'Task marked as complete.' : 'Task unmarked as complete.');

    })
    .catch(error => {
        console.error(error);
        toast.error(error.response?.data?.error || 'Failed to update Task status. Please try again.');
    });
}


    return (
        <div>
            <Navbar />
            <div className="container retrieve-todolist">
                


                    {/* add options for seeing all task,pending tasks,completed tasks in same page*/}

                    <h2 className="text-center">TodoLists</h2>
                    <div className="row">


    {/* Search Bar */}
    <input
    type="text"
    className="form-control"
    style={{"marginLeft":"10px","marginRight":"10px"}}
    placeholder="Search TodoLists..."
    value={searchTerm}
    onChange={(e) => {
        setCurrentPage(1); // reset to first page on search
        setSearchTerm(e.target.value);
    }}
/>
{/* add import and export buttons with drop down options csv,plain text,sql and json */}

<input
    type="file"
    id="fileInput"
    style={{ display: 'none' }}
    onChange={handleFileRead}
/>

</div>

                    <div className="form-group d-flex align-items-center flex-wrap gap-3 ms-auto" style={{ marginTop: '-15px' }} >
                        <label htmlFor="statusType" className='mr-4'>Filter by Status:</label>
                        <button className="btn btn-filter mx-2" onClick={() => navigate(`/todolist/all/${userId}/all`)}>All</button>
                        <button className="btn btn-filter mx-2" onClick={() => navigate(`/todolist/all/${userId}/pending`)}>Pending</button>
                        <button className="btn btn-filter mx-2" onClick={() => navigate(`/todolist/all/${userId}/completed`)}>Completed</button>
                    
                    
    <div className=" gap-3 d-flex ms-auto">
  {/* Import Dropdown */}
  <div className="btn-group">
    <button
      className="btn btn-secondary import dropdown-toggle mx-4 ms-auto"
      type="button"
      id="importDropdown"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      Import
    </button>
    <div className="dropdown-menu" aria-labelledby="importDropdown">
      <button className="dropdown-item" onClick={() => handleImport('csv')}>CSV</button>
      <button className="dropdown-item" onClick={() => handleImport('plain-text')}>Plain Text</button>
      <button className="dropdown-item" onClick={() => handleImport('sql')}>SQL</button>
      <button className="dropdown-item" onClick={() => handleImport('json')}>JSON</button>
    </div>
  </div>

  {/* Export Dropdown */}
  <div className="btn-group">
    <button
      className="btn btn-secondary dropdown-toggle export"
      type="button"
      id="exportDropdown"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      Export
    </button>
    <div className="dropdown-menu " aria-labelledby="exportDropdown">
      <button className="dropdown-item" onClick={() => handleExport('csv')}>CSV</button>
      <button className="dropdown-item" onClick={() => handleExport('plain-text')}>Plain Text</button>
      <button className="dropdown-item" onClick={() => handleExport('sql')}>SQL</button>
      <button className="dropdown-item" onClick={() => handleExport('json')}>JSON</button>
    </div>
  </div>
</div>

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

<ToastContainer position="top-right" autoClose={3000} />


        </div>

        
    );
}

export default Retrieve;
