// VoiceCommands.js

const handleFilter = async (filterType, searchResults, sortedRecommendations) => {
    let filteredResults = [];
    
    switch (filterType) {
      case 'price':
        // Filter search results or recommendations by price
        // For example, filter search results by price less than 1000
        filteredResults = searchResults.filter(result => parseFloat(result.price) < 1000);
        break;
      case 'rating':
        // Filter search results or recommendations by rating
        // For example, filter search results by rating greater than 4.0
        filteredResults = sortedRecommendations.filter(recommendation => {
          const rating = parseFloat(recommendation.rating.split(' ')[0]);
          return rating > 4.0;
        });
        break;
      default:
        throw new Error('Invalid filter type');
    }
    
    return filteredResults;
  };
  
  export default handleFilter;
  