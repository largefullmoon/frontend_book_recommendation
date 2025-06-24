import React, { useState, useEffect } from 'react';
import { BookMarked, Send, RefreshCw, BookOpen, ExternalLink, Star, Calendar, ThumbsDown, X, Library, Bookmark } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Book {
  title: string;
  author: string;
  series?: string;
  explanation: string;
}

interface FutureMonth {
  month: string;
  books: Book[];
}

interface SampleBook {
  title: string;
  author: string;
  series?: string;
}

interface Recommendation {
  name: string;
  justbookify_link: string;
  rationale: string;
  confidence_score: number;
  sample_books: SampleBook[];
}

interface RecommendationResponse {
  current: Book[];
  future: FutureMonth[];
  recommendations: Recommendation[];
}

// Group books by series
const groupBooksBySeries = (books: Book[]) => {
  const groups: { [key: string]: Book[] } = {};
  
  books.forEach(book => {
    const key = book.series || 'standalone';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(book);
  });

  return groups;
};

const Results: React.FC = () => {
  const {
    name,
    age,
    selectedGenres,
    selectedInterests,
    nonFictionInterests,
    bookSeries,
    parentEmail,
    parentPhone,
    resetQuiz
  } = useQuiz();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentRecommendations, setCurrentRecommendations] = useState<Book[]>([]);
  const [futureReadingPlan, setFutureReadingPlan] = useState<FutureMonth[]>([]);
  const [seriesRecommendations, setSeriesRecommendations] = useState<Recommendation[]>([]);
  const [dislikedBooks, setDislikedBooks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const handleDislikeBook = (book: Book) => {
    const bookKey = `${book.title}-${book.author}`;
    setDislikedBooks(prev => {
      const newSet = new Set(prev);
      newSet.add(bookKey);
      return newSet;
    });
  };

  const handleUndoDislike = (book: Book) => {
    const bookKey = `${book.title}-${book.author}`;
    setDislikedBooks(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookKey);
      return newSet;
    });
  };

  const isBookDisliked = (book: Book) => {
    return dislikedBooks.has(`${book.title}-${book.author}`);
  };

  const filterDislikedBooks = (books: Book[]): Book[] => {
    return books.filter(book => !isBookDisliked(book));
  };

  const handleRefreshRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post<RecommendationResponse>(`${API_BASE_URL}/recommendation-plan`, {
        name,
        age,
        selectedGenres,
        selectedInterests,
        nonFictionInterests,
        bookSeries,
        parentEmail,
        parentPhone,
        dislikedBooks: Array.from(dislikedBooks) // Send disliked books to backend
      });
      
      setCurrentRecommendations(response.data.current);
      setFutureReadingPlan(response.data.future);
      setSeriesRecommendations(response.data.recommendations);
      setError(null);
    } catch (err) {
      setError('Failed to refresh recommendations. Please try again.');
      console.error('Error refreshing recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post<RecommendationResponse>(`${API_BASE_URL}/recommendation-plan`, {
          name,
          age,
          selectedGenres,
          selectedInterests,
          nonFictionInterests,
          bookSeries,
          parentEmail,
          parentPhone
        });
        
        setCurrentRecommendations(response.data.current);
        setFutureReadingPlan(response.data.future);
        setSeriesRecommendations(response.data.recommendations);
        setError(null);
      } catch (err) {
        setError('Failed to fetch recommendations. Please try again.');
        console.error('Error fetching recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [name, age, selectedGenres, selectedInterests, nonFictionInterests, bookSeries]);

  const handleEmailRecommendations = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const filteredCurrent = filterDislikedBooks(currentRecommendations);
      const filteredFuture = futureReadingPlan.map(month => ({
        ...month,
        books: filterDislikedBooks(month.books)
      }));

      await axios.post(`${API_BASE_URL}/send-recommendations/email`, {
        email: parentEmail,
        current: filteredCurrent,
        future: filteredFuture,
        recommendations: seriesRecommendations,
        name
      });
      setSuccess('Recommendations have been sent to your email!');
    } catch (err) {
      setError('Failed to send recommendations. Please try again.');
      console.error('Error sending email:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRecommendations = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const filteredCurrent = filterDislikedBooks(currentRecommendations);
      const filteredFuture = futureReadingPlan.map(month => ({
        ...month,
        books: filterDislikedBooks(month.books)
      }));

      await axios.post(`${API_BASE_URL}/send-recommendations/whatsapp`, {
        phone: parentPhone,
        current: filteredCurrent,
        future: filteredFuture,
        recommendations: seriesRecommendations,
        name
      });
      setSuccess('Recommendations have been sent to your WhatsApp!');
    } catch (err) {
      setError('Failed to send recommendations. Please try again.');
      console.error('Error sending WhatsApp message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBookCard = (book: Book, showDislikeButton: boolean = true) => {
    const isDisliked = isBookDisliked(book);
    
    return (
      <div className={`relative bg-white rounded-lg shadow-sm transition-all duration-200 ${isDisliked ? 'opacity-50' : 'hover:shadow-md'}`}>
        <div className="p-4">
          {showDislikeButton && (
            <div className="absolute top-2 right-2 flex space-x-2">
              {isDisliked ? (
                <button
                  onClick={() => handleUndoDislike(book)}
                  className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                  title="Undo remove"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleDislikeBook(book)}
                  className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                  title="Remove from recommendations"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {/* Series Badge */}
          {book.series && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                <Library className="w-3 h-3 mr-1" />
                {book.series} Series
              </span>
            </div>
          )}
          
          {/* Book Title */}
          <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {book.title}
          </h4>
          
          {/* Author */}
          <p className="text-sm text-gray-600 mb-2">
            by {book.author}
          </p>
          
          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-3">
            {book.explanation}
          </p>
        </div>
      </div>
    );
  };

  const renderSeriesGroup = (seriesName: string, books: Book[]) => {
    const filteredBooks = filterDislikedBooks(books);
    if (filteredBooks.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-indigo-900 flex items-center">
            <Bookmark className="w-5 h-5 mr-2 text-indigo-600" />
            {seriesName === 'standalone' ? 'Individual Books' : seriesName}
          </h4>
          <span className="text-sm text-gray-500">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book, idx) => renderBookCard(book))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-indigo-600 font-medium">Finding the perfect books for you...</p>
      </div>
    );
  }

  const groupedBooks = groupBooksBySeries(currentRecommendations);
  const filteredGroupedBooks = Object.entries(groupedBooks)
    .filter(([_, books]) => filterDislikedBooks(books).length > 0);

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <BookMarked className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-indigo-800 mb-3">
          Great job, {name}! 📚
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Based on your age ({age} years) and interests, we've curated a personalized reading journey just for you.
        </p>
        
        {dislikedBooks.size > 0 && (
          <div className="mt-4 mx-auto max-w-2xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-yellow-800">
                  <span className="font-medium">{dislikedBooks.size}</span> book{dislikedBooks.size !== 1 ? 's' : ''} removed from recommendations
                </p>
                <button
                  onClick={handleRefreshRecommendations}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors"
                >
                  Refresh List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Current Recommendations */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <h3 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
            <Star className="w-7 h-7 mr-2 text-yellow-500" />
            Recommended Books
          </h3>
          
          {filteredGroupedBooks.length > 0 ? (
            <div className="space-y-6">
              {filteredGroupedBooks.map(([seriesName, books]) => 
                renderSeriesGroup(seriesName, books)
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-500 mb-4">All recommendations have been removed.</p>
              <button
                onClick={handleRefreshRecommendations}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get New Recommendations
              </button>
            </div>
          )}
        </section>

        {/* Future Reading Plan */}
        <section className="bg-gradient-to-br from-pink-50 to-orange-50 p-6 rounded-xl border border-pink-100">
          <h3 className="text-2xl font-bold text-pink-800 mb-6 flex items-center">
            <Calendar className="w-7 h-7 mr-2 text-pink-600" />
            3-Month Reading Journey
          </h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            {futureReadingPlan.map((month, index) => {
              const filteredBooks = filterDislikedBooks(month.books);
              
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="text-lg font-semibold text-pink-700 mb-4">
                    {month.month}
                  </h4>
                  
                  {filteredBooks.length > 0 ? (
                    <div className="space-y-4">
                      {filteredBooks.map((book, bookIndex) => (
                        <div key={bookIndex} className="border-l-2 border-pink-200 pl-3">
                          {renderBookCard(book, false)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      More recommendations coming soon!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Share Options */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Save Your Reading Journey
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={handleEmailRecommendations}
              disabled={isSubmitting}
              className="w-full p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              <Send className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-1" />
              Send to Email ({parentEmail})
            </button>

            <button
              onClick={handleWhatsAppRecommendations}
              disabled={isSubmitting}
              className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              <Send className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-1" />
              Send to WhatsApp ({parentPhone})
            </button>

            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center">
                <p className="font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center">
                <p className="font-medium">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Start Over Button */}
        <div className="flex justify-center">
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="flex items-center group hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Start New Reading Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;