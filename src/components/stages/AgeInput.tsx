import React from 'react';
import { Cake } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';

const AgeInput: React.FC = () => {
  const { nextStage, prevStage, name, age, setAge } = useQuiz();
  
  const ageOptions = Array.from({ length: 15 }, (_, i) => i + 4);
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Cake className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          How old are you, {name}?
        </h2>
        <p className="text-gray-600">
          This helps me find books that are just right for you!
        </p>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
        {ageOptions.map((option) => (
          <button
            key={option}
            onClick={() => setAge(option)}
            className={`
              py-3 rounded-lg transition-all duration-200 text-lg font-medium
              ${age === option 
                ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {option}
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
          disabled={age === null}
          className={age === null ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AgeInput;