import React, { useState } from 'react';
import { BookHeart } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { useToast } from '../../context/ToastContext';
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
  const { showError } = useToast();

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
      label: 'Sports, Real and true stories – sports, facts, history, biographies, and amazing places',
      image: nonFictionImg
    }
  ];

  const toggleGenre = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres([...selectedGenres, genreId]);
      } else {
        showError('Please select only your top 3 favourites. If you want to change any of your current selection, first deselect that and then select other choice.');
      }
    }
  };

  const handleNext = () => {
    if (selectedGenres.length !== 3) {
      showError('Please select exactly 3 favourites before continuing!');
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
          Pick your top 3 favourites!
        </p>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8 px-2 sm:px-0">
        {genres.map((genre) => (
          <Card
            key={genre.id}
            selected={selectedGenres.includes(genre.id)}
            selectable
            onClick={() => toggleGenre(genre.id)}
            className={`
              relative flex flex-col items-center p-3 sm:p-4
              hover:shadow-lg transition-all duration-300 ease-in-out text-center
              transform hover:-translate-y-1
              ${selectedGenres.includes(genre.id) 
                ? 'ring-2 ring-pink-500 shadow-md scale-[1.02]' 
                : 'hover:scale-[1.01]'
              }
            `}
          >
            <div 
              className={`
                w-full mb-3 p-3 sm:p-4 rounded-xl
                ${selectedGenres.includes(genre.id) 
                  ? 'bg-pink-50 shadow-inner' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }
                transition-colors duration-300
              `}
            >
              <img 
                src={genre.image} 
                alt={genre.label}
                className="w-full h-32 sm:h-40 lg:h-48 object-contain mx-auto 
                         transform transition-transform duration-300 
                         hover:scale-105"
                loading="lazy"
              />
            </div>
            
            <div className="flex-1 w-full">
              <p className="text-xs sm:text-sm font-medium leading-tight 
                          text-gray-800 hover:text-gray-900 
                          transition-colors duration-200">
                {genre.label}
              </p>
            </div>
            
            {selectedGenres.includes(genre.id) && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full 
                            bg-pink-100 flex items-center justify-center
                            transform scale-100 animate-pulse">
                <div className="h-3 w-3 rounded-full bg-pink-600 shadow-sm"></div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={prevStage}
          className="px-6 py-2"
        >
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="px-6 py-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default GenreYoung;