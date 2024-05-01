import React from 'react';

const CheckoutPage = () => {
  // Dummy data for the checkout items
  const checkoutItems = [
    { id: 1, name: 'Product 1', price: 10 },
    { id: 2, name: 'Product 2', price: 15 },
    { id: 3, name: 'Product 3', price: 20 },
  ];

  // Calculate the total price of all items in the cart
  const totalPrice = checkoutItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="container">
      <h2 className="text-3xl font-bold mb-8">Checkout</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Render each checkout item */}
        {checkoutItems.map((item) => (
          <div key={item.id} className="border p-4 rounded-md">
            <h3 className="font-semibold">{item.name}</h3>
            <p>${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      {/* Display total price */}
      <div className="mt-8">
        <h3 className="font-semibold">Total: ${totalPrice.toFixed(2)}</h3>
      </div>
      {/* Place order button */}
      <div className="mt-8">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
