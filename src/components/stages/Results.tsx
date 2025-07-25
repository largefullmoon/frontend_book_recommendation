import React, { useState, useEffect, useMemo } from 'react';
import { BookMarked, Send, RefreshCw, BookOpen, ExternalLink, Star, Calendar, ThumbsDown, X, Library } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import axios from 'axios';
import { api } from '../../services/api';

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

  // Combine all genre data based on age
  const allSelectedGenres = useMemo((): string[] => {
    if (age === null) return [];
    
    // For young users (6-10), use selectedGenres from GenreYoung + additionalGenres
    if (age >= 6 && age <= 10) {
      return [...selectedGenres, ...additionalGenres];
    }
    
    // For older users (11+), combine fictionGenres + nonFictionGenres + additionalGenres
    if (age >= 11) {
      return [...fictionGenres, ...nonFictionGenres, ...additionalGenres];
    }
    
    // For very young users (5 and under), use selectedGenres (from interests)
    return selectedGenres;
  }, [age, selectedGenres, fictionGenres, nonFictionGenres, additionalGenres]);

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
      // Validate that we have selected genres
      if (allSelectedGenres.length === 0) {
        console.error('No genres found:', {
          age,
          selectedGenres,
          fictionGenres,
          nonFictionGenres,
          additionalGenres
        });
        setError('No genres selected. Please go back and select your favorite genres.');
        return;
      }

      console.log('Sending recommendation request with genres:', allSelectedGenres);

      const response = await axios.post<RecommendationResponse>(`${API_BASE_URL}/recommendation-plan`, {
        userId,
        name,
        age,
        selectedGenres: allSelectedGenres,
        selectedInterests,
        nonFictionInterests,
        bookSeries,
        parentEmail,
        parentPhone
      });
      
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

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      await fetchRecommendations();
      setIsLoading(false);
    };

    loadRecommendations();
      }, [name, age, allSelectedGenres, selectedInterests, nonFictionInterests, bookSeries, userId]);

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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-indigo-600 font-medium">Finding the perfect books for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <div className="mb-4 text-red-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
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
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <BookMarked className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-indigo-800 mb-3">
          Great job, {name}! 📚
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
          {hasAnyRecommendations 
            ? `Based on your age (${age} years) and interests, we've curated a personalized reading journey just for you.`
            : `Based on your age (${age} years) and interests, we're excited to introduce you to some amazing new books!`
          }
        </p>
        
        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRefreshRecommendations}
            disabled={isRefreshing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 flex items-center group"
          >
            <RefreshCw className={`w-5 h-5 mr-2 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            {isRefreshing ? 'Getting New Recommendations...' : 'Get New Recommendations'}
          </Button>
        </div>
      </div>

      {/* Show special message if no positive book responses */}
      {!hasPositiveBookResponses && readBooks.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl mb-8 border border-yellow-200 shadow-sm">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-yellow-800">
              Discovering New Favorites! 🌟
            </h3>
            <p className="text-yellow-700 mb-4">
              We noticed the books you've read weren't quite your style - that's totally normal! 
              Everyone has different tastes, and that's what makes reading exciting. 
            </p>
            <p className="text-yellow-700">
              We've carefully selected books based on your interests and preferences that we think you'll love. 
              Sometimes the best books are the ones we haven't discovered yet!
            </p>
          </div>
        </div>
      )}

      {/* Show special message if no books were read */}
      {readBooks.length === 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl mb-8 border border-green-200 shadow-sm">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-green-800">
              Your Reading Adventure Begins! 🚀
            </h3>
            <p className="text-green-700 mb-4">
              How exciting - you're about to discover some amazing books! 
              We've picked these recommendations based on your interests and what other readers your age love.
            </p>
            <p className="text-green-700">
              Every great reader started somewhere, and we're here to help you find books that will spark your imagination!
            </p>
          </div>
        </div>
      )}

      {/* Current Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl mb-8 border border-indigo-100 shadow-sm">
        <h3 className="font-bold text-xl mb-5 text-indigo-800 flex items-center">
          <Star className="w-6 h-6 mr-2 text-yellow-500" />
          {hasCurrentRecommendations ? 'Top Picks for You' : 'Books We Think You\'ll Love'}
        </h3>
        
        {hasCurrentRecommendations ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCurrentRecommendations.map((book, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative group">
                <button
                  onClick={() => handleDislikeBook(book)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                  title="Remove this book"
                >
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                </button>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <BookMarked className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {book.series && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          <Library className="w-3 h-3 mr-1" />
                          {book.series} Series
                        </span>
                      </div>
                    )}
                    <h4 className="font-semibold text-indigo-900 mb-1 line-clamp-2">{book.title}</h4>
                    <p className="text-sm text-gray-600">{getDisplayName(book)}</p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{book.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <BookMarked className="w-8 h-8 text-indigo-600" />
            </div>
            <h4 className="text-lg font-semibold text-indigo-800 mb-2">
              Personalized Recommendations Coming Soon!
            </h4>
            <p className="text-indigo-600 mb-4">
              We're working on finding the perfect books for you based on your unique preferences.
            </p>
            <p className="text-sm text-gray-600">
              In the meantime, explore popular books for your age group or ask your librarian for recommendations 
              in the genres you selected: <strong>{selectedGenres.join(', ')}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Series/Author Recommendations */}
      {seriesRecommendations.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-100 shadow-sm">
          <h3 className="font-bold text-xl mb-5 text-blue-800 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
            Series & Authors You'll Love
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {seriesRecommendations.map((rec, index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg text-blue-900">{rec.name}</h4>
                  <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-blue-800">{rec.confidence_score}/10</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-3">{rec.rationale}</p>
                <a 
                  href={rec.justbookify_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-3 group"
                >
                  <span>View on Justbookify</span>
                  <ExternalLink className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </a>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="font-medium text-gray-900 mb-2">Featured Books:</h5>
                  <ul className="space-y-2">
                    {rec.sample_books.map((book, bookIndex) => (
                      <li key={bookIndex} className="text-sm text-gray-600 flex items-start">
                        <BookMarked className="w-4 h-4 mr-2 mt-1 text-blue-500" />
                        <span>
                          {book.series && (
                            <div className="text-xs font-medium text-indigo-800 mb-0.5">
                              {book.series} Series
                            </div>
                          )}
                          <span className="font-medium text-gray-800">{book.title}</span>
                          <span className="block text-xs text-gray-500">by {book.author}</span>
                        </span>
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
      <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-6 rounded-xl mb-8 border border-pink-100 shadow-sm">
        <h3 className="font-bold text-xl mb-5 text-pink-800 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-pink-600" />
          Your 3-Month Reading Journey
        </h3>
        
        {hasFutureRecommendations ? (
          <div className="grid gap-4 md:grid-cols-3">
            {filteredFutureReadingPlan.map((monthObj, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-lg text-pink-700 mb-3">{monthObj.month}</h4>
                <ul className="space-y-3">
                  {monthObj.books.map((book, bookIndex) => (
                    <li key={bookIndex} className="border-l-2 border-pink-200 pl-3 relative group">
                      <button
                        onClick={() => handleDislikeBook(book)}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                        title="Remove this book"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                      {book.series && (
                        <div className="mb-1">
                          <span className="text-xs font-medium text-indigo-800">{book.series} Series</span>
                        </div>
                      )}
                      <div className="font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-600">{getDisplayName(book)}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">{book.explanation}</div>
                    </li>
                  ))}
                  {monthObj.books.length === 0 && (
                    <li className="text-gray-500 italic">More recommendations coming soon!</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-pink-600" />
            </div>
            <h4 className="text-lg font-semibold text-pink-800 mb-2">
              Your Reading Journey is Being Planned!
            </h4>
            <p className="text-pink-700 mb-4">
              We're creating a personalized 3-month reading plan based on your preferences.
            </p>
            <p className="text-sm text-gray-600">
              Consider starting with books from your favorite genres: <strong>{allSelectedGenres.join(', ')}</strong>
              {selectedInterests.length > 0 && (
                <span> and topics like: <strong>{selectedInterests.join(', ')}</strong></span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Helpful Tips Section - only show when no recommendations */}
      {!hasAnyRecommendations && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl mb-8 border border-blue-200 shadow-sm">
          <h3 className="font-bold text-xl mb-5 text-blue-800 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
            How to Find Your Next Great Read
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-2">🏛️ Visit Your Library</h4>
              <p className="text-sm text-gray-600">
                Ask your librarian for recommendations in <strong>{allSelectedGenres.join(', ')}</strong>. 
                They're experts at matching readers with perfect books!
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-2">👥 Ask Friends & Family</h4>
              <p className="text-sm text-gray-600">
                What are your friends reading? Sometimes the best recommendations come from people who know you well.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-2">🏆 Try Award Winners</h4>
              <p className="text-sm text-gray-600">
                Look for books that have won awards for your age group - they're often crowd-pleasers!
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-2">📚 Explore Book Series</h4>
              <p className="text-sm text-gray-600">
                If you find one book you like, check if it's part of a series - you might love the whole collection!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Share Options */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">Save Your Reading Journey</h3>
        <div className="space-y-4">
          {/* <button
            onClick={handleEmailRecommendations}
            disabled={isSubmitting}
            className="w-full p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            <Send className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-1" />
            Send to Email ({parentEmail})
          </button> */}

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
      </div>

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
  );
};

export default Results;