import React, { useState } from 'react';
import { loginUser } from '../api/auth';

const LoginForm = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            setToken(response.data.token); // Stocke le token dans le parent
            setMessage('Login successful!');
        } catch (error) {
            setMessage('Error logging in');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
            <p>{message}</p>
        </form>
    );
};

export default LoginForm;
