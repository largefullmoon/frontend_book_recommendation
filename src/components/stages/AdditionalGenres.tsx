import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

const AdditionalGenres: React.FC = () => {
  const { nextStage, prevStage, fictionGenres, nonFictionGenres, setAdditionalGenres } = useQuiz();
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);

  // Define all genres with emoji icons
  const ALL_GENRES = [
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
    { name: 'Drama', icon: '🎭' },
    { name: 'Poetry', icon: '📝' },
    { name: 'Biography', icon: '👤' },
    { name: 'Science', icon: '🔬' },
    { name: 'History', icon: '🏛️' },
    { name: 'Arts & Music', icon: '🎨' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Technology', icon: '💻' }
  ];

  // Filter out ALL genres that were already selected in fiction, additional fiction, and non-fiction stages
  const allSelectedGenres = [...fictionGenres, ...nonFictionGenres];
  const remainingGenres = ALL_GENRES.filter(genre => !allSelectedGenres.includes(genre.name));

  const toggleGenre = (genre: string) => {
    setSelectedAdditional(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleContinue = () => {
    setAdditionalGenres(selectedAdditional);
    nextStage();
  };

  return (
    <div className="space-y-6">
      <div className="text-center px-4 sm:px-0">
        <h2 className="mb-4 text-xl sm:text-2xl font-bold text-indigo-800">Any Other Genres You Like?</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          From the remaining genres, select any others you'd enjoy reading.
          {selectedAdditional.length > 0 && (
            <span className="block mt-2 text-sm text-indigo-600">
              You've selected {selectedAdditional.length} additional genre{selectedAdditional.length !== 1 ? 's' : ''}.
            </span>
          )}
        </p>
      </div>

      {remainingGenres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-0">
          {remainingGenres.map((genre) => (
            <Card
              key={genre.name}
              selected={selectedAdditional.includes(genre.name)}
              selectable
              onClick={() => toggleGenre(genre.name)}
              className="flex items-center p-3 sm:p-4"
            >
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">{genre.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-md">{genre.name}</p>
              </div>
              
              {selectedAdditional.includes(genre.name) && (
                <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full">
                  <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-lg text-gray-500">You've already selected all available genres!</p>
          <p className="mt-2 text-sm text-gray-400">Great job exploring different reading preferences!</p>
        </div>
      )}

      <div className="flex justify-between pt-4 px-4 sm:px-0">
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

export default AdditionalGenres; 