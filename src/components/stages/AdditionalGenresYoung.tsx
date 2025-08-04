import React from 'react';
import { BookHeart } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

// Import images from assets - same as GenreYoung
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

const AdditionalGenresYoung: React.FC = () => {
  const { selectedGenres, additionalGenres, setAdditionalGenres, nextStage, prevStage, name } = useQuiz();

  // Same genres structure as GenreYoung
  const allGenres = [
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

  // Filter out genres that were already selected in the first stage
  const remainingGenres = allGenres.filter(genre => !selectedGenres.includes(genre.id));

  const handleGenreClick = (genreId: string) => {
    if (additionalGenres.includes(genreId)) {
      setAdditionalGenres(additionalGenres.filter(id => id !== genreId));
    } else {
      setAdditionalGenres([...additionalGenres, genreId]);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
          <BookHeart className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          😄 What other types of stories do you like, {name}?
        </h2>
        <p className="text-gray-600 mb-1">
          Pick any others you enjoy reading!
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8 px-2 sm:px-0">
        {remainingGenres.map((genre) => (
          <Card
            key={genre.id}
            selected={additionalGenres.includes(genre.id)}
            selectable
            onClick={() => handleGenreClick(genre.id)}
            className={`
              relative flex flex-col items-center p-3 sm:p-4 
              hover:shadow-lg transition-all duration-300 ease-in-out text-center
              transform hover:-translate-y-1 
              ${additionalGenres.includes(genre.id) ? 'ring-2 ring-pink-500 shadow-md' : ''}
            `}
          >
            <div className={`
              w-full mb-3 p-3 sm:p-4 rounded-xl 
              ${additionalGenres.includes(genre.id) ? 'bg-pink-50' : 'bg-gray-50'}
              transition-colors duration-300
            `}>
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
            
            {additionalGenres.includes(genre.id) && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full 
                            bg-pink-100 flex items-center justify-center
                            transform scale-100 animate-pulse">
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
          onClick={nextStage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdditionalGenresYoung; 