import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';

const NON_FICTION_GENRES = [
  { name: 'Poetry', icon: '📝' },
  { name: 'Biography', icon: '👤' },
  { name: 'Science', icon: '🔬' },
  { name: 'History', icon: '🏛️' },
  { name: 'Arts & Music', icon: '🎨' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Technology', icon: '💻' },
  { name: 'Self-Help', icon: '🧘' },
  { name: 'Health & Fitness', icon: '💪' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Cooking', icon: '👨‍🍳' },
  { name: 'Philosophy', icon: '🤔' }
];

const NonFictionGenres: React.FC = () => {
  const { setNonFictionGenres, nextStage, prevStage } = useQuiz();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleContinue = () => {
    if (selectedGenres.length === 0) {
      setError('Please select at least 1 non-fiction genre');
      return;
    }
    setNonFictionGenres(selectedGenres);
    nextStage();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Select Your Favorite Non-Fiction Genres</h2>
        <p className="text-gray-600">Choose the non-fiction genres you enjoy reading the most.</p>
        <p className="text-sm text-gray-500 mt-2">Selected: {selectedGenres.length}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {NON_FICTION_GENRES.map((genre) => (
          <button
            key={genre.name}
            onClick={() => toggleGenre(genre.name)}
            className={`p-4 rounded-lg text-left transition-all flex items-center space-x-3 ${
              selectedGenres.includes(genre.name)
                ? 'brand-blue-bg text-white'
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

export default NonFictionGenres; 