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
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2 className="text-white">Admin Reports</h2>

                <h4 className="mt-4 text-white">User Task Statistics (All Time)</h4>

                <div className="mb-3">
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_created")}>Most Created</button>
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_deleted")}>Most Deleted</button>
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_imported")}>Most Imported</button>
                    <button className="btn btn-outline-light me-2" onClick={() => handleFilterChange("most_exported")}>Most Exported</button>
                </div>

                <table className="table table-striped table-dark">
                    <thead>
                        <tr>
                            <th>Username</th>                           
                            <th>Total task created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={index}>
                                <td>{user.user__username || user.username}</td>
                                <td>{user.total || 1}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() =>
                                            navigate(`/todolist/all/${user.user__id}/all`)
                                        }
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AdminDashboard;
