import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContinuousSpeechRecognition from '../components/SpeechRecognition'; // Assuming this is the correct path
import Navbar from '../components/Navbar';
import handleFilter from '../components/VoiceCommands';
//import handleVoiceCommand from '../components/VoiceCommands';

axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN';
axios.defaults.xsrfCookieName = 'csrftoken';


const Home = () => {
  const [transcript, setTranscript] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [listening, setListening] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [recommendationsRequested, setRecommendationsRequested] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [amazonRecommendations, setAmazonRecommendations] = useState([]);
  const [flipkartRecommendations, setFlipkartRecommendations] = useState([]);
  const [sortedRecommendations, setSortedRecommendations] = useState([]);

  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  console.log(token)

  useEffect(() => {
    // Fetch user details or check authentication status
    const fetchUserDetails = async () => {
      try {
        
        if (!token) {
          throw new Error('Token not found in localStorage');
        }
  
        const response = await axios.get('http://127.0.0.1:8000/query/check-auth', {
          headers: {
            Authorization: `Bearer ${token}` // Attach the token in the Authorization header
          }
          
        });
        console.log(response.data);
        
        setCurrentUser(response.data.username);
        setCurrentUserEmail(response.data.email)
        
      } catch (error) {
        console.error('Error fetching user details:', error.message);
        setCurrentUser(null);
      }
    };
  
    fetchUserDetails();
  }, []);

  const handleSearch = async (query) => {
    if (!query) {
      console.error('Search query is undefined or empty');
      return;
    }
  
    console.log('Handling search query:', query);
  
    try {
      const [amazonResponse, flipkartResponse] = await Promise.all([
        axios.post(
          'http://127.0.0.1:8000/query/search_query_amazon/',
          { query, currentUserEmail },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ),
        //axios.post(
          //'http://127.0.0.1:8000/query/search_query_flipkart/',
          //{ query }
        //).catch(error => {
          //console.error('Error fetching Flipkart results:', error.message);
          //return { data: { results: [] } }; // Return empty results if there's an error
        //}),
      ]);
  
      const amazonResults = amazonResponse.data.results || [];
      const flipkartResults = (flipkartResponse && flipkartResponse.data.results) || []; // Check if flipkartResponse exists
  
      let combinedResults = [];
  
      if (amazonResults.length > 0) {
        combinedResults = [...amazonResults];
      }
  
      if (flipkartResults.length > 0) { // Check if flipkartResults is available
        combinedResults = [...combinedResults, ...flipkartResults];
      }
  
      const sortedResults = combinedResults.sort((a, b) => {
        const ratingA = parseFloat(a.rating.split(' ')[0]);
        const ratingB = parseFloat(b.rating.split(' ')[0]);
        return ratingB - ratingA;
      });
  
      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }


useEffect(() => {
  // Start processing voice commands only after the trigger phrase
  if (!recommendationsRequested && transcript.toLowerCase().includes('show recommendations')) {
    // Set recommendationsRequested to true to prevent further requests
    setRecommendationsRequested(true);

    // Call the function to handle the "show recommendations" command
    const fetchRecommendations = async () => {
      try {
        const response = await handleVoiceCommand('show recommendations', currentUserEmail);
        console.log('Response:', response);
        console.log('Data:', response.data);
        
        // Access the recommendations directly from the response data
        const amazonRecommendations = response.Amazon ? Object.values(response.Amazon) : [];
        const flipkartRecommendations = response.Flipkart ? Object.values(response.Flipkart) : [];
        console.log('Amazon Recommendations:', amazonRecommendations);
        console.log('Flipkart Recommendations:', flipkartRecommendations);
        
        // Merge recommendations from both sources
        const allRecommendations = [...amazonRecommendations.flat(), ...flipkartRecommendations.flat()];

        // Sort all recommendations based on ratings
        const sortedRecommendations = allRecommendations.sort((a, b) => {
          const ratingA = parseFloat(a.rating.split(' ')[0]);
          const ratingB = parseFloat(b.rating.split(' ')[0]);
          return ratingB - ratingA;
        });
        
        console.log('Sorted Recommendations:', sortedRecommendations);
        
        // Set sorted recommendations state variable
        setSortedRecommendations(sortedRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();

    // Reset the transcript after processing the command
    setTranscript('');

    // Stop listening after processing the command
    setListening(false);
  }
}, [transcript, currentUserEmail, recommendationsRequested]);



const handleVoiceCommand = async (command, currentUserEmail) => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    const response = await axios.post(
      'http://127.0.0.1:8000/query/recommendations/',
      { currentUserEmail },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    //console.log('Recommendations:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
};




  const handleStop = (finalTranscript) => {
    // Do something with the final transcript if needed
    console.log('Final Transcript:', finalTranscript);
  
    // Extracting the index from the transcript (assuming it contains a number)
    const indexMatch = finalTranscript.match(/\d+/);
    if (indexMatch) {
      const index = parseInt(indexMatch[0], 10);
      if (index >= 0 && index < searchResults.length) {
        setSelectedItem(searchResults[index]);
        // Speak the selected item's title
        speakText(searchResults[index].title);
        // Reset the transcript after processing the command
        setTranscript('');
      }
    }
  
    // Reset the transcript after processing the command
    setTranscript('');
  
    // Stop listening after processing the command
    setListening(false);
  };
  

  useEffect(() => {
    // Clear the transcript and stop listening when resetting
    if (!listening) {
      setTranscript('');
    }
  }, [listening]);



  const speakText = (text) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    // Reset the transcript and stop listening when resetting
    setTranscript('');
    setListening(false);

    // Handle reset logic if needed
    setSelectedItem(null);
  };

  useEffect(() => {
    let timeoutId;
    
    // Start processing voice commands only after the trigger phrase
    if (transcript.toLowerCase().includes('search query')) {
      // Clear previous timeout if exists
      clearTimeout(timeoutId);
  
      // Set a timeout to wait for additional speech input
      timeoutId = setTimeout(() => {
        const searchQueryCommand = /search query\s(.+)/i;
        const match = transcript.match(searchQueryCommand);
        if (match && !searchInitiated) {
          const query = match[1].trim();
          // Set searchInitiated to true to prevent further search calls
          setSearchInitiated(true);
          // Handle the search query (e.g., send a request to your backend)
          handleSearch(query);
          
          // Reset the transcript after processing the command
          setTranscript('');
  
          // Stop listening after processing the command
          setListening(false);
        }
      }, 2000); // Adjust the timeout duration as needed
    }
  
    // Clean up the timeout on component unmount or when transcript changes
    return () => clearTimeout(timeoutId);
  }, [transcript, searchInitiated]);


  useEffect(() => {
    // Start processing voice commands only after the trigger phrase
    if (transcript.toLowerCase().includes('filter by')) {
      console.log('Filter command detected:', transcript);
      const commandMatch = transcript.match(/filter by (price|rating)/i);
      if (commandMatch) {
        const filterType = commandMatch[1].toLowerCase();
        console.log('Filter type detected:', filterType);
        
        // Call the function to handle the filter by price or filter by rating command
        const handleFilterByType = async () => {
          try {
            // Perform the filter operation only if it hasn't been initiated yet
            if (!searchInitiated) {
              setSearchInitiated(true); // Set searchInitiated to true to prevent further filter calls
              const filteredResults = await handleFilter(filterType, searchResults, sortedRecommendations);
              console.log(`Filtered by ${filterType} results:`, filteredResults);
              // Update the state with the filtered results
              if (filterType === 'price') {
                setSearchResults(filteredResults);
              } else if (filterType === 'rating') {
                setSortedRecommendations(filteredResults);
              }
            }
          } catch (error) {
            console.error(`Error filtering by ${filterType}:`, error);
          }
        };
        
        handleFilterByType();

        // Reset the transcript after processing the command
        setTranscript('');

        // Stop listening after processing the command
        setListening(false);
      }
    }
  }, [transcript, searchResults, sortedRecommendations, searchInitiated]);
  
  useEffect(() => {
    // Start processing voice commands only after the trigger phrase
    if (transcript.toLowerCase().includes('select result')) {
      // Extract the index from the transcript (assuming it contains a number)
      const indexMatch = transcript.match(/\d+/);
      if (indexMatch && selectedItem !== null) {
        const index = parseInt(indexMatch[0], 10);
        if (index >= 0 && index < searchResults.length) {
          // Speak the confirmation message
          speakText(`You have selected ${searchResults[index].title}`);
          
          // Reset the transcript after processing the command
          setTranscript('');
  
          // Stop listening after processing the command
          setListening(false);
        }
      }
    }
  }, [transcript, selectedItem, searchResults]);

  // Clear the transcript when the component unmounts
  useEffect(() => {
    return () => {
      setTranscript('');
    };
  }, []);



  useEffect(() => {
    console.log('Sorted Recommendations:', sortedRecommendations);
  }, [sortedRecommendations]);

  return (
    <div className="relative w-full">
      <Navbar />
      <div className="relative isolate z-0 bg-white px-6 pt-10 lg:px-8">
        <div className="relative mx-auto max-w-2xl py-24">
          <div className="absolute inset-x-0 -top-[4rem] -z-10 transform-gpu overflow-hidden blur-3xl md:-top-[10rem]">
            <svg
              className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
              viewBox="0 0 1155 678"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC" />
                  <stop offset={1} stopColor="#FF80B5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to Your VocalCart
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              <ContinuousSpeechRecognition
                onSearch={handleSearch}
                onStop={handleStop}
                onReset={handleReset}
                setTranscript={setTranscript} // Pass the setTranscript function
                listening={listening}
                setListening={setListening} // Pass the setListening function
              />
            </p>  
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-10 px-10">
          {/* Display search results */}
          {searchResults && searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div key={index} className="rounded-md border">
                <img
                  src={result.image_url}
                  alt={`Product ${index}`}
                  className="h-[200px] w-full object-cover rounded-t-md"
                  style={{ objectFit: 'contain', maxHeight: '200px' }}
                />
                <div className="p-4">
                  <h1 className="text-lg font-semibold">Title: {result.title}</h1>
                  <p className="mt-3 text-sm text-gray-600">
                    Price: {result.price}
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Rating: {result.rating}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p></p>
          )}
        </div>
        {/* Display recommendations sorted by ratings */}
        <div className="grid grid-cols-3 gap-4 mt-10 px-10">
        {/* Display both sorted recommendations */}
        {sortedRecommendations && sortedRecommendations.flat().length > 0 ? (
          sortedRecommendations.flat().map((recommendation, index) => (
            <div key={index} className="rounded-md border">
              <img
                src={recommendation.image_url}
                alt={`Recommendation ${index}`}
                className="h-[200px] w-full object-cover rounded-t-md"
                style={{ objectFit: 'contain', maxHeight: '200px' }}
              />
              <div className="p-4">
                <h1 className="text-lg font-semibold">Title: {recommendation.title}</h1>
                <p className="mt-3 text-sm text-gray-600">
                  Price: {recommendation.price}
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  Rating: {recommendation.rating}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p></p>
        )}
      </div>
      </div>
    </div>
  );
  
  };

export default Home;