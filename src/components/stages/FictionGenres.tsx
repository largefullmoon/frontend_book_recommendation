import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';

const FICTION_GENRES = [
  { name: 'Adventure', icon: '🗺️' },
  { name: 'Fantasy', icon: '✨' },
  { name: 'Mystery', icon: '🔍' },
  { name: 'Science Fiction', icon: '🚀' },
  { name: 'Historical Fiction', icon: '⏰' },
  { name: 'Contemporary Fiction', icon: '💝' },
  { name: 'Horror', icon: '👻' },
  { name: 'Romance', icon: '💕' },
  { name: 'Thriller', icon: '⚡' },
  { name: 'Comedy', icon: '😄' },
  { name: 'Drama', icon: '🎭' }
];

const FictionGenres: React.FC = () => {
  const { setFictionGenres, nextStage, prevStage } = useQuiz();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleContinue = () => {
    if (selectedGenres.length === 0) {
      setError('Please select at least 1 fiction genre');
      return;
    }
    if (selectedGenres.length > 3) {
      setError('Please select no more than 3 fiction genres');
      return;
    }
    setFictionGenres(selectedGenres);
    nextStage();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Select Your Favorite Fiction Genres</h2>
        <p className="text-gray-600">Choose up to 3 fiction genres you enjoy reading the most.</p>
        <p className="text-sm text-gray-500 mt-2">Selected: {selectedGenres.length}/3</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {FICTION_GENRES.map((genre) => (
          <button
            key={genre.name}
            onClick={() => toggleGenre(genre.name)}
            disabled={!selectedGenres.includes(genre.name) && selectedGenres.length >= 3}
            className={`p-4 rounded-lg text-left transition-all flex items-center space-x-3 ${
              selectedGenres.includes(genre.name)
                ? 'brand-blue-bg text-white'
                : selectedGenres.length >= 3
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl flex-shrink-0">{genre.icon}</span>
            <div className="flex-1">
              <span className="font-medium">{genre.name}</span>
              {selectedGenres.includes(genre.name) && (
                <span className="ml-2">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStage}
          className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default FictionGenres; 