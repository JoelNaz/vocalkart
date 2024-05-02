import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const menuItems = [
    {
        name: 'Home',
        href: '#home',
    },
    {
        name: 'About',
        href: '#about',
    },
    {
        name: 'Contact',
        href: '#contact',
    },
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [token] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                if (!token) {
                    throw new Error('Token not found in localStorage');
                }

                const response = await axios.get('http://127.0.0.1:8000/query/check-auth', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setCurrentUser(response.data.username);
            } catch (error) {
                console.error('Error fetching user details:', error.message);
                setCurrentUser(null);
            }
        };

        fetchUserDetails();
    }, [token]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };



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
            
            // Update currentUser state to null
            setCurrentUser(null);
            
            toast.success("Logout successfully!");
            navigate('/');
            
            // Redirect to the home page or handle navigation as needed
        } catch (error) {
            console.error('Error during logout:', error.message);
            toast.error("An error occurred during sign-out. Please try again.");
            // Handle logout error
        }
    };
    
    


    return (
        <nav className='z-50'>
            <div className="w-full bg-transparent">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center space-x-2">
                        <span>
                            <svg
                                width="30"
                                height="30"
                                viewBox="0 0 50 56"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Your logo SVG path here */}
                            </svg>
                        </span>
                        <span className="font-bold text-xl">VocalCart</span>
                    </div>
                    <div className="hidden grow items-start lg:flex">
                        <ul className="ml-12 inline-flex space-x-8">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        className="text-sm font-semibold text-black hover:text-blue-600"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="hidden space-x-2 lg:block">
                        {currentUser ? (
                            <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-md bg-transparent px-3 py-2 text-sm text-black hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                            Logout
                        </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="rounded-md bg-transparent px-3 py-2 text-sm  text-black  hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                >
                                    <Link to="/register">Sign Up</Link>
                                </button>
                                <button
                                    type="button"
                                    className="rounded-md border border-black px-3 py-2 text-sm  text-black hover:bg-black/10 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                >
                                    <Link to="/login">Log In</Link>
                                </button>
                            </>
                        )}
                    </div>
                    <div className="lg:hidden">
                        <Menu onClick={toggleMenu} className="h-6 w-6 cursor-pointer" />
                    </div>
                    {isMenuOpen && (
                        <div className="absolute inset-x-0 top-0 z-50 origin-top-right transform p-2 transition lg:hidden bg">
                            {/* Mobile menu content */}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
