import React, { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';

const NameInput: React.FC = () => {
  const { nextStage, prevStage, name, setName } = useQuiz();
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters)');
      return;
    }
    
    nextStage();
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <SmilePlus className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hi there!</h2>
        <p className="text-lg text-gray-600">I'm Bookie, your reading buddy!</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">
            What's your name?
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            autoFocus
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type your name here"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStage}
          >
            Back
          </Button>
          
          <Button 
            type="submit"
            size="lg"
            className="animate-pulse-subtle"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NameInput;