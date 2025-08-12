import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';

const ParentConsent: React.FC = () => {
  const { nextStage, prevStage } = useQuiz();
  const [hasConsent, setHasConsent] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasConsent) {
      return;
    }
    
    nextStage();
  };
  
  return (
    <div className="px-4 animate-fadeIn sm:px-0">
      <div className="mb-4 text-center sm:mb-6">
        <div className="inline-flex justify-center items-center bg-blue-100 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3">
          <Shield className="text-blue-600 w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Parents' Section</h2>
      </div>
      
      <div className="p-3 mb-4 rounded-lg bg-blue-50 sm:p-4 sm:mb-6">
        <p className="text-xs text-blue-800 sm:text-sm">
          This tool helps us recommend age-appropriate books for your child based on their interests. 
          We'll ask questions about their age, reading preferences, and books they've enjoyed.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="consent"
              type="checkbox"
              checked={hasConsent}
              onChange={() => setHasConsent(!hasConsent)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              required
            />
          </div>
          <div className="ml-2 sm:ml-3">
            <label htmlFor="consent" className="text-xs font-medium text-gray-700 sm:text-sm">
              I give permission for my child to use this tool
            </label>
          </div>
        </div>
        
        <div className="flex flex-col justify-between gap-3 pt-4 sm:flex-row sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStage}
            className="w-full px-3 py-2 text-sm sm:text-base sm:px-4 sm:w-auto"
          >
            Back
          </Button>
          
          <Button 
            type="submit" 
            disabled={!hasConsent}
            className={`text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto ${!hasConsent ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue to Child's Section
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ParentConsent;