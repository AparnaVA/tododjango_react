import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function UserTasks() {
    const { userId } = useParams();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        axios.get(`/todolist/user/${userId}`)
            .then(res => setTasks(res.data))
            .catch(err => console.error(err));
    }, [userId]);

    return (
        <div>
            <h2>Tasks for User ID: {userId}</h2>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id}>
                            <td>{task.id}</td>
                            <td>{task.name}</td>
                            <td>{task.is_completed ? 'Completed' : 'Pending'}</td>
                            <td>{task.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
