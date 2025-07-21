import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';
import { 
  Compass, 
  Heart, 
  Sparkles, 
  Wand2, 
  Users, 
  Smile, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Rocket 
} from 'lucide-react';

const youngGenres = [
  { name: 'Adventure Stories', icon: Compass },
  { name: 'Animal Stories', icon: Heart },
  { name: 'Fairy Tales', icon: Sparkles },
  { name: 'Fantasy', icon: Wand2 },
  { name: 'Friendship Stories', icon: Users },
  { name: 'Funny Stories', icon: Smile },
  { name: 'Mystery', icon: Search },
  { name: 'Picture Books', icon: BookOpen },
  { name: 'School Stories', icon: GraduationCap },
  { name: 'Science Fiction', icon: Rocket },
];

const AdditionalGenresYoung: React.FC = () => {
  const { selectedGenres, setSelectedGenres, nextStage, prevStage } = useQuiz();

  const handleGenreClick = (genreName: string) => {
    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genreName));
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        What other types of books do you like?
      </h1>
      <p className="text-xl text-center mb-8">
        Pick any other types of books you enjoy reading!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mb-8">
        {youngGenres.map((genre) => {
          const IconComponent = genre.icon;
          return (
            <Card
              key={genre.name}
              onClick={() => handleGenreClick(genre.name)}
              selected={selectedGenres.includes(genre.name)}
              className="p-6 cursor-pointer text-center hover:bg-blue-50 transition-colors flex flex-col items-center justify-center min-h-[120px]"
            >
              <IconComponent 
                size={32} 
                className={`mb-3 ${selectedGenres.includes(genre.name) ? 'text-blue-600' : 'text-gray-600'}`}
              />
              <span className="text-lg font-medium">{genre.name}</span>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button onClick={prevStage} variant="secondary">
          Back
        </Button>
        <Button onClick={nextStage}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdditionalGenresYoung; 