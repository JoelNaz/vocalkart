import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentComponent = () => {
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [token] = useState(localStorage.getItem('token'));
    const [amount,setAmount] = useState(0);
    const [currentUserEmail, setCurrentUserEmail] = useState(null); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [razorpayOrderId, setRazorpayOrderId] = useState('');


    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                if (!token) {
                    throw new Error('Token not found in localStorage');
                }

                const userResponse = await axios.get('http://127.0.0.1:8000/query/check-auth', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCurrentUserEmail(userResponse.data.email);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setError('Error fetching cart items');
                setIsLoggedIn(false); 
            }
        };

        fetchCartItems();
    }, []);
    const initiatePayment = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                'http://127.0.0.1:8000/query/initiate_payment/',
                { current_user_email: currentUserEmail },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const { data } = response;
            setOrderId(data.order_id);
            setAmount(data.amount);
            setRazorpayOrderId(data.order_id);
        } catch (error) {
            console.error('Error initiating payment:', error);
            setError('Error initiating payment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <p>Total Amount: {amount}</p>
            <button onClick={initiatePayment} disabled={isLoading}>Initiate Payment</button>
            {orderId && (
                <div>
                    <p>Order ID: {orderId}</p>
                </div>
            )}
            {error && <p>Error: {error}</p>}
        </div>
    );
};

export default PaymentComponent;
