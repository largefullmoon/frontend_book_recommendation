import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

const youngGenres = [
  'Adventure Stories',
  'Animal Stories',
  'Fairy Tales',
  'Fantasy',
  'Friendship Stories',
  'Funny Stories',
  'Mystery',
  'Picture Books',
  'School Stories',
  'Science Fiction',
];

const AdditionalGenresYoung: React.FC = () => {
  const { selectedGenres, setSelectedGenres, nextStage, prevStage } = useQuiz();

  const handleGenreClick = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
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
        {youngGenres.map((genre) => (
          <Card
            key={genre}
            onClick={() => handleGenreClick(genre)}
            selected={selectedGenres.includes(genre)}
            className="p-4 cursor-pointer text-center hover:bg-blue-50 transition-colors"
          >
            <span className="text-lg">{genre}</span>
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