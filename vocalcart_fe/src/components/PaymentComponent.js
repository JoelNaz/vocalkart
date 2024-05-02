import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentComponent = () => {
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [token] = useState(localStorage.getItem('token'));
    const [amount, setAmount] = useState(0);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [razorpayOrderId, setRazorpayOrderId] = useState('');
    var Order;

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
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const { data } = response;
            setOrderId(data.order_id);
            // console.log('data:', data);
            // console.log('data.amount:', data.amount);
            Order = data.order_id;
            // console.log('Order:', Order);
            setAmount(data.amount);
            setRazorpayOrderId(data.order_id);

            // Initialize Razorpay after orderId is set
            // initializeRazorpay();
        } catch (error) {
            console.error('Error initiating payment:', error);
            setError('Error initiating payment');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadRazorpayScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = initializeRazorpay; // Call initializeRazorpay when the script is loaded
            script.onerror = handleScriptError;
            document.body.appendChild(script);
        };
        const initializeRazorpay = () => {
            if (!window.Razorpay) {
                console.error('Razorpay script loaded, but window.Razorpay is not available ');
                console.log('Order:', orderId);
                return;
            }
        
            // Initialize Razorpay with the correct options
            const options = {
                key: "rzp_test_WWKOoelBNSKI67",
                currency: "INR",
                name: "VocalCart",
                description: "Test Transaction",
                order_id: orderId,
                prefill: {
                    name: "Nimish Patil",
                    email: "patilnr27@gmail.com",
                    contact: "9137659395"
                },
                notes: {
                    address: "Razorpay Corporate Office"
                },
                theme: {
                    color: "#3399cc"
                }
            };
        
            const rzp1 = new window.Razorpay(options);
        
            rzp1.on('payment.failed', function (response) {
                // Handle payment failed
            });
        
            document.getElementById('rzp-button1').addEventListener('click', function (e) {
                rzp1.open();
                e.preventDefault();
            });
        };
        
        const handleScriptError = (event) => {
            console.error('Error loading Razorpay script:', event);
        };
        
        loadRazorpayScript();
    }, []);
    
    

    return (
        <div>
            <p>Total Amount: {amount}</p>
            <button id='rzp-button1' onClick={initiatePayment} disabled={isLoading}>
                Initiate Payment
            </button>
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
