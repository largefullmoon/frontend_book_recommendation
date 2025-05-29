import React from 'react';
import { BookOpen } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

const ParentReading: React.FC = () => {
  const { nextStage, prevStage, name, parentReading, setParentReading } = useQuiz();
  
  const options = [
    { id: 'always', label: 'Always' },
    { id: 'mostly', label: 'Mostly' },
    { id: 'sometimes', label: 'Sometimes' },
    { id: 'never', label: 'Not anymore, I read myself' }
  ];
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {name}, do your parents read books to you?
        </h2>
      </div>
      
      <div className="space-y-3 mb-8">
        {options.map((option) => (
          <Card
            key={option.id}
            selected={parentReading === option.id}
            selectable
            onClick={() => setParentReading(option.id)}
            className="flex items-center p-4"
          >
            <div className="flex-1">
              <p className="text-lg font-medium">{option.label}</p>
            </div>
            
            {parentReading === option.id && (
              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-indigo-600"></div>
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
          disabled={!parentReading}
          className={!parentReading ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ParentReading;