import React from 'react';
import { BookText } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

const GenreNonFiction: React.FC = () => {
  const { nextStage, prevStage, name, nonFictionInterests, setNonFictionInterests } = useQuiz();
  
  const nonFictionTypes = [
    { id: 'puzzles', label: 'Puzzles and logic – books with riddles, problem-solving, or clever twists' },
    { id: 'history', label: 'History – stories from the past, important events, and people' },
    { id: 'science', label: 'Science – experiments, discoveries, and how things work' },
    { id: 'biographies', label: 'Biographies – stories about real people who did amazing things' },
    { id: 'facts', label: 'Amazing facts – fascinating information about our world' },
    { id: 'social', label: 'Social and cultural issues – books about identity, justice, or different communities' },
    { id: 'self-help', label: 'Self-help and personal growth – books that help you build confidence, focus, or good habits' }
  ];
  
  const toggleInterest = (interestId: string) => {
    if (nonFictionInterests.includes(interestId)) {
      setNonFictionInterests(nonFictionInterests.filter(id => id !== interestId));
    } else {
      setNonFictionInterests([...nonFictionInterests, interestId]);
    }
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <BookText className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Non-Fiction Topics
        </h2>
        <p className="text-gray-600">
          {name}, do you enjoy reading any of these types of non-fiction? Select all that interest you:
        </p>
      </div>
      
      <div className="space-y-3 mb-8">
        {nonFictionTypes.map((type) => (
          <Card
            key={type.id}
            selected={nonFictionInterests.includes(type.id)}
            selectable
            onClick={() => toggleInterest(type.id)}
            className="flex items-center p-4"
          >
            <div className="flex-1">
              <p className="text-md font-medium">{type.label}</p>
            </div>
            
            {nonFictionInterests.includes(type.id) && (
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-600"></div>
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

export default GenreNonFiction;