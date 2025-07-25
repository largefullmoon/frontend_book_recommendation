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

const FictionGenresAdditional: React.FC = () => {
  const { fictionGenres, setFictionGenres, nextStage, prevStage } = useQuiz();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Filter out the genres that were already selected in the first fiction stage
  const remainingGenres = FICTION_GENRES.filter(genre => !fictionGenres.includes(genre.name));

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleContinue = () => {
    // Combine the top 3 from first stage with additional selections
    const allFictionGenres = [...fictionGenres, ...selectedGenres];
    setFictionGenres(allFictionGenres);
    nextStage();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Any Other Fiction Genres You Like?</h2>
        <p className="text-gray-600">
          From the remaining fiction genres, select any others you'd enjoy reading.
          {selectedGenres.length > 0 && (
            <span className="block mt-2 text-sm text-indigo-600">
              You've selected {selectedGenres.length} additional genre{selectedGenres.length !== 1 ? 's' : ''}.
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {remainingGenres.map((genre) => (
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

export default FictionGenresAdditional; 