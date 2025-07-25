import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';
// Import PNG icons from assets
import adventureImg from '../../assets/full of action and adventure.png';
import animalImg from '../../assets/smart and tricky stories.png';
import fairyTalesImg from '../../assets/fairy tales.png';
import fantasyImg from '../../assets/magical and mysterious.png';
import friendshipImg from '../../assets/real and true stories.png';
import funnyImg from '../../assets/super silly and funny.png';
import mysteryImg from '../../assets/a little spooky or creepy.png';
import pictureBooksImg from '../../assets/cartoon or graphic novels.png';
import schoolImg from '../../assets/real and true stories.png'; // No clear school image, using real and true stories
import scienceFictionImg from '../../assets/science fiction.png';

const youngGenres = [
  { name: 'Adventure Stories', img: adventureImg },
  { name: 'Animal Stories', img: animalImg },
  { name: 'Fairy Tales', img: fairyTalesImg },
  { name: 'Fantasy', img: fantasyImg },
  { name: 'Friendship Stories', img: friendshipImg },
  { name: 'Funny Stories', img: funnyImg },
  { name: 'Mystery', img: mysteryImg },
  { name: 'Picture Books', img: pictureBooksImg },
  { name: 'School Stories', img: schoolImg },
  { name: 'Science Fiction', img: scienceFictionImg },
];

const AdditionalGenresYoung: React.FC = () => {
  const { selectedGenres, additionalGenres, setAdditionalGenres, nextStage, prevStage } = useQuiz();

  // Map the selected genre IDs to display names for filtering
  const genreIdToDisplayName: Record<string, string> = {
    'graphic-novels': 'Picture Books',
    'humor': 'Funny Stories',
    'adventure': 'Adventure Stories',
    'spooky': 'Mystery',
    'fantasy': 'Fantasy',
    'fairy-tales': 'Fairy Tales',
    'sci-fi': 'Science Fiction',
    'superhero': 'Adventure Stories', // No direct superhero category in additional, using adventure
    'puzzles': 'Animal Stories', // No direct puzzles category, using animal stories
    'non-fiction': 'Friendship Stories' // No direct non-fiction category, using friendship stories
  };

  // Filter out genres that were already selected in the first stage
  const selectedDisplayNames = selectedGenres.map(id => genreIdToDisplayName[id]).filter(Boolean);
  const remainingGenres = youngGenres.filter(genre => !selectedDisplayNames.includes(genre.name));

  const handleGenreClick = (genreName: string) => {
    if (additionalGenres.includes(genreName)) {
      setAdditionalGenres(additionalGenres.filter(g => g !== genreName));
    } else {
      setAdditionalGenres([...additionalGenres, genreName]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        What other types of books do you like?
      </h1>
      <p className="text-xl text-center mb-8">
        From the remaining types, pick any others you enjoy reading!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mb-8">
        {remainingGenres.map((genre) => (
          <Card
            key={genre.name}
            onClick={() => handleGenreClick(genre.name)}
            selected={additionalGenres.includes(genre.name)}
            className="flex flex-col items-center p-4 hover:shadow-md transition-shadow duration-200 text-center"
          >
            <div className={`mb-3 p-5 rounded-lg bg-gray-50 ${additionalGenres.includes(genre.name) ? 'bg-pink-50' : ''}`}>
              <img
                src={genre.img}
                alt={genre.name}
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">{genre.name}</p>
            </div>
            {additionalGenres.includes(genre.name) && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-pink-600"></div>
              </div>
            )}
          </Card>
        ))}
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