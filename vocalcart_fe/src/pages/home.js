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
  const [filteredResults, setFilteredResults] = useState([]);
  const [originalResultsShown, setOriginalResultsShown] = useState(false);
  
  
  const [addCart, setAddCart] = useState(false);

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
    console.log('Transcript:', transcript);
    const normalizedTranscript = transcript.toLowerCase();
    console.log('Normalized Transcript:', normalizedTranscript);
  
    if (normalizedTranscript.includes('filter by price')) {
      console.log('Filter by price command detected');
      // Extract price range from transcript (assuming format: "filter by price <min> to <max>")
      console.log('Transcript:', normalizedTranscript); // Add this line to log the transcript
      const match = normalizedTranscript.match(/filter by price (\d+) to (\d+)/);
      console.log('Match:', match); // Log the match result
      if (match) {
        console.log('Price range match:', match);
        const minPrice = parseInt(match[1]);
        const maxPrice = parseInt(match[2]);
        console.log('Min Price:', minPrice);
        console.log('Max Price:', maxPrice);
        filterByPrice(minPrice, maxPrice);
        
      }
    } else if (normalizedTranscript.includes('filter by rating')) {
      console.log('Filter by rating command detected');
      // Extract minimum rating from transcript (assuming format: "filter by rating <rating>")
      const match = normalizedTranscript.match(/filter by rating (\d+)/);
      console.log('Match:', match); // Log the match result
      if (match) {
        console.log('Rating match:', match);
        const minRating = parseInt(match[1]);
        console.log('Min Rating:', minRating);
        filterByRating(minRating);
       
      }
    }else if (normalizedTranscript.includes('filter by description')) {
      console.log('Filter by description command detected');
      // Extract description from transcript (assuming format: "filter by {description}")
      const match = normalizedTranscript.match(/filter by description (.+)/);
      console.log('Match:', match); // Log the match result
      if (match) {
        console.log('Description match:', match[1]);
        const description = match[1];
        // Filter by description logic here
        // You can call a function to handle filtering by description
        // For example:
        filterByDescription(description);
      }
    }
  }, [transcript, originalResultsShown]);


  const filterByDescription = (description) => {
    // Normalize the description
    const normalizedDescription = description.toLowerCase().trim();
    
    // Filter search results based on partial match with description
    const filteredByDescription = searchResults.filter(result =>
      result.title.toLowerCase().includes(normalizedDescription)
    );
    
    // Display filtered results
    setFilteredResults(filteredByDescription);
    setOriginalResultsShown(false);
  
    
  };
  
  const filterByPrice = (minPrice, maxPrice) => {
    console.log('Filtering by price:', minPrice, 'to', maxPrice);
    const filtered = searchResults.filter(result => {
      // Extract numerical price from the string and convert to float
      const price = parseFloat(result.price.replace(/[^\d.]/g, ''));
      return price >= minPrice && price <= maxPrice;
    });
    // Sort the filtered results by price
    const sortedFiltered = filtered.sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^\d.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^\d.]/g, ''));
      return priceA - priceB;
    });
    console.log('Filtered results:', sortedFiltered);
    setFilteredResults(sortedFiltered);
    setOriginalResultsShown(false);
  };
  
  const filterByRating = (minRating) => {
    const filtered = searchResults.filter(result => {
      // Extract numerical rating from the string and convert to float
      const rating = parseFloat(result.rating.match(/(\d+(\.\d+)?)/)[0]);
      return rating >= minRating;
    });
    setFilteredResults(filtered);
    setOriginalResultsShown(false);
  };

  useEffect(() => {
    // Start processing voice commands only after the trigger phrase
    if (transcript.toLowerCase().includes('show original search results') && searchResults.length > 0) {
      console.log("Trigger phrase detected and conditions met.");
      console.log("transcript:", transcript);
      console.log("filteredResults:", filteredResults);
      console.log("originalResultsShown:", originalResultsShown);
  
      // Reset filteredResults to remove the filter
      setFilteredResults([]);
  
      // Set originalResultsShown to true to show the original results
      setOriginalResultsShown(true);
  
      // Reset the transcript after processing the command
      setTranscript('');
  
      // Stop listening after processing the command
      setListening(false);
    } else if (transcript.toLowerCase().includes('show filtered results') && filteredResults.length > 0) {
      console.log("Trigger phrase detected and conditions met.");
      console.log("transcript:", transcript);
      console.log("filteredResults:", filteredResults);
      console.log("originalResultsShown:", originalResultsShown);
  
      // Set originalResultsShown to false to show the filtered results
      setOriginalResultsShown(false);
  
      // Reset the transcript after processing the command
      setTranscript('');
  
      // Stop listening after processing the command
      setListening(false);
    } else {
      console.log("Conditions not met.");
      console.log("transcript:", transcript);
      console.log("filteredResults:", filteredResults);
      console.log("originalResultsShown:", originalResultsShown);
    }
  }, [transcript, filteredResults, originalResultsShown, searchResults]);
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

  const resetFilters = () => {
    setFilteredResults([]);
  };
  

  useEffect(() => {
    console.log('Sorted Recommendations:', sortedRecommendations);
  }, [sortedRecommendations]);
  
  useEffect(() => {
    if ( transcript.toLowerCase().includes('select result')) {
      // Extract the index from the transcript (assuming it contains a number)
      // setAddCart(true)
      const indexMatch = transcript.match(/\d+/);
      console.log('Index Match:', indexMatch);
      if (indexMatch && searchResults.length > 0) {
        const index = parseInt(indexMatch[0], 10);
        if (index >= 0 && index < searchResults.length) {
          const selectedItem = searchResults[index];
          setSelectedItem(selectedItem);
          // Send the selected item to the backend to add to the cart
          addToCart(selectedItem);
          // Reset the transcript after processing the command
          setTranscript('');
          // Stop listening after processing the command
          setListening(false);
        }
      }
    }
  }, [transcript, searchResults]);


  const addToCart = async (selectedItem) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/query/addtocart/',
        {
            // Assuming selectedItem is an object containing necessary details like id, title, price, etc.
            // Modify this according to the structure expected by your backend
            // For example:
            // id: selectedItem.title,
            title: selectedItem.title,
            price: selectedItem.price,
            image_url: selectedItem.image_url,
            rating: selectedItem.rating,
            // Add other properties as needed
          current_user_email: currentUserEmail // Assuming currentUserEmail is the current user's email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Item added to cart:', response.data);
      // Optionally, update the UI to reflect the addition to the cart
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };


  return (
    <div className="relative w-full h-screen bg-cover bg-center opacity-85" style={{backgroundImage: `url('https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`}}>
      <Navbar />
      <div className="relative isolate z-0 bg-transparent px-6 pt-10 lg:px-8">
        <div className="relative mx-auto max-w-2xl py-24 mt-10 bg-white bg-opacity-90 rounded-xl">
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
  
        {/* Display filtered results if available */}
        {filteredResults.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-10 px-10">
            {filteredResults.map((result, index) => (
              <div key={index} className="rounded-md border bg-white p-1">
                <img
                  src={result.image_url}
                  alt={`Filtered Product ${index}`}
                  className="h-[200px] w-full object-cover rounded-t-md"
                  style={{ objectFit: 'contain', maxHeight: '200px' }}
                />
                <div className="p-4">
                  <h1 className="text-lg font-semibold">Title: {result.title}</h1>
                  <p className="mt-3 text-md text-gray-600">
                    Price: {result.price}
                  </p>
                  <p className="mt-3 text-md text-gray-600">
                    Rating: {result.rating}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {/* Display search results only if filtered results are not available */}
        {filteredResults.length === 0 && (
          <div className="grid grid-cols-3 gap-4 mt-10 px-10">
            {searchResults.map((result, index) => (
              <div key={index} className="rounded-md border bg-white p-1">
                <img
                  src={result.image_url}
                  alt={`Product ${index}`}
                  className="h-[200px] w-full object-cover rounded-t-md"
                  style={{ objectFit: 'contain', maxHeight: '200px' }}
                />
                <div className="p-4">
                  <h1 className="text-lg font-semibold">Title: {result.title}</h1>
                  <p className="mt-3 text-md text-gray-600">
                    Price: {result.price}
                  </p>
                  <p className="mt-3 text-md text-gray-600">
                    Rating: {result.rating}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
  
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