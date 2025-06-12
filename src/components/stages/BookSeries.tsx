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
  description: string;
  genres: string[];
  ageRange: {
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

  // Get age group based on user's age
  const getAgeGroup = () => {
    if (age && age <= 7) return '4-7';
    if (age && age <= 10) return '8-10';
    return '11+';
  };

  // Fetch recommended books from backend
  useEffect(() => {
    const fetchRecommendedBooks = async () => {
      try {
        setIsLoading(true);
        const ageGroup = getAgeGroup();
        const response = await axios.get<{ [key: string]: Book[] }>(`${API_BASE_URL}/recommendations`);
        setRecommendedBooks(response.data[ageGroup] || []);
        setError(null);
      } catch (err) {
        setError('Failed to load recommended books. Please try again.');
        console.error('Error fetching recommended books:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedBooks();
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
  
  const handleSeriesClick = (seriesId: string) => {
    const hasRead = !hasReadSeries(seriesId);
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
  
  const handleNextPage = () => {
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
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <BookOpenCheck className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Have you read these books?
        </h2>
        <p className="text-gray-600">
          Tap on any book series you've read, {name}!
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Page {currentPage + 1} of {totalPages}
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        {currentSeries.map((book) => (
          <div key={book.id}>
            <Card
              selected={hasReadSeries(book.id)}
              selectable
              onClick={() => handleSeriesClick(book.id)}
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  {hasReadSeries(book.id) && getSeriesResponse(book.id) && (
                    <p className="text-sm text-gray-600 mt-1">
                      Your opinion: {getResponseEmoji(getSeriesResponse(book.id))}
                    </p>
                  )}
                </div>
                
                {hasReadSeries(book.id) ? (
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-indigo-600"></div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not read</span>
                )}
              </div>
            </Card>
            
            {activeSeries === book.id && <ResponseOptions seriesId={book.id} />}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentPage > 0 ? () => setCurrentPage(prev => prev - 1) : prevStage}
        >
          {currentPage > 0 ? 'Previous Page' : 'Back'}
        </Button>
        
        <Button 
          onClick={handleNextPage}
        >
          {currentPage < totalPages - 1 ? 'Next Page' : 'Finish'}
        </Button>
      </div>
    </div>
  );
};

export default BookSeries;