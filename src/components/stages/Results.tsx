import React, { useState, useEffect } from 'react';
import { BookMarked, Send, RefreshCw } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Recommendation {
  title: string;
  author: string;
  link: string;
}

interface ReadingPlan {
  month: string;
  books: string[];
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
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [readingPlan, setReadingPlan] = useState<ReadingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${API_BASE_URL}/recommendation-plan`, {
          name,
          age,
          selectedGenres,
          selectedInterests,
          nonFictionInterests,
          bookSeries,
          parentEmail,
          parentPhone
        });

        setRecommendations(response.data.recommendations);
        setReadingPlan(response.data.readingPlan);
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
        recommendations,
        readingPlan,
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
        recommendations,
        readingPlan,
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
      
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg mb-8 border border-indigo-100">
        <h3 className="font-bold text-lg mb-4 text-indigo-800">Your Book Recommendations:</h3>
        <div className="space-y-4">
          {recommendations.map((book, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <BookMarked className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-indigo-900">{book.title}</h4>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <a href={book.link} className="text-xs text-indigo-600 hover:underline">
                  View on JustBookify
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-5 rounded-lg mb-8 border border-pink-100">
        <h3 className="font-bold text-lg mb-4 text-pink-800">Your 3-Month Reading Plan:</h3>
        <div className="space-y-4">
          {readingPlan.map((month, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
              <h4 className="font-medium text-pink-700">{month.month}</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {month.books.map((book, bookIndex) => (
                  <li key={bookIndex}>{book}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-8">
        <h3 className="font-medium mb-3">Want to save these recommendations?</h3>
        <div className="space-y-4">
          <button
            onClick={handleEmailRecommendations}
            disabled={isSubmitting}
            className="w-full p-4 brand-blue-bg text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send to Email ({parentEmail})
          </button>

          <button
            onClick={handleWhatsAppRecommendations}
            disabled={isSubmitting}
            className="w-full p-4 brand-green-bg text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
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