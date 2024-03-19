import React from 'react';
import axios from 'axios';

const Logout = () => {
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
            
            // Redirect to the login page or handle navigation as needed
        } catch (error) {
            console.error('Error during logout:', error.message);
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
