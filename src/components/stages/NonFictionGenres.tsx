import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';

const NON_FICTION_GENRES = [
  'Poetry',
  'Biography',
  'Science',
  'History',
  'Arts & Music',
  'Sports',
  'Technology',
  'Self-Help',
  'Health & Fitness',
  'Travel',
  'Cooking',
  'Philosophy'
];

const NonFictionGenres: React.FC = () => {
  const { setNonFictionGenres, nextStage, prevStage } = useQuiz();
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
      setError('Please select at least 1 non-fiction genre');
      return;
    }
    if (selectedGenres.length > 3) {
      setError('Please select no more than 3 non-fiction genres');
      return;
    }
    setNonFictionGenres(selectedGenres);
    nextStage();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Select Your Favorite Non-Fiction Genres</h2>
        <p className="text-gray-600">Choose up to 3 non-fiction genres you enjoy reading the most.</p>
        <p className="text-sm text-gray-500 mt-2">Selected: {selectedGenres.length}/3</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {NON_FICTION_GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            disabled={!selectedGenres.includes(genre) && selectedGenres.length >= 3}
            className={`p-4 rounded-lg text-left transition-all ${
              selectedGenres.includes(genre)
                ? 'brand-blue-bg text-white'
                : selectedGenres.length >= 3
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
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

export default NonFictionGenres; 