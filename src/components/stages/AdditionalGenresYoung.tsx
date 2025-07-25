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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mb-8">
        {youngGenres.map((genre) => (
          <Card
            key={genre.name}
            onClick={() => handleGenreClick(genre.name)}
            selected={selectedGenres.includes(genre.name)}
            className="p-6 cursor-pointer text-center hover:bg-blue-50 transition-colors flex flex-col items-center justify-center min-h-[120px]"
          >
            <img
              src={genre.img}
              alt={genre.name}
              style={{
                width: 96,
                height: 96,
                filter: selectedGenres.includes(genre.name)
                  ? 'drop-shadow(0 0 6px #2196f3)'
                  : 'none',
                marginBottom: 12,
                objectFit: 'contain',
              }}
            />
            <span className="text-lg font-medium">{genre.name}</span>
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