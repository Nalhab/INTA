import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../api/auth';

const UserList = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await fetchUsers(token);
                setUsers(response.data);
            } catch (error) {
                setError('Error fetching users');
                console.error(error);
            }
        };
        getUsers();
    }, [token]);

    return (
        <div>
            <h2>User List</h2>
            {error && <p>{error}</p>}
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
