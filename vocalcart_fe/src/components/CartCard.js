import React from "react";

const CartCard = ({ title, imageUrl, rating, prize }) => {
  return (
    <div className="rounded-md border w-10/12 bg-white">
      <img
        src={imageUrl}
        alt={title}
        className="aspect-[16/9] w-full rounded-md md:aspect-auto md:h-[300px] lg:h-[200px] p-5"

      />
      
      <div className="p-4">
        <h1 className="inline-flex items-center text-lg font-semibold">
          {title}
        </h1>
                <p className="mt-3 text-md text-gray-600">
                  Price: {prize}
                </p>
                <p className="mt-3 text-md text-gray-600">
                  Rating: {rating}
                </p>
        {/* <div className="mt-5 flex items-center space-x-2">
          <span className="block text-sm font-semibold">Size : </span>
          {sizes.map((size, index) => (
            <span
              key={index}
              className="block cursor-pointer rounded-md border border-gray-300 p-1 px-2 text-xs font-medium"
            >
              {size}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-sm bg-black px-2 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Add to Cart
        </button> */}
      </div>
    </div>
  );
};

export default CartCard;
