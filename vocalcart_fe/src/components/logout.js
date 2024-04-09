import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useNavigate } from 'react-router-dom';


const Logout = () => {
    const navigate=useNavigate()
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
    
            if (!token) {
                console.error('No token found. User may not be authenticated.');
                return;
            }
    
            const response = await axios.post('http://127.0.0.1:8000/query/logout/', { token });
            console.log(response.data);
            localStorage.removeItem('token');
            console.log('Logout successful!');
            navigate('/')
            toast.success("Logout successfully!");
            
            // Redirect to the login page or handle navigation as needed
        } catch (error) {
            console.error('Error during logout:', error.message);
            toast.error("An error occurred during sign-in. Please try again.");
            // Handle logout error
        }
    };

    return (
        <button type="button" onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;
