import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Logo from '../../assets/logo.jpg';
const StartScreen: React.FC = () => {
  const { nextStage } = useQuiz();

  return (
    <div className="text-center py-8 animate-fadeIn">
      <div className="flex justify-center mb-6">
        <img src={Logo} alt="JustBookify Logo" className="w-60" />
      </div>

      <h1 className="text-3xl font-bold text-indigo-800 mb-4">
        Book Recommendations Just for You!
      </h1>

      <div className="max-w-md mx-auto">
        <p className="text-lg text-gray-700 mb-8">
          Hi there! I'm Bookie, your reading buddy at JustBookify.com<br />
          Let me help you find your next favorite books. It's fun and easy! Take a quick quiz with me, and I'll help you discover books you'll love.
        </p>

        <div className="flex flex-col space-y-4 items-center">
          <Button
            size="lg"
            onClick={nextStage}
            className="animate-bounce-gentle"
          >
            Start Your Reading Adventure
          </Button>

          <p className="text-sm text-gray-500">
            Parents, we'll ask for your consent before your child begins.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;