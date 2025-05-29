import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';

const GENRES = [
  'Adventure',
  'Fantasy',
  'Mystery',
  'Science Fiction',
  'Historical Fiction',
  'Contemporary Fiction',
  'Horror',
  'Romance',
  'Thriller',
  'Comedy',
  'Drama',
  'Poetry',
  'Biography',
  'Science',
  'History',
  'Arts & Music',
  'Sports',
  'Technology'
];

const TopThreeGenres: React.FC = () => {
  const { setTopThreeGenres, nextStage, prevStage } = useQuiz();
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
    if (selectedGenres.length !== 3) {
      setError('Please select exactly 3 genres');
      return;
    }
    setTopThreeGenres(selectedGenres);
    nextStage();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Select Your Top 3 Favorite Genres</h2>
        <p className="text-gray-600">Choose the three genres you enjoy reading the most.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GENRES.map((genre, index) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`p-4 rounded-lg text-left transition-all ${
              selectedGenres.includes(genre)
                ? index % 2 === 0
                  ? 'brand-blue-bg text-white'
                  : 'brand-green-bg text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="font-medium">{genre}</span>
            {selectedGenres.includes(genre) && (
              <span className="ml-2">✓</span>
            )}
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

export default TopThreeGenres; 