import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation
import CartCard from './CartCard';
import ContinuousSpeechRecognition from './SpeechRecognition'; // Import the speech recognition component

const Cart = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found in localStorage');
        }

        // Fetch user details
        const userResponse = await axios.get('http://127.0.0.1:8000/query/check-auth', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(userResponse.data.username);
        setCurrentUserEmail(userResponse.data.email);

        // Fetch cart details
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

  const handleSearch = () => {
    // Implement search functionality based on the searchQuery
    console.log('Searching for:', searchQuery);
    // You can perform any action here based on the search query
  };

  const navigateBackToHomepage = () => {
    // Navigate back to the homepage
    navigate('/');
  };

  const deleteItem = async (itemNo) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found in localStorage');
      }

      // Get the title of the item at the specified index
      const itemTitle = cartItems[itemNo - 1].title;

      // Send a POST request to the backend to delete the item
      await axios.post('http://127.0.0.1:8000/query/deleteitem/', {
        title: itemTitle,
        email: currentUserEmail // Include the email of the current user
        // Add any other necessary data for deletion
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the cart items after successful deletion
      const updatedCartItems = cartItems.filter((item, index) => index !== (itemNo - 1));
      setCartItems(updatedCartItems);
    } catch (error) {
      console.error('Error deleting item:', error.message);
    }
  };

  const handleStop = (transcript) => {
    setSearchQuery(transcript);
  };

  const handleReset = () => {
    setSearchQuery('');
  };

  return (
    <div className="bg-white py-16 sm:py-16">
      <div className="mx-auto max-w-7xl px-12 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Recommendation</h2>
        </div>
        <ContinuousSpeechRecognition
          onSearch={handleSearch}
          onStop={handleStop}
          onReset={handleReset}
          setTranscript={setSearchQuery}
          navigateBack={navigateBackToHomepage} // Pass navigate function for "back to homepage" voice command
          deleteItem={deleteItem} // Pass deleteItem function for "delete item {itemno}" voice command
        />
        {/* Cart items rendering */}
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
