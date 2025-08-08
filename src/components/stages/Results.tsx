import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookMarked, Send, RefreshCw, BookOpen, ExternalLink, Star, Calendar, ThumbsDown, X, Library } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import axios from 'axios';
import { api } from '../../services/api';
import Loading from '../../assets/loading.gif'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Book {
  title: string;
  author: string;
  series?: string;
  explanation: string;
  justbookify_link?: string;
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
  series_name?: string;
  author_name?: string;
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
    userId,
    resetQuiz,
    fictionGenres,
    nonFictionGenres,
    additionalGenres
  } = useQuiz();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentRecommendations, setCurrentRecommendations] = useState<Book[]>([]);
  const [futureReadingPlan, setFutureReadingPlan] = useState<FutureMonth[]>([]);
  const [seriesRecommendations, setSeriesRecommendations] = useState<Recommendation[]>([]);
  const [dislikedBooks, setDislikedBooks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const hasInitialized = useRef(false);

  const loadingMessages = [
    "Bookie's on a mission to find your next adventure!",
    "Sniff-sniff! Bookie smells an epic story nearby!",
    "Bookie's story-radar is beeping! Something awesome is close!",
    "Just a page-flip away! Bookie's almost ready with a book you'll love!",
    "Don't blink! Your next favorite book is about to appear!",
    "Bookie's flipping pages faster than ever! Hang tight!",
    "Your wait is 99% complete! Bookie will show it any second now!"
  ];

  // Combine all genre data based on age
  const allSelectedGenres = useMemo((): string[] => {
    if (age === null) return [];
    
    let genres: string[] = [];
    
    // For young users (6-10), use selectedGenres from GenreYoung + additionalGenres
    if (age >= 6 && age <= 10) {
      genres = [...selectedGenres, ...additionalGenres];
    }
    // For older users (11+), combine fictionGenres + nonFictionGenres + additionalGenres
    else if (age >= 11) {
      genres = [...fictionGenres, ...nonFictionGenres, ...additionalGenres];
    }
    // For very young users (5 and under), use selectedGenres (from interests)
    else {
      genres = [...selectedGenres];
    }
    
    // Filter out empty strings and duplicates
    const filteredGenres = genres.filter(genre => genre && genre.trim() !== '');
    const uniqueGenres = [...new Set(filteredGenres)];
    
    // Fallback: if no genres found but we have interests, use them as genres
    if (uniqueGenres.length === 0 && (selectedInterests.length > 0 || nonFictionInterests.length > 0)) {
      const interestGenres = [...selectedInterests, ...nonFictionInterests];
      console.log('No genres found, using interests as genres:', interestGenres);
      return interestGenres;
    }
    
    console.log('Combined genres for age', age, ':', {
      selectedGenres,
      fictionGenres,
      nonFictionGenres,
      additionalGenres,
      selectedInterests,
      nonFictionInterests,
      combined: uniqueGenres
    });
    
    return uniqueGenres;
  }, [age, selectedGenres, fictionGenres, nonFictionGenres, additionalGenres, selectedInterests, nonFictionInterests]);

  // Helper function to get display name (series or author)
  const getDisplayName = (book: Book | SampleBook) => {
    return book.series || `By ${book.author}`;
  };

  // Filter out disliked books
  const filterDislikedBooks = (books: Book[]): Book[] => {
    return books.filter(book => !dislikedBooks.has(`${book.title}-${book.author}`));
  };

  const handleDislikeBook = (book: Book) => {
    const bookKey = `${book.title}-${book.author}`;
    setDislikedBooks(prev => new Set([...prev, bookKey]));
  };

  const fetchRecommendations = async () => {
    try {
      // Validate that we have selected genres or other relevant data
      if (allSelectedGenres.length === 0) {
        console.error('No genres found:', {
          age,
          selectedGenres,
          fictionGenres,
          nonFictionGenres,
          additionalGenres,
          selectedInterests,
          nonFictionInterests
        });
        
        // Check if we have any other data that could be used for recommendations
        const hasInterests = selectedInterests.length > 0 || nonFictionInterests.length > 0;
        const hasBookSeries = bookSeries.length > 0;
        
        if (!hasInterests && !hasBookSeries) {
          console.error('No genres or interests found:', {
            age,
            selectedGenres,
            fictionGenres,
            nonFictionGenres,
            additionalGenres,
            selectedInterests,
            nonFictionInterests
          });
          setError('No genres or interests selected. Please go back and select your favorite genres or interests.');
          return;
        }
        
        // If we have interests but no genres, we can still try to get recommendations
        console.log('No genres selected, but proceeding with interests and book series data');
      }

      console.log('Sending recommendation request with genres:', allSelectedGenres);

      const requestData = {
        userId,
        name,
        age,
        selectedGenres: allSelectedGenres,
        selectedInterests,
        nonFictionInterests,
        bookSeries,
        parentEmail,
        parentPhone
      };

      console.log('Full request data:', requestData);

      const response = await axios.post<RecommendationResponse>(`${API_BASE_URL}/recommendation-plan`, requestData);
      
      setCurrentRecommendations(response.data.current);
      setFutureReadingPlan(response.data.future);
      setSeriesRecommendations(response.data.recommendations);
      
      // Save recommendations to database
      if (userId && response.data) {
        try {
          await api.saveRecommendations(userId, {
            current: response.data.current,
            future: response.data.future,
            recommendations: response.data.recommendations
          });
        } catch (saveError) {
          console.error('Failed to save recommendations:', saveError);
          // Don't show error to user as recommendations are still displayed
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again.');
      console.error('Error fetching recommendations:', err);
    }
  };

  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    setError(null);
    // Clear disliked books when refreshing
    setDislikedBooks(new Set());
    
    try {
      await fetchRecommendations();
      setSuccess('New recommendations loaded!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to refresh recommendations. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Effect to cycle through loading messages (only once)
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          
          // If we've shown all messages, stay on the last one
          if (nextIndex >= loadingMessages.length) {
            return loadingMessages.length - 1; // Stay on final message
          }
          
          return nextIndex;
        });
      }, 1500); // Change message every 1.5 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading, loadingMessages.length]);

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      setLoadingMessageIndex(0); // Reset to first message
      await fetchRecommendations();
      setIsLoading(false); // Stop loading when API call completes
    };

    // Only load recommendations once on initial mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadRecommendations();
    }
  }, []); // Empty dependency array - only run once on mount

  const handleEmailRecommendations = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/send-recommendations/email`, {
        email: parentEmail,
        current: currentRecommendations,
        future: futureReadingPlan,
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
      await axios.post(`${API_BASE_URL}/send-recommendations/whatsapp`, {
        phone: parentPhone,
        current: currentRecommendations,
        future: futureReadingPlan,
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 px-4 sm:min-h-[400px] sm:space-y-6 sm:px-0">
        <div className="relative">
          <img 
            src={Loading} 
            alt="Bookie loading" 
            className="w-24 h-24 mx-auto sm:w-32 sm:h-32"
          />
        </div>
        <div className="space-y-3 text-center sm:space-y-4">
          <div className="min-h-[60px] flex items-center justify-center sm:min-h-[80px]">
            <p className="max-w-sm text-base font-medium text-indigo-600 transition-all duration-700 ease-in-out animate-fadeIn sm:max-w-md sm:text-lg">
              {loadingMessages[loadingMessageIndex]}
            </p>
          </div>
          <div className="flex justify-center space-x-1">
            {loadingMessages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-500 sm:w-3 sm:h-3 ${
                  index === loadingMessageIndex 
                    ? 'bg-indigo-500 scale-125' 
                    : 'bg-indigo-200'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500 sm:text-sm">
            {loadingMessageIndex + 1} of {loadingMessages.length} • Next: {loadingMessages[(loadingMessageIndex + 1) % loadingMessages.length].substring(0, 30)}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center rounded-lg bg-red-50 mx-4 sm:mx-0 sm:p-8">
        <div className="mb-4 text-red-600">
          <svg className="w-8 h-8 mx-auto mb-3 sm:w-12 sm:h-12 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base font-medium sm:text-lg">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} className="text-white bg-red-600 hover:bg-red-700 text-sm sm:text-base">
          Try Again
        </Button>
      </div>
    );
  }

  // Filter current recommendations to remove disliked books
  const filteredCurrentRecommendations = filterDislikedBooks(currentRecommendations);
  const filteredFutureReadingPlan = futureReadingPlan.map(month => ({
    ...month,
    books: filterDislikedBooks(month.books)
  }));

  // Check if we have any meaningful recommendations
  const hasCurrentRecommendations = filteredCurrentRecommendations.length > 0;
  const hasFutureRecommendations = filteredFutureReadingPlan.some(month => month.books.length > 0);
  const hasSeriesRecommendations = seriesRecommendations.length > 0;
  const hasAnyRecommendations = hasCurrentRecommendations || hasFutureRecommendations || hasSeriesRecommendations;

  // Check if user had no positive book responses
  const readBooks = bookSeries.filter(item => item.hasRead);
  const positiveResponses = readBooks.filter(item => 
    item.response === 'love' || item.response === 'like'
  );
  const hasPositiveBookResponses = positiveResponses.length > 0;

  return (
    <div className="animate-fadeIn w-full overflow-x-hidden">
      <div className="mb-6 px-4 text-center sm:mb-8 sm:px-0">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-br from-indigo-400 to-purple-500 sm:w-20 sm:h-20">
          <BookMarked className="w-8 h-8 text-white sm:w-10 sm:h-10" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-indigo-800 sm:text-3xl break-words">
          Great job, {name}! 📚
        </h2>
        <p className="max-w-2xl mx-auto mb-4 px-2 text-base text-gray-600 sm:text-lg sm:px-0 break-words">
          {hasAnyRecommendations 
            ? `Based on your age (${age} years) and interests, we've curated a personalized reading journey just for you.`
            : `Based on your age (${age} years) and interests, we're excited to introduce you to some amazing new books!`
          }
        </p>
        
        {/* Refresh Button */}
        {/* <div className="flex justify-center">
          <Button
            onClick={handleRefreshRecommendations}
            disabled={isRefreshing}
            className="flex items-center px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 group"
          >
            <RefreshCw className={`w-5 h-5 mr-2 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            {isRefreshing ? 'Getting New Recommendations...' : 'Get New Recommendations'}
          </Button>
        </div> */}
      </div>

      {/* Show special message if no positive book responses */}
      {!hasPositiveBookResponses && readBooks.length > 0 && (
        <div className="p-4 mb-6 border border-yellow-200 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl mx-4 sm:mx-0 sm:p-6 sm:mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full sm:w-16 sm:h-16">
              <Star className="w-6 h-6 text-yellow-600 sm:w-8 sm:h-8" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-yellow-800 sm:text-xl">
              Discovering New Favorites! 🌟
            </h3>
            <p className="mb-4 text-sm text-yellow-700 sm:text-base break-words">
              We noticed the books you've read weren't quite your style - that's totally normal! 
              Everyone has different tastes, and that's what makes reading exciting. 
            </p>
            <p className="text-sm text-yellow-700 sm:text-base break-words">
              We've carefully selected books based on your interests and preferences that we think you'll love. 
              Sometimes the best books are the ones we haven't discovered yet!
            </p>
          </div>
        </div>
      )}

      {/* Show special message if no books were read */}
      {readBooks.length === 0 && (
        <div className="p-4 mb-6 border border-green-200 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl mx-4 sm:mx-0 sm:p-6 sm:mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full sm:w-16 sm:h-16">
              <BookOpen className="w-6 h-6 text-green-600 sm:w-8 sm:h-8" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-green-800 sm:text-xl">
              Your Reading Adventure Begins! 🚀
            </h3>
            <p className="mb-4 text-sm text-green-700 sm:text-base break-words">
              How exciting - you're about to discover some amazing books! 
              We've picked these recommendations based on your interests and what other readers your age love.
            </p>
            <p className="text-sm text-green-700 sm:text-base break-words">
              Every great reader started somewhere, and we're here to help you find books that will spark your imagination!
            </p>
          </div>
        </div>
      )}

      {/* Current Recommendations */}
      <div className="p-4 mb-6 border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl mx-4 sm:mx-0 sm:p-6 sm:mb-8">
        <h3 className="flex items-center mb-4 text-lg font-bold text-indigo-800 sm:mb-5 sm:text-xl">
          <Star className="w-5 h-5 mr-2 text-yellow-500 sm:w-6 sm:h-6" />
          {hasCurrentRecommendations ? 'Top Picks for You' : 'Books We Think You\'ll Love'}
        </h3>
        
        {hasCurrentRecommendations ? (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCurrentRecommendations.map((book, index) => (
              <div key={index} className="relative p-3 transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md group sm:p-4 w-full">
                <button
                  onClick={() => handleDislikeBook(book)}
                  className="absolute p-1 transition-opacity rounded-full opacity-0 top-2 right-2 group-hover:opacity-100 hover:bg-red-50 z-10"
                  title="Remove this book"
                >
                  <ThumbsDown className="w-3 h-3 text-red-500 sm:w-4 sm:h-4" />
                </button>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full sm:w-10 sm:h-10">
                      <BookMarked className="w-4 h-4 text-indigo-600 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {book.series && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 max-w-full">
                          <Library className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{book.series} Series</span>
                        </span>
                      </div>
                    )}
                    <h4 className="mb-1 text-sm font-semibold text-indigo-900 break-words sm:text-base">{book.title}</h4>
                    <p className="text-xs text-gray-600 sm:text-sm break-words">{getDisplayName(book)}</p>
                    <p className="mt-2 text-xs text-gray-500 break-words sm:text-sm">{book.explanation}</p>
                    {book.justbookify_link && (
                      <a 
                        href={book.justbookify_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 group break-all sm:text-sm"
                      >
                        <span className="truncate">View on Justbookify</span>
                        <ExternalLink className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1 flex-shrink-0 sm:w-4 sm:h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center sm:py-8">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-indigo-100 rounded-full sm:w-16 sm:h-16">
              <BookMarked className="w-6 h-6 text-indigo-600 sm:w-8 sm:h-8" />
            </div>
            <h4 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
              Personalized Recommendations Coming Soon!
            </h4>
            <p className="mb-4 text-sm text-indigo-600 sm:text-base break-words">
              We're working on finding the perfect books for you based on your unique preferences.
            </p>
            <p className="text-xs text-gray-600 sm:text-sm break-words">
              In the meantime, explore popular books for your age group or ask your librarian for recommendations 
              in the genres you selected: <strong className="break-words">{selectedGenres.join(', ')}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Series/Author Recommendations */}
      {seriesRecommendations.length > 0 && (
        <div className="p-4 mb-6 border border-blue-100 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mx-4 sm:mx-0 sm:p-6 sm:mb-8">
          <h3 className="flex items-center mb-4 text-lg font-bold text-blue-800 sm:mb-5 sm:text-xl">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600 sm:w-6 sm:h-6" />
            Series & Authors You'll Love
          </h3>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {seriesRecommendations.map((rec, index) => (
              <div key={index} className="p-4 transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md sm:p-5 w-full">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-blue-900 sm:text-lg break-words">
                      {rec.series_name || rec.name}
                    </h4>
                    {rec.author_name && (
                      <p className="text-sm text-blue-700 break-words">by {rec.author_name}</p>
                    )}
                  </div>
                  <div className="flex items-center px-2 py-1 bg-blue-100 rounded-full sm:px-3 flex-shrink-0">
                    <Star className="w-3 h-3 mr-1 text-yellow-500 sm:w-4 sm:h-4" />
                    <span className="text-xs font-medium text-blue-800 sm:text-sm">{rec.confidence_score}/10</span>
                  </div>
                </div>
                <p className="mb-3 text-sm text-gray-600 break-words sm:text-base">{rec.rationale}</p>
                <a 
                  href={rec.justbookify_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mb-3 text-sm font-medium text-blue-600 hover:text-blue-800 group break-all"
                >
                  <span className="truncate">View on Justbookify</span>
                  <ExternalLink className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1 flex-shrink-0 sm:w-4 sm:h-4" />
                </a>
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <h5 className="mb-2 text-sm font-medium text-gray-900 sm:text-base">Featured Books:</h5>
                  <ul className="space-y-2">
                    {rec.sample_books.map((book, bookIndex) => (
                      <li key={bookIndex} className="flex items-start text-xs text-gray-600 sm:text-sm">
                        <BookMarked className="w-3 h-3 mt-1 mr-2 text-blue-500 flex-shrink-0 sm:w-4 sm:h-4" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="font-medium text-gray-800 break-words">{book.title}</div>
                          <div className="text-xs text-gray-500 break-words">by {book.author}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Reading Plan */}
      <div className="p-4 mb-6 border border-pink-100 shadow-sm bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl mx-4 sm:mx-0 sm:p-6 sm:mb-8">
        <h3 className="flex items-center mb-4 text-lg font-bold text-pink-800 sm:mb-5 sm:text-xl">
          <Calendar className="w-5 h-5 mr-2 text-pink-600 sm:w-6 sm:h-6" />
          Your 3-Month Reading Journey
        </h3>
        
        {hasFutureRecommendations ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFutureReadingPlan.map((monthObj, index) => (
              <div key={index} className="p-3 bg-white rounded-lg shadow-sm sm:p-4 w-full">
                <h4 className="mb-3 text-base font-semibold text-pink-700 sm:text-lg">{monthObj.month}</h4>
                <ul className="space-y-3">
                  {monthObj.books.map((book, bookIndex) => (
                    <li key={bookIndex} className="relative pl-3 border-l-2 border-pink-200 group">
                      <button
                        onClick={() => handleDislikeBook(book)}
                        className="absolute top-0 right-0 p-1 transition-opacity rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 z-10"
                        title="Remove this book"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                      <div className="pr-6 overflow-hidden">
                        {book.series && (
                          <div className="mb-1">
                            <span className="text-xs font-medium text-indigo-800 break-words block">{book.series} Series</span>
                          </div>
                        )}
                        <div className="font-medium text-gray-900 text-sm sm:text-base break-words">{book.title}</div>
                        <div className="text-xs text-gray-600 sm:text-sm break-words">{getDisplayName(book)}</div>
                        <div className="mt-1 text-xs text-gray-500 break-words sm:text-sm">{book.explanation}</div>
                        {book.justbookify_link && (
                          <a 
                            href={book.justbookify_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-1 text-xs font-medium text-pink-600 hover:text-pink-800 group break-all"
                          >
                            <span className="truncate">View on Justbookify</span>
                            <ExternalLink className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                  {monthObj.books.length === 0 && (
                    <li className="italic text-xs text-gray-500 sm:text-sm">More recommendations coming soon!</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center sm:py-8">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full sm:w-16 sm:h-16">
              <Calendar className="w-6 h-6 text-pink-600 sm:w-8 sm:h-8" />
            </div>
            <h4 className="mb-2 text-base font-semibold text-pink-800 sm:text-lg">
              Your Reading Journey is Being Planned!
            </h4>
            <p className="mb-4 text-sm text-pink-700 sm:text-base break-words">
              We're creating a personalized 3-month reading plan based on your preferences.
            </p>
            <p className="text-xs text-gray-600 sm:text-sm break-words">
              Consider starting with books from your favorite genres: <strong className="break-words">{allSelectedGenres.join(', ')}</strong>
              {selectedInterests.length > 0 && (
                <span> and topics like: <strong className="break-words">{selectedInterests.join(', ')}</strong></span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Helpful Tips Section - only show when no recommendations */}
      {!hasAnyRecommendations && (
        <div className="p-4 mb-6 border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl mx-4 sm:mx-0 sm:p-6 sm:mb-8">
          <h3 className="flex items-center mb-4 text-lg font-bold text-blue-800 sm:mb-5 sm:text-xl">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600 sm:w-6 sm:h-6" />
            How to Find Your Next Great Read
          </h3>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
              <h4 className="mb-2 text-sm font-semibold text-blue-800 sm:text-base">🏛️ Visit Your Library</h4>
              <p className="text-xs text-gray-600 sm:text-sm break-words">
                Ask your librarian for recommendations in <strong className="break-words">{allSelectedGenres.join(', ')}</strong>. 
                They're experts at matching readers with perfect books!
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
              <h4 className="mb-2 text-sm font-semibold text-blue-800 sm:text-base">👥 Ask Friends & Family</h4>
              <p className="text-xs text-gray-600 sm:text-sm break-words">
                What are your friends reading? Sometimes the best recommendations come from people who know you well.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
              <h4 className="mb-2 text-sm font-semibold text-blue-800 sm:text-base">🏆 Try Award Winners</h4>
              <p className="text-xs text-gray-600 sm:text-sm break-words">
                Look for books that have won awards for your age group - they're often crowd-pleasers!
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
              <h4 className="mb-2 text-sm font-semibold text-blue-800 sm:text-base">📚 Explore Book Series</h4>
              <p className="text-xs text-gray-600 sm:text-sm break-words">
                If you find one book you like, check if it's part of a series - you might love the whole collection!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Share Options */}
      <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl mx-4 sm:mx-0 sm:p-6 sm:mb-8">
        <h3 className="mb-4 text-base font-semibold text-gray-800 sm:text-lg">Save Your Reading Journey</h3>
        <div className="space-y-3 sm:space-y-4">
          {/* <button
            onClick={handleEmailRecommendations}
            disabled={isSubmitting}
            className="flex items-center justify-center w-full p-4 text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Send className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-1" />
            Send to Email ({parentEmail})
          </button> */}

          <button
            onClick={handleWhatsAppRecommendations}
            disabled={isSubmitting}
            className="flex items-center justify-center w-full p-3 text-white transition-all bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed group sm:p-4 min-w-0"
          >
            <Send className="w-4 h-4 mr-2 transition-transform group-hover:-translate-y-1 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Send to WhatsApp</span>
            <span className="hidden sm:inline ml-1">({parentPhone})</span>
          </button>

          {success && (
            <div className="p-3 text-center text-green-700 rounded-lg bg-green-50">
              <p className="text-sm font-medium sm:text-base break-words">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-3 text-center text-red-700 rounded-lg bg-red-50">
              <p className="text-sm font-medium sm:text-base break-words">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Start Over Button */}
      <div className="flex justify-center px-4 sm:px-0">
        <Button
          onClick={resetQuiz}
          variant="outline"
          className="flex items-center group hover:bg-gray-50 text-sm sm:text-base min-w-0"
        >
          <RefreshCw className="w-4 h-4 mr-2 transition-transform duration-500 group-hover:rotate-180 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Start New Reading Journey</span>
        </Button>
      </div>
    </div>
  );
};

export default Results;