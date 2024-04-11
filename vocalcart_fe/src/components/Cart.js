import React from 'react';
import CartCard from './CartCard'; // Assuming the Card component is in the same directory
import Navbar from './Navbar';

const Cart = () => {
  const data = [
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      rating: "4 out of 5",
      prize: ["800 rs"]
    },
  ];

  return (
    <div className="bg-white py-16 sm:py-16">
    <div className="mx-auto max-w-7xl px-12 lg:px-8">
      <div className="mx-auto max-w-xl lg:mx-0">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Recommendations</h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Based on your recent activity and purchases
        </p>
      </div>
    {/* <div className="mx-auto max-w-7xl px-4"> */}
    {/* <h2 className="text-3xl font-bold mb-6">Recommendations</h2> */}
    <div className="mx-auto mt-10 pl-5 grid max-w-xl grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
      {data.map((item, index) => (
        <CartCard 
          key={index}
          title={item.title}
          imageUrl={item.imageUrl}
          prize={item.prize}
          rating={item.rating}
        />
      ))}
    </div>
  </div>
  </div>
  // </div>
);
};

export default Cart;