import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CartCard from './CartCard';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Link } from "react-router-dom";


const Cart = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Initialize SpeechRecognition
  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found in localStorage');
        }

        const userResponse = await axios.get('http://127.0.0.1:8000/query/check-auth', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(userResponse.data.username);
        setCurrentUserEmail(userResponse.data.email);
        setIsLoggedIn(true);

        const cartResponse = await axios.post('http://127.0.0.1:8000/query/cartdetails/', {
          current_user_email: userResponse.data.email
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCartItems(cartResponse.data);
      } catch (error) {
        console.error('Error fetching user details:', error.message);
        setCurrentUser(null);
        setIsLoggedIn(false); 
      }
    };

    fetchUserDetails();
  }, []);

  const navigateBackToHomepage = () => {
    navigate('/');
  };

  const deleteItem = async (itemNo) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found in localStorage');
      }

      const item = cartItems[itemNo - 1];
      const email = currentUserEmail; // Current user's email
      const title = item.title; // Title of the item to be deleted

      await axios.post('http://127.0.0.1:8000/query/delete_item/', {
        email: email,
        title: title
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const updatedCartItems = cartItems.filter((item, index) => index !== (itemNo - 1));
      setCartItems(updatedCartItems);
    } catch (error) {
      console.error('Error deleting item:', error.message);
    }
  };

  useEffect(() => {
    let timeoutId;
  
    // Start processing voice commands only after the trigger phrase
    if (
      transcript.toLowerCase().includes('delete item number') || 
      transcript.toLowerCase().includes('back to homepage') || 
      transcript.toLowerCase().includes('proceed to checkout')
    ) {
      // Clear previous timeout if exists
      clearTimeout(timeoutId);
  
      // Set a timeout to wait for additional speech input
      timeoutId = setTimeout(() => {
        handleCommand(transcript);
        resetTranscript(); // Reset the transcript after processing the command
      }, 2000); // 2 seconds timeout
    }
  }, [transcript]); // Trigger the effect whenever the transcript changes
  
  const handleCommand = (command) => {
    if (command.startsWith('delete item number')) {
      const indexString = command.replace('delete item number', '').trim();
      const index = parseInt(indexString);
      if (!isNaN(index) && index >= 1 && index <= cartItems.length) {
        deleteItem(index);
      } else {
        console.error('Invalid item index:', index);
      }
    } else if (command === 'back to homepage') {
      navigateBackToHomepage();
    } else if (command === 'proceed to checkout') {
      proceedToCheckout();
    }
  };
  
  const proceedToCheckout = () => {
    navigate('/payment');
    // Implement logic to proceed to checkout here
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += parseFloat(item.price);
    });
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
    return formatter.format(totalPrice);
  };

  return (
    <div className=" border-r-indigo-100 py-16 sm:py-16 ">
  <div className="mx-auto max-w-7xl px-12 lg:px-8">
    {isLoggedIn ? (
      <div>

      <div className="bg-gray-100 p-10 rounded-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <h2 className="text-4xl font-bold text-black text-center">Cart</h2>
          <div className=' mt-20'>
          <div className=" flex items-center justify-center gap-x-2">
          {/* Buttons for Speech Recognition */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                SpeechRecognition.stopListening();
                setIsListening(false);
              } else {
                SpeechRecognition.startListening();
                setIsListening(true);
              }
            }}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            {isListening ? 'Stop' : 'Start'}
          </button>
          <button
            type="button"
            onClick={resetTranscript}
            disabled={!transcript}
            className="rounded-md border border-black px-4 py-2 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Reset
          </button>
        </div>
        <p className="text-center text-gray-600 mt-4">{transcript}</p>
        </div>
        </div>
        <div className="mt-10 w-full md:w-2/3 lg:mt-0 lg:w-1/2">
          <div className="flex lg:justify-center">
            <div className="flex w-full max-w-md flex-col space-y-4">
              <div
              className=" w-3/4 rounded-md border border-black bg-transparent px-3 py-2 text-sm font-semibold text-black"
              > 
                <p className="text-lg font-semibold p-1 ml-7">Total Items: <span className="text-lg font-semibold">{cartItems.length}</span></p>
                
              </div>
              <div
              className="w-3/4 rounded-md border border-green-600 px-3 py-2 text-sm font-semibold text-green-500"
              >
                <p className="text-lg font-semibold p-1 ml-7">Total Amount:  <span className="text-lg font-semibold ">{calculateTotalPrice()}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        
        
        {/* Display cart items */}
        <div className="mx-auto mt-5 pl-5 grid max-w-xl grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-16 border-t border-gray-200 pt-10 sm:mt-10 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 bg-sky-100 rounded-md p-5">
          {cartItems.map((item, index) => (
            <CartCard
              key={index}
              title={item.title}
              imageUrl={item.image_src}
              prize={item.price}
              rating={item.rating}
            />
          ))}
        </div>
      </div>
    ) : (
      // If user is not logged in, show login message
      <p className="text-center text-lg mt-2">Please {""}
        <Link
          to="/login"
          className="font-semibold text-blue-700 transition-all duration-200 hover:underline"
        >
          login
        </Link> to view your cart.
      </p>
    )}
  </div>
</div>
  );
};

export default Cart;
