import React, { useState } from "react";
import axios from "axios";
import {useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SelectChoice = () => {
    // State to store selected choices
    const [selectedChoices, setSelectedChoices] = useState([]);
    const navigate = useNavigate();


    // Function to handle selection of choices
    const handleSelect = (item) => {
        if (selectedChoices.includes(item)) {
            // If actor is already selected, remove it from the list
            setSelectedChoices(selectedChoices.filter(choice => choice !== item));
        } else if (selectedChoices.length < 2) {
            // If less than 2 choices are selected, add the actor to the list
            setSelectedChoices([...selectedChoices, item]);
        } else {
            // If already 2 choices are selected, do nothing
            alert("You can select only 2 options");
        }
    };

    // Function to handle sending selected choices to the backend
    const handleSubmit = () => {
        // Send selected choices to the backend (replace 'backend_url' with your actual backend URL)
        axios.post('backend_url', { choices: selectedChoices })
            .then(response => {
                console.log(response.data);
                toast.success("Selected choice successfully!");
                navigate("/login");
                // Handle success if needed
                
            })
            .catch(error => {
                console.error("Error during selecting choice:", error.message);
                toast.error("Error during selecting choice. Please try again.");
                // Handle error if needed
            });
    };

    return (
        <div className="max-w-md mx-auto my-40 items-center justify-center p-4 border border-gray-300 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Select Your Interest</h2>
            <div className="space-y-2">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        value="Electronics"
                        checked={selectedChoices.includes("Electronics")}
                        onChange={() => handleSelect("Electronics")}
                        className="mr-2"
                    />
                    Electronics
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        value="Fashion"
                        checked={selectedChoices.includes("Fashion")}
                        onChange={() => handleSelect("Fashion")}
                        className="mr-2"
                    />
                    Fashion
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        value="Books"
                        checked={selectedChoices.includes("Books")}
                        onChange={() => handleSelect("Books")}
                        className="mr-2"
                    />
                    Books
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        value="Movies"
                        checked={selectedChoices.includes("Movies")}
                        onChange={() => handleSelect("Movies")}
                        className="mr-2"
                    />
                    Movies
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        value="grocery"
                        checked={selectedChoices.includes("grocery")}
                        onChange={() => handleSelect("grocery")}
                        className="mr-2"
                    />
                    Grocery
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        value="furniture"
                        checked={selectedChoices.includes("furniture")}
                        onChange={() => handleSelect("furniture")}
                        className="mr-2"
                    />
                    Furniture
                </label>
            </div>
            {/* Display selected choices */}
            <p className="mt-4">Selected Choices: {selectedChoices.join(", ")}</p>
            {/* Button to submit selected choices */}
            <button
                onClick={handleSubmit}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                disabled={selectedChoices.length !== 2} // Disable button if not exactly 2 choices selected
            >
                Submit
            </button>
        </div>
    );
};

export default SelectChoice;
