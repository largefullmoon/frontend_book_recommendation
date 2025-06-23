import React, { useState, useEffect } from 'react';
import { BookMarked, Send, RefreshCw, BookOpen } from 'lucide-react';
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
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <BookMarked className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-indigo-800 mb-2">
          Great job, {name}!
        </h2>
        <p className="text-gray-600">
          Based on what you've told us, here are some books we think you'll love:
        </p>
      </div>

      {/* Current Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg mb-8 border border-indigo-100">
        <h3 className="font-bold text-lg mb-4 text-indigo-800">Your Immediate Book Recommendations:</h3>
        <div className="space-y-4">
          {currentRecommendations.map((book, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <BookMarked className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-indigo-900">{book.title}</h4>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <p className="text-xs text-gray-500 mt-1">{book.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Series/Author Recommendations */}
      {seriesRecommendations.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg mb-8 border border-blue-100">
          <h3 className="font-bold text-lg mb-4 text-blue-800">Recommended Series & Authors:</h3>
          <div className="space-y-6">
            {seriesRecommendations.map((rec, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">{rec.name}</h4>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Match: {rec.confidence_score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                <a 
                  href={rec.justbookify_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center mb-3"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  View on Justbookify
                </a>
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">Sample Books:</p>
                  <ul className="list-disc list-inside">
                    {rec.sample_books.map((book, bookIndex) => (
                      <li key={bookIndex}>
                        {book.title} by {book.author}
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
      <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-5 rounded-lg mb-8 border border-pink-100">
        <h3 className="font-bold text-lg mb-4 text-pink-800">Your 3-Month Reading Plan:</h3>
        <div className="space-y-4">
          {futureReadingPlan.map((monthObj, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
              <h4 className="font-medium text-pink-700">{monthObj.month}</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {monthObj.books.map((book, bookIndex) => (
                  <li key={bookIndex} className="mb-2">
                    <span className="font-semibold text-indigo-800">{book.title}</span> by {book.author}
                    <div className="text-xs text-gray-500">{book.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Share Options */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-8">
        <h3 className="font-medium mb-3">Want to save these recommendations?</h3>
        <div className="space-y-4">
          <button
            onClick={handleEmailRecommendations}
            disabled={isSubmitting}
            className="w-full p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Email ({parentEmail})
          </button>

          <button
            onClick={handleWhatsAppRecommendations}
            disabled={isSubmitting}
            className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to WhatsApp ({parentPhone})
          </button>

          {success && (
            <p className="text-green-600 text-center">{success}</p>
          )}

          {error && (
            <p className="text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Start Over Button */}
      <div className="flex justify-center">
        <Button
          onClick={resetQuiz}
          variant="outline"
          className="flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      </div>
    </div>
  );
};

export default Results;