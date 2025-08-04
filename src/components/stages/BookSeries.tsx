import React, { useState, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import axios from 'axios';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  genres?: string[];
  ageRange?: {
    min: number;
    max: number;
  };
  coverImage?: string;
}

const BookSeries: React.FC = () => {
  const { nextStage, prevStage, name, age, bookSeries, updateBookSeriesResponse } = useQuiz();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get age group based on user's age
  const getAgeGroup = () => {
    if (age !== undefined && age !== null) {
      if (age < 5) return 'Below 5';
      if (age >= 5 && age <= 8) return '6-8';
      if (age >= 9 && age <= 10) return '9-10';
      if (age >= 11 && age <= 12) return '11-12';
      if (age >= 13) return '13+';
    }
    return 'Below 5'; // fallback
  };

  // Fetch recommended books from backend for the user's age group
  useEffect(() => {
    const fetchRecommendedBooks = async () => {
      setIsLoading(true);
      try {
        const ageGroup = getAgeGroup();
        // Encode ageGroup for URL safety
        const encodedAgeGroup = encodeURIComponent(ageGroup);
        const response = await axios.get<Book[]>(`${API_BASE_URL}/recommendations/${encodedAgeGroup}`);
        setRecommendedBooks(response.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load recommended books. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendedBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age]);

  const seriesPerPage = 4;
  const totalPages = Math.ceil(recommendedBooks.length / seriesPerPage);
  
  const currentSeries = recommendedBooks.slice(
    currentPage * seriesPerPage, 
    (currentPage + 1) * seriesPerPage
  );
  
  const hasReadSeries = (seriesId: string): boolean => {
    const found = bookSeries.find(item => item.seriesId === seriesId);
    return found ? found.hasRead : false;
  };
  
  const getSeriesResponse = (seriesId: string): string | null => {
    const found = bookSeries.find(item => item.seriesId === seriesId);
    return found?.response || null;
  };
  
  const handleReadStatusChange = (seriesId: string, hasRead: boolean) => {
    updateBookSeriesResponse(seriesId, hasRead);
    if (hasRead) {
      setActiveSeries(seriesId);
    } else {
      setActiveSeries(null);
    }
  };
  
  const handleResponse = (seriesId: string, response: 'love' | 'like' | 'dontReadAnymore' | 'didNotEnjoy') => {
    updateBookSeriesResponse(seriesId, true, response);
    setActiveSeries(null);
  };

  const validateResponses = () => {
    const currentSeriesIds = currentSeries.map(book => book.id);
    const allResponded = currentSeriesIds.every(id => 
      bookSeries.some(item => item.seriesId === id)
    );
    return allResponded;
  };
  
  const handleNextPage = () => {
    if (!validateResponses()) {
      setValidationError("Please select 'Read' or 'Didn't Read' for all books before proceeding.");
      return;
    }
    setValidationError(null);

    // Check for edge cases before proceeding
    const allBooksResponses = bookSeries.filter(item => 
      currentSeries.some(book => book.id === item.seriesId)
    );
    
    const readBooks = allBooksResponses.filter(item => item.hasRead);
    const negativeResponses = readBooks.filter(item => 
      item.response === 'dontReadAnymore' || item.response === 'didNotEnjoy'
    );

    // If no books were read and we're on the last page, show a message
    if (readBooks.length === 0 && currentPage === totalPages - 1) {
      const allBookResponses = bookSeries.filter(item => 
        recommendedBooks.some(book => book.id === item.seriesId)
      );
      const allReadBooks = allBookResponses.filter(item => item.hasRead);
      
      if (allReadBooks.length === 0) {
        setValidationError("No worries! We'll find books perfect for you based on your interests and preferences. Let's continue to get your personalized recommendations!");
        setTimeout(() => {
          setValidationError(null);
          nextStage();
        }, 3000);
        return;
      }
    }

    // If all read books have negative responses and we're on the last page, show encouragement
    if (readBooks.length > 0 && negativeResponses.length === readBooks.length && currentPage === totalPages - 1) {
      const allBookResponses = bookSeries.filter(item => 
        recommendedBooks.some(book => book.id === item.seriesId)
      );
      const allReadBooks = allBookResponses.filter(item => item.hasRead);
      const allNegativeResponses = allReadBooks.filter(item => 
        item.response === 'dontReadAnymore' || item.response === 'didNotEnjoy'
      );
      
      if (allReadBooks.length > 0 && allNegativeResponses.length === allReadBooks.length) {
        setValidationError("That's perfectly fine! Everyone has different tastes. We'll use your genre preferences and interests to find books that are a better match for you!");
        setTimeout(() => {
          setValidationError(null);
          nextStage();
        }, 3000);
        return;
      }
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setActiveSeries(null);
    } else {
      nextStage();
    }
  };
  
  const ResponseOptions = ({ seriesId }: { seriesId: string }) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fadeIn">
      <p className="text-sm font-medium text-gray-800 mb-3">How did you like it?</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleResponse(seriesId, 'love')}
          className="bg-pink-100 hover:bg-pink-200 text-pink-800 py-2 rounded-lg text-sm"
        >
          I love it! 😍
        </button>
        <button
          onClick={() => handleResponse(seriesId, 'like')}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-lg text-sm"
        >
          I like it 🙂
        </button>
        <button
          onClick={() => handleResponse(seriesId, 'dontReadAnymore')}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 rounded-lg text-sm"
        >
          Don't read anymore ⏱️
        </button>
        <button
          onClick={() => handleResponse(seriesId, 'didNotEnjoy')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm"
        >
          Didn't enjoy it 👎
        </button>
      </div>
    </div>
  );
  
  const getResponseEmoji = (response: string | null) => {
    switch (response) {
      case 'love': return '😍';
      case 'like': return '🙂';
      case 'dontReadAnymore': return '⏱️';
      case 'didNotEnjoy': return '👎';
      default: return '';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-4 sm:px-0">
      <div className="text-center mb-4 sm:mb-6">
        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
          <BookOpenCheck className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Have you read these books?
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Please select whether you've read each book, {name}!
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Page {currentPage + 1} of {totalPages}
        </p>
      </div>
      
      {validationError && (
        <div className={`mb-4 p-3 rounded-lg ${
          validationError.includes("No worries") || validationError.includes("perfectly fine") 
            ? "bg-blue-100 text-blue-700 border border-blue-200" 
            : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {validationError}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {currentSeries.map((book) => (
          <div key={book.id}>
            <Card className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <h3 className="text-sm sm:text-base font-medium">{book.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{book.author}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`readStatus-${book.id}`}
                      checked={hasReadSeries(book.id)}
                      onChange={() => handleReadStatusChange(book.id, true)}
                      className="form-radio text-indigo-600 w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm">Read</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`readStatus-${book.id}`}
                      checked={bookSeries.some(item => item.seriesId === book.id && !item.hasRead)}
                      onChange={() => handleReadStatusChange(book.id, false)}
                      className="form-radio text-indigo-600 w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm">Didn't Read</span>
                  </label>
                </div>

                {hasReadSeries(book.id) && getSeriesResponse(book.id) && (
                  <p className="text-sm text-gray-600">
                    Your opinion: {getResponseEmoji(getSeriesResponse(book.id))}
                  </p>
                )}
              </div>
            </Card>
            
            {activeSeries === book.id && <ResponseOptions seriesId={book.id} />}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <Button 
          variant="outline" 
          onClick={currentPage > 0 ? () => setCurrentPage(prev => prev - 1) : prevStage}
          className="text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
        >
          {currentPage > 0 ? 'Previous Page' : 'Back'}
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Skip Books Button - only show if no books have been marked as read */}
          {bookSeries.filter(item => 
            recommendedBooks.some(book => book.id === item.seriesId) && item.hasRead
          ).length === 0 && (
            <Button 
              variant="outline"
              onClick={() => {
                setValidationError("No problem! We'll find great books for you based on your interests and preferences.");
                setTimeout(() => {
                  setValidationError(null);
                  nextStage();
                }, 2000);
              }}
              className="text-sm sm:text-base px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 w-full sm:w-auto"
            >
              Skip Books
            </Button>
          )}
          
          <Button 
            onClick={handleNextPage}
            className="text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
          >
            {currentPage < totalPages - 1 ? 'Next Page' : 'Finish'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookSeries;