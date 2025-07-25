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

  // Filter out the genres that were already selected in fiction and non-fiction stages
  const selectedGenres = [...fictionGenres, ...nonFictionGenres];
  const remainingGenres = ALL_GENRES.filter(genre => !selectedGenres.includes(genre.name));

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
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Any Other Genres You Like?</h2>
        <p className="text-gray-600">
          From the remaining genres, select any others you'd enjoy reading.
          {selectedAdditional.length > 0 && (
            <span className="block mt-2 text-sm text-indigo-600">
              You've selected {selectedAdditional.length} additional genre{selectedAdditional.length !== 1 ? 's' : ''}.
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {remainingGenres.map((genre) => (
          <Card
            key={genre.name}
            selected={selectedAdditional.includes(genre.name)}
            selectable
            onClick={() => toggleGenre(genre.name)}
            className="flex items-center p-4"
          >
            <span className="text-2xl mr-3">{genre.icon}</span>
            <div className="flex-1">
              <p className="text-md font-medium">{genre.name}</p>
            </div>
            
            {selectedAdditional.includes(genre.name) && (
              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-indigo-600"></div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={prevStage}
        >
          Back
        </Button>
        
        <Button 
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AdditionalGenres; 