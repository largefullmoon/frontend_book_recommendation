import React, { useState } from 'react';
import { BookHeart } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

// Import images from assets
import graphicNovelsImg from '../../assets/cartoon or graphic novels.png';
import humorImg from '../../assets/super silly and funny.png';
import adventureImg from '../../assets/full of action and adventure.png';
import spookyImg from '../../assets/a little spooky or creepy.png';
import fantasyImg from '../../assets/magical and mysterious.png';
import fairyTalesImg from '../../assets/fairy tales.png';
import sciFiImg from '../../assets/science fiction.png';
import superheroImg from '../../assets/superhero stories.png';
import puzzlesImg from '../../assets/smart and tricky stories.png';
import nonFictionImg from '../../assets/real and true stories.png';

const GenreYoung: React.FC = () => {
  const { nextStage, prevStage, name, selectedGenres, setSelectedGenres } = useQuiz();
  const [error, setError] = useState('');
  
  const genres = [
    { 
      id: 'graphic-novels', 
      label: 'Cartoon or graphic novels – fun stories with cool pictures',
      image: graphicNovelsImg
    },
    { 
      id: 'humor', 
      label: 'Super silly and funny – jokes, laughs, and crazy characters',
      image: humorImg
    },
    { 
      id: 'adventure', 
      label: 'Full of action and adventure – where kids go on a mission',
      image: adventureImg
    },
    { 
      id: 'spooky', 
      label: 'A little spooky or creepy – haunted houses, monsters, and mystery',
      image: spookyImg
    },
    { 
      id: 'fantasy', 
      label: 'Magical and mysterious – with dragons, wizards, and spells',
      image: fantasyImg
    },
    { 
      id: 'fairy-tales', 
      label: 'Fairy tales – classic stories with kings, queens, and magical creatures',
      image: fairyTalesImg
    },
    { 
      id: 'sci-fi', 
      label: 'Science fiction – space travel, time machines, and high-tech worlds',
      image: sciFiImg
    },
    { 
      id: 'superhero', 
      label: 'Superhero stories – saving the day with awesome powers',
      image: superheroImg
    },
    { 
      id: 'puzzles', 
      label: 'Smart and tricky stories – puzzles, riddles, and brain teasers',
      image: puzzlesImg
    },
    { 
      id: 'non-fiction', 
      label: 'Real and true stories – facts, history, biographies, and amazing places',
      image: nonFictionImg
    }
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
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {genres.map((genre) => (
          <Card
            key={genre.id}
            selected={selectedGenres.includes(genre.id)}
            selectable
            onClick={() => toggleGenre(genre.id)}
            className="flex flex-col items-center p-4 hover:shadow-md transition-shadow duration-200 text-center"
          >
            <div className={`mb-3 p-5 rounded-lg bg-gray-50 ${selectedGenres.includes(genre.id) ? 'bg-pink-50' : ''}`}>
              <img 
                src={genre.image} 
                alt={genre.label}
                className="w-48 h-48 object-contain"
              />
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">{genre.label}</p>
            </div>
            
            {selectedGenres.includes(genre.id) && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-pink-600"></div>
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