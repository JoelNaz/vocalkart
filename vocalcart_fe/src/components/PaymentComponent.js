import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PaymentComponent = () => {
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token] = useState(localStorage.getItem("token"));
  const [amount, setAmount] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState("");

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!token) {
          throw new Error("Token not found in localStorage");
        }

        const userResponse = await axios.get(
          "http://127.0.0.1:8000/query/check-auth",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCurrentUserEmail(userResponse.data.email);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError("Error fetching cart items");
        setIsLoggedIn(false);
      }
    };

    fetchCartItems();
  }, []);

  const initiatePayment = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/query/initiate_payment/",
        { current_user_email: currentUserEmail },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { data } = response;
      setOrderId(data.order_id);
      setAmount(data.amount);
      setRazorpayOrderId(data.order_id);
      console.log("Order_id:",data.order_id);
      loadRazorpayScript(data.order_id); // Pass the order ID to the script loading function
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError("Error initiating payment");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = (orderId) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => handleScriptLoad(orderId);
    script.onerror = handleScriptError;
    document.body.appendChild(script);
  };

  const handleScriptLoad = (orderId) => {
    if (window.Razorpay) {
      initializeRazorpay(orderId);
    } else {
      console.error(
        "Razorpay script loaded, but window.Razorpay is not available"
      );
    }
  };

  const handleScriptError = (event) => {
    console.error("Error loading Razorpay script:", event);
  };

  const initializeRazorpay = (orderId) => {
    if (!window.Razorpay) {
      console.error(
        "Razorpay script loaded, but window.Razorpay is not available"
      );
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
        // name: "Nimish Patil",
        // email: "patilnr27@gmail.com",
        // contact: "9137659395",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new window.Razorpay(options);

    rzp1.on("payment.failed", function (response) {
      // Handle payment failed
    });

    document
      .getElementById("rzp-button1")
      .addEventListener("click", function (e) {
        rzp1.open();
        e.preventDefault();
      });
  };

  return (
    <div>
      {isLoggedIn ? (
<div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-2/5 h-full bg-white p-4 rounded-md shadow-md flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 pt-5">Payment</h2>
        <div className="w-full border-b-2"></div>
        
        {razorpayOrderId && (
            <div className="mt-4">
                <p className="text-black mt-7">Total Amount: <span className="text-green-700 font-semibold">₹{amount}</span></p>
                {/* <p className="text-black mt-7">Order ID: <span className="font-semibold"> {razorpayOrderId}</span></p> */}
            </div>
        )}
        <button
            id='rzp-button1'
            onClick={initiatePayment}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md mt-10 mb-2"
        >
            Initiate Payment
        </button>
        {error && <p className="text-red-500 mt-4">Error: {error}</p>}
    </div>
</div>

    ) : (
        <p className="text-center text-lg mt-16">
        Please{" "}
        <Link
            to="/login"
            className="font-semibold text-blue-700 transition-all duration-200 hover:underline"
        >
            login
        </Link>{" "}
        to do payment.
        </p>
    )}
    </div>
);
};

export default PaymentComponent;
