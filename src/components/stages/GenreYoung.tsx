import React, { useState } from 'react';
import { BookHeart } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

const GenreYoung: React.FC = () => {
  const { nextStage, prevStage, name, selectedGenres, setSelectedGenres } = useQuiz();
  const [error, setError] = useState('');
  
  const genres = [
    { id: 'graphic-novels', label: 'Cartoon or graphic novels – fun stories with cool pictures' },
    { id: 'humor', label: 'Super silly and funny – jokes, laughs, and crazy characters' },
    { id: 'adventure', label: 'Full of action and adventure – where kids go on a mission' },
    { id: 'spooky', label: 'A little spooky or creepy – haunted houses, monsters, and mystery' },
    { id: 'fantasy', label: 'Magical and mysterious – with dragons, wizards, and spells' },
    { id: 'fairy-tales', label: 'Fairy tales – classic stories with kings, queens, and magical creatures' },
    { id: 'sci-fi', label: 'Science fiction – space travel, time machines, and high-tech worlds' },
    { id: 'superhero', label: 'Superhero stories – saving the day with awesome powers' },
    { id: 'puzzles', label: 'Smart and tricky stories – puzzles, riddles, and brain teasers' },
    { id: 'non-fiction', label: 'Real and true stories – facts, history, biographies, and amazing places' }
  ];
  
  const toggleGenre = (genreId: string) => {
    setError('');
    
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres([...selectedGenres, genreId]);
      } else {
        setError('Please select only your top 3 favorites!');
      }
    }
  };
  
  const handleNext = () => {
    if (selectedGenres.length !== 3) {
      setError('Please select exactly 3 favorites before continuing!');
    } else {
      nextStage();
    }
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
          <BookHeart className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          😄 What kinds of stories do you love the most, {name}?
        </h2>
        <p className="text-gray-600 mb-1">
          Pick your top 3 favorites!
        </p>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
      
      <div className="space-y-3 mb-8">
        {genres.map((genre) => (
          <Card
            key={genre.id}
            selected={selectedGenres.includes(genre.id)}
            selectable
            onClick={() => toggleGenre(genre.id)}
            className="flex items-center p-4"
          >
            <div className="flex-1">
              <p className="text-md font-medium">{genre.label}</p>
            </div>
            
            {selectedGenres.includes(genre.id) && (
              <div className="h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-pink-600"></div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStage}
        >
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default GenreYoung;