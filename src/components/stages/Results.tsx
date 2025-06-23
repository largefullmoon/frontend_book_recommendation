import React, { useState, useEffect } from 'react';
import { BookMarked, Send, RefreshCw, BookOpen, ExternalLink, Star, Calendar } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Book {
  title: string;
  author: string;
  explanation: string;
}

interface FutureMonth {
  month: string;
  books: Book[];
}

interface SampleBook {
  title: string;
  author: string;
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
    resetQuiz
  } = useQuiz();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentRecommendations, setCurrentRecommendations] = useState<Book[]>([]);
  const [futureReadingPlan, setFutureReadingPlan] = useState<FutureMonth[]>([]);
  const [seriesRecommendations, setSeriesRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="animate-fadeIn">
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
      </div>

      {/* Current Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl mb-8 border border-indigo-100 shadow-sm">
        <h3 className="font-bold text-xl mb-5 text-indigo-800 flex items-center">
          <Star className="w-6 h-6 mr-2 text-yellow-500" />
          Top Picks for You
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentRecommendations.map((book, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <BookMarked className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-1">{book.title}</h4>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">{book.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
        <div className="grid gap-4 md:grid-cols-3">
          {futureReadingPlan.map((monthObj, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg text-pink-700 mb-3">{monthObj.month}</h4>
              <ul className="space-y-3">
                {monthObj.books.map((book, bookIndex) => (
                  <li key={bookIndex} className="border-l-2 border-pink-200 pl-3">
                    <div className="font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-600">by {book.author}</div>
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
      </div>

      {/* Share Options */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">Save Your Reading Journey</h3>
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