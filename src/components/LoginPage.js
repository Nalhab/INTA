import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate();

    if (!initialized) {
        return <div>Loading...</div>;
    }

    const handleLogin = () => {
        keycloak.login();
    };

    return (
        <div>
            <h1>Login Page</h1>
            {!keycloak?.authenticated ? (
                <>
                    <p>Please log in to continue.</p>
                    <button onClick={handleLogin}>Login with Keycloak</button>
                </>
            ) : (
                <div>
                    <p>You're logged in!</p>
                    <button onClick={() => keycloak.logout()}>Logout</button>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
