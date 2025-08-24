import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./Navbar";
import axios from "axios"; // Make sure axios is installed and imported

function AdminDashboard() {
    const navigate = useNavigate();
    const [reports, setReports] = useState({});
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterType, setFilterType] = useState("most_created");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token"); // or wherever you're storing the auth token
            const response = await axios.get("http://127.0.0.1:8000/reports/", {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setReports(response.data);
            console.log("Admin reports fetched:", response.data);
            setFilteredUsers(response.data.most_created || []);
            setFilterType("most_created");
            console.log(filteredUsers);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching admin reports:", error);
        }
    };

    const handleFilterChange = (type) => {
        setFilterType(type);
        if (type === "most_created") setFilteredUsers(reports.most_created || []);
        if (type === "most_deleted") setFilteredUsers(reports.most_deleted || []);
        if (type === "most_imported") setFilteredUsers(reports.most_imported || []);
        if (type === "most_exported") setFilteredUsers(reports.most_exported || []);
        if (type === "by_date") setFilteredUsers(reports.users_by_date || []);
    };

    useEffect(() => {
        fetchReports();
    }, []);

     // Pagination calculations
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2 className="text-white">Admin Reports</h2>

                <h4 className="mt-4 text-white">User Task Statistics (All Time)</h4>

                <div className="mb-3">
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("by_date")}>By Date Joined</button>
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_created")}>Most Created</button>
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_deleted")}>Most Deleted</button>
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_imported")}>Most Imported</button>
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_exported")}>Most Exported</button>
                </div>

                <table className="table table-striped table-dark">
                    <thead>
                        <tr>
                            <th>Username</th>                           
                            {filterType === "by_date" ? <th>Date Joined</th> : <th>Total task created</th>}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={index}>
                                <td>{user.user__username || user.username}</td>
                                {filterType === "by_date" ? (
                <td>{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : ""}</td>
            ) : (
                <td>{user.total !== undefined ? user.total : 0}</td>
            )}
            <td>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() =>
                                            navigate(`/todolist/user/${user.user__id}`)
                                        }
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination controls */}
                <nav>
                    <ul className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li
                                key={i + 1}
                                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AdminDashboard;
