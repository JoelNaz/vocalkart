import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContinuousSpeechRecognition from '../components/SpeechRecognition'; // Assuming this is the correct path

axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN';
axios.defaults.xsrfCookieName = 'csrftoken';

const Home = () => {
  const [transcript, setTranscript] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [listening, setListening] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  useEffect(() => {
    // Fetch user details or check authentication status
    axios
      .get('http://your-backend-api/user', { withCredentials: true })
      .then(function (res) {
        setCurrentUser(res.data.username);
      })
      .catch(function (error) {
        setCurrentUser(null);
      });
  }, []);

  const handleSearch = async (query) => {
    if (!query) {
      console.error('Search query is undefined or empty');
      return;
    }
  
    console.log('Handling search query:', query);
  
    try {
      // Make requests to both Amazon and Flipkart
      const [amazonResponse, flipkartResponse] = await Promise.all([
        axios.post('http://127.0.0.1:8000/query/search_query_amazon/', { query }),
        axios.post('http://127.0.0.1:8000/query/search_query_flipkart/', { query }),
      ]);
  
      // Extract results from both responses
      const amazonResults = amazonResponse.data.results || [];
      const flipkartResults = flipkartResponse.data.results || [];
      console.log(flipkartResponse)
  
      // Combine results from both sources
      const combinedResults = [...amazonResults, ...flipkartResults];
  
      // Sort the combined results based on ratings
      const sortedResults = combinedResults.sort((a, b) => {
        // Extract numeric part of the rating and convert to numbers
        const ratingA = parseFloat(a.rating.split(' ')[0]);
        const ratingB = parseFloat(b.rating.split(' ')[0]);
        // Sort by rating in descending order
        return ratingB - ratingA;
      });
  
      // Update the state with the sorted results
      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
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
    if (transcript.toLowerCase().includes('hi vocal search query')) {
      // Clear previous timeout if exists
      clearTimeout(timeoutId);
  
      // Set a timeout to wait for additional speech input
      timeoutId = setTimeout(() => {
        const searchQueryCommand = /hi vocal search query\s(.+)/i;
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

  return (
    <div>
      <h1>Welcome to Your React App</h1>
      {/* ... Other components and links ... */}

      <ContinuousSpeechRecognition
        onSearch={handleSearch}
        onStop={handleStop}
        onReset={handleReset}
        setTranscript={setTranscript} // Pass the setTranscript function
        listening={listening}
        setListening={setListening} // Pass the setListening function
      />

      {currentUser && (
        <div>
          {/* Add additional information or actions for logged-in users if needed */}
          <p>Hello, {currentUser}!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* Display search results in three columns */}
        {searchResults.map((result, index) => (
          <div key={index} style={{ flex: '0 0 33.33%', boxSizing: 'border-box', padding: '10px' }}>
            <img
              src={result.image_url}
              alt={`Product ${index}`}
              style={{ width: '100%', height: '300px', objectFit: 'contain' }}
            />
             <p>Title: {result.title}</p>
            <p>Price: {result.price}</p>
            <p>Rating: {result.rating}</p>
          </div>
        ))}
      </div>
      {selectedItem && (
        <div>
          <h2>Selected Item:</h2>
          <p>Title: {selectedItem.title}</p>
          <p>Price: {selectedItem.price}</p>
          <p>Rating: {selectedItem.rating}</p>
          <img src={selectedItem.image_url} alt={`Selected Product`} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default Home;