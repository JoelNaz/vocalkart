import React from 'react';
import CartCard from './CartCard'; // Assuming the Card component is in the same directory
import Navbar from './Navbar';

const Cart = () => {
  const data = [
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, debitis?",
      tags: ["#Sneakers", "#Nike", "#Airmax"],
      colors: ["#FF0000", "#800080", "#FFA500"],
      sizes: ["8 UK", "9 UK", "10 UK"]
    },
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, debitis?",
      tags: ["#Sneakers", "#Nike", "#Airmax"],
      colors: ["#FF0000", "#800080", "#FFA500"],
      sizes: ["8 UK", "9 UK", "10 UK"]
    },
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, debitis?",
      tags: ["#Sneakers", "#Nike", "#Airmax"],
      colors: ["#FF0000", "#800080", "#FFA500"],
      sizes: ["8 UK", "9 UK", "10 UK"]
    },
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, debitis?",
      tags: ["#Sneakers", "#Nike", "#Airmax"],
      colors: ["#FF0000", "#800080", "#FFA500"],
      sizes: ["8 UK", "9 UK", "10 UK"]
    },
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, debitis?",
      tags: ["#Sneakers", "#Nike", "#Airmax"],
      colors: ["#FF0000", "#800080", "#FFA500"],
      sizes: ["8 UK", "9 UK", "10 UK"]
    },
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, debitis?",
      tags: ["#Sneakers", "#Nike", "#Airmax"],
      colors: ["#FF0000", "#800080", "#FFA500"],
      sizes: ["8 UK", "9 UK", "10 UK"]
    },
    {
      title: "Nike Airmax v2",
      imageUrl: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwxMTM4MTU1NXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, debitis?",
      tags: ["#Sneakers", "#Nike", "#Airmax"],
      colors: ["#FF0000", "#800080", "#FFA500"],
      sizes: ["8 UK", "9 UK", "10 UK"]
    },
    // Add more data objects as needed
  ];

  return (
    <div className="mx-auto max-w-7xl px-4">
    <h2 className="text-3xl font-bold mb-6">Recommendations</h2>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item, index) => (
        <CartCard 
          key={index}
          title={item.title}
          imageUrl={item.imageUrl}
          description={item.description}
          tags={item.tags}
          colors={item.colors}
          sizes={item.sizes}
        />
      ))}
    </div>
  </div>
);
};

export default Cart;