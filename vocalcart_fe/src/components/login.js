import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/query/login/', {
                email,
                password,
            });

            // Assuming the token is returned in the 'refresh_token' field
            const token = response.data.token;
            console.log(token)

            // Store the token in localStorage
            localStorage.setItem('token', token);

            // Handle successful login, maybe redirect to another page
            console.log('Login successful!');
        } catch (error) {
            console.error('Error during login:', error.message);
            // Handle login error
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={handleLogin}>Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>.
            </p>
        </div>
    );
};

export default Login;
