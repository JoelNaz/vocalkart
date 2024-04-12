// PaymentComponent.js
import React, { useState } from 'react';
import axios from 'axios';
const token = localStorage.getItem('token');

const PaymentComponent = ()=>{
    const [amount, setAmount] = useState('');
    

    const initiatePayment = async () => {
        try {
            const formData = new FormData();
            formData.append('amount', amount);

            const response = await axios.post(
                'http://127.0.0.1:8000/query/initiate_payment/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const { data } = response;
            // Redirect to payment page using data received from backend
            window.location.href = `https://api.razorpay.com/v1/checkout/${data.order_id}`;
        } catch (error) {
            console.error('Error initiating payment:', error);
        }
    };

    return (
        <div>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button onClick={initiatePayment}>Pay</button>
        </div>
    );
}

export default PaymentComponent;
