import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

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
  const { showError } = useToast();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleContinue = () => {
    if (selectedGenres.length === 0) {
      showError('Please select at least 1 non-fiction genre');
      return;
    }
    setNonFictionGenres(selectedGenres);
    nextStage();
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-800 mb-3 sm:mb-4">Select Your Favorite Non-Fiction Genres</h2>
        <p className="text-sm sm:text-base text-gray-600">Choose the non-fiction genres you enjoy reading the most.</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">Selected: {selectedGenres.length}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        {NON_FICTION_GENRES.map((genre) => (
          <button
            key={genre.name}
            onClick={() => toggleGenre(genre.name)}
            className={`p-3 sm:p-4 rounded-lg text-left transition-all flex items-center space-x-2 sm:space-x-3 ${
              selectedGenres.includes(genre.name)
                ? 'brand-blue-bg text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl sm:text-2xl flex-shrink-0">{genre.icon}</span>
            <div className="flex-1">
              <span className="text-sm sm:text-base font-medium">{genre.name}</span>
              {selectedGenres.includes(genre.name) && (
                <span className="ml-1 sm:ml-2">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={prevStage}
          className="text-sm sm:text-base px-3 sm:px-4 py-2"
        >
          Back
        </Button>
        
        <Button 
          onClick={handleContinue}
          className="text-sm sm:text-base px-3 sm:px-4 py-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default NonFictionGenres; 