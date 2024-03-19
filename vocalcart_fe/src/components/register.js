// src/components/Register.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [number, setNumber] = useState('');

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/query/register/', {
                email,
                password,
                username,
                number,
            });
            console.log(response.data);
            // Handle successful registration, maybe redirect to login page
        } catch (error) {
            console.error('Error during registration:', error.message);
            // Handle registration error
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label>Number:</label>
                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} />
                <button type="button" onClick={handleRegister}>Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login here</Link>.
            </p>
        </div>
    );
};

export default Register;
