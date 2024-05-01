import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CartCard from './CartCard';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


const Cart = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [cartItems, setCartItems] = useState([]);
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
    navigate('/checkout');
    // Implement logic to proceed to checkout here
  };

  return (
    <div className="bg-white py-16 sm:py-16">
      <div className="mx-auto max-w-7xl px-12 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Recommendation</h2>
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-2">
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
        <div className="mx-auto mt-5 pl-5 grid max-w-xl grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-16 border-t border-gray-200 pt-10 sm:mt-10 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
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
    </div>
  );
};

export default Cart;
