import React, { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

const NameInput: React.FC = () => {
  const { nextStage, prevStage, name, setName } = useQuiz();
  const { showError } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      showError('Please enter your name (at least 2 characters)');
      return;
    }
    
    nextStage();
  };
  
  return (
    <div className="animate-fadeIn px-4 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
          <SmilePlus className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Hi there!</h2>
        <p className="text-base sm:text-lg text-gray-600">I'm Bookie, your reading buddy!</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="name" className="block text-base sm:text-lg font-medium text-gray-700 mb-2">
            What's your name?
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type your name here"
          />

        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStage}
            className="text-sm sm:text-base px-3 sm:px-4 py-2"
          >
            Back
          </Button>
          
          <Button 
            type="submit"
            className="text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 animate-pulse-subtle"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NameInput;