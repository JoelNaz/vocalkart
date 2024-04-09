import React from "react";

const CartCard = ({ title, imageUrl, description, tags, colors, sizes }) => {
  return (
    <div className="rounded-md border">
      <img
        src={imageUrl}
        alt={title}
        className="aspect-[16/9] w-full rounded-md md:aspect-auto md:h-[300px] lg:h-[200px]"
      />
      <div className="p-4">
        <h1 className="inline-flex items-center text-lg font-semibold">
          {title}
        </h1>
        <p className="mt-3 text-sm text-gray-600">{description}</p>
        <div className="mt-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="mb-2 mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-900"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <span className="block text-sm font-semibold">Colors : </span>
          {colors.map((color, index) => (
            <span
              key={index}
              className="block h-4 w-4 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: color }}
            ></span>
          ))}
        </div>
        <div className="mt-5 flex items-center space-x-2">
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
        </button>
      </div>
    </div>
  );
};

export default CartCard;
