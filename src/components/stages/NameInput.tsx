import React, { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import Icon from '../../assets/icon.jpeg'
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
    <div className="px-4 animate-fadeIn sm:px-0">
      <div className="mb-6 text-center sm:mb-8">
        <div className="flex items-center justify-center mx-auto mb-3 bg-yellow-100 rounded-full w-28 h-28 sm:w-32 sm:h-32 sm:mb-4">
          <img src={Icon} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl">Hi there!</h2>
        <p className="text-base text-gray-600 sm:text-lg">I'm Bookie, your reading buddy!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="name" className="block mb-2 text-base font-medium text-gray-700 sm:text-lg">
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
            className="px-3 py-2 text-sm sm:text-base sm:px-4"
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