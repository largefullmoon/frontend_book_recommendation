import React from 'react';
import { Sparkles } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';

const YoungInterests: React.FC = () => {
  const { nextStage, prevStage, name, selectedInterests, setSelectedInterests } = useQuiz();
  
  const interests = [
    { id: 'dinosaurs', label: 'Dinosaurs', icon: '🦖' },
    { id: 'space', label: 'Space and planets', icon: '🚀' },
    { id: 'animals', label: 'Animals and nature', icon: '🦁' },
    { id: 'vehicles', label: 'Cars, trucks, and machines', icon: '🚗' },
    { id: 'planes', label: 'Planes, airports, and flying', icon: '✈️' },
    { id: 'sports', label: 'Football, cricket, Basketball or other sports', icon: '⚽' },
    { id: 'science', label: 'Science experiments and fun facts', icon: '🧪' },
    { id: 'jobs', label: 'People who do amazing jobs', icon: '👩‍🚒' },
    { id: 'art', label: 'Art, coloring, and crafts', icon: '🎨' },
    { id: 'robots', label: 'Robots and inventions', icon: '🤖' },
    { id: 'aliens', label: 'Aliens and weird creatures', icon: '👽' }
  ];
  
  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pick the things you love, {name}!
        </h2>
        <p className="text-gray-600">
          Touch all the pictures of things you like to read about:
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {interests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`
              h-28 rounded-lg flex flex-col items-center justify-center transition-all duration-200
              ${selectedInterests.includes(interest.id) 
                ? 'bg-purple-100 border-2 border-purple-400 shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200'}
            `}
          >
            <span className="text-3xl mb-1">{interest.icon}</span>
            <span className="text-sm font-medium text-center px-2">{interest.label}</span>
          </button>
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
          disabled={selectedInterests.length === 0}
          className={selectedInterests.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default YoungInterests;