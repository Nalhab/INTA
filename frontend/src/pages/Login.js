import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import UserList from '../components/UserList';

const Login = () => {
    const [token, setToken] = useState(null);

    return (
        <div>
            {token ? <UserList token={token} /> : <LoginForm setToken={setToken} />}
        </div>
    );
};

export default Login;
