import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Logo from '../../assets/logo.jpg';
const StartScreen: React.FC = () => {
  const { nextStage } = useQuiz();

  return (
    <div className="text-center py-6 sm:py-8 animate-fadeIn px-4 sm:px-0">
      <div className="flex justify-center mb-4 sm:mb-6">
        <img src={Logo} alt="JustBookify Logo" className="w-40 sm:w-60" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-3 sm:mb-4">
        Book Recommendations Just for You!
      </h1>

      <div className="max-w-md mx-auto">
        <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
          Hi there! I'm Bookie, your reading buddy at JustBookify.com<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Let me help you find your next favorite books. It's fun and easy! Take a quick quiz with me, and I'll help you discover books you'll love.
        </p>

        <div className="flex flex-col space-y-4 items-center">
          <Button
            size="lg"
            onClick={nextStage}
            className="animate-bounce-gentle text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
          >
            Start Your Reading Adventure
          </Button>

          <p className="text-xs sm:text-sm text-gray-500 px-4 sm:px-0">
            Parents, we'll ask for your consent before your child begins.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;