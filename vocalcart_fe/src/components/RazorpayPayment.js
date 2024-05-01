import React, { useEffect } from 'react';

const RazorpayPayment = () => {
    useEffect(() => {
        const loadRazorpayScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
            script.onload = initializeRazorpay;
            script.onerror = handleScriptError;
        };

        const initializeRazorpay = () => {
            if (!window.Razorpay) {
                console.error('Razorpay script loaded, but window.Razorpay is not available.');
                return;
            }

            const options = {
                "key": "rzp_test_WWKOoelBNSKI67", // Replace "your_api_key" with your actual Razorpay API key
                "currency": "INR",
                "name": "VocalCart",
                "description": "Test Transaction",
                "order_id": "order_O5KorOQJrdiCXo",
                "prefill": { // We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
                    "name": "Nimish Patil", // your customer's name
                    "email": "patilnr27@gmail.com", 
                    "contact": "9137659395"  // Provide the customer's phone number for better conversion rates 
                },
                "notes": {
                    "address": "Razorpay Corporate Office"
                },
                "theme": {
                    "color": "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);

            rzp1.on('payment.failed', function (response){
                // Handle payment failed
            });

            document.getElementById('rzp-button1').addEventListener('click', function(e) {
                rzp1.open();
                e.preventDefault();
            });

            // Cleanup
            return () => {
                document.getElementById('rzp-button1').removeEventListener('click', function(e) {
                    rzp1.open();
                    e.preventDefault();
                });
            };
        };

        const handleScriptError = (event) => {
            console.error('Error loading Razorpay script:', event);
            // You can perform additional error handling here
        };

        loadRazorpayScript();
    }, []);

    return (
        <div>
            <button id="rzp-button1">Pay</button>
        </div>
    );
};

export default RazorpayPayment;
