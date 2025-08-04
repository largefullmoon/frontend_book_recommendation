import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

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
  const { showError } = useToast();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleContinue = () => {
    if (selectedGenres.length !== 3) {
      showError('Please select exactly 3 genres');
      return;
    }
    setTopThreeGenres(selectedGenres);
    nextStage();
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-800 mb-3 sm:mb-4">Select Your Top 3 Favorite Genres</h2>
        <p className="text-sm sm:text-base text-gray-600">Choose the three genres you enjoy reading the most.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`p-3 sm:p-4 rounded-lg text-left transition-all ${
              selectedGenres.includes(genre)
                ? 'brand-blue-bg text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="text-sm sm:text-base font-medium">{genre}</span>
            {selectedGenres.includes(genre) && (
              <span className="ml-2">✓</span>
            )}
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

export default TopThreeGenres; 