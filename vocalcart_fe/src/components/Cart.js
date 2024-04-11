import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CartCard from './CartCard';

const Cart = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [cartItems, setCartItems] = useState([]);

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

  return (
    <div className="bg-white py-16 sm:py-16">
      <div className="mx-auto max-w-7xl px-12 lg:px-8">
        {/* Cart items rendering */}
        <div className="mx-auto mt-10 pl-5 grid max-w-xl grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {cartItems.map((item, index) => (
            <CartCard
              key={index}
              title={item.title}
              imageUrl={item.image_url}
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
