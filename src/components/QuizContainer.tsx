import React from 'react';
import { useQuiz } from '../context/QuizContext';
import ProgressBar from './ProgressBar';
import StartScreen from './stages/StartScreen';
import ParentConsent from './stages/ParentConsent';
import ParentContact from './stages/ParentContact';
import NameInput from './stages/NameInput';
import AgeInput from './stages/AgeInput';
import ParentReading from './stages/ParentReading';
import GenreYoung from './stages/GenreYoung';
import TopThreeGenres from './stages/TopThreeGenres';
import AdditionalGenres from './stages/AdditionalGenres';
import FictionNonFictionRatio from './stages/FictionNonFictionRatio';
import GenreNonFiction from './stages/GenreNonFiction';
import YoungInterests from './stages/YoungInterests';
import BookSeries from './stages/BookSeries';
import Results from './stages/Results';

const QuizContainer: React.FC = () => {
  const { stage, progress } = useQuiz();
  
  const renderStage = () => {
    switch (stage) {
      case 'start':
        return <StartScreen />;
      case 'parentConsent':
        return <ParentConsent />;
      case 'parentContact':
        return <ParentContact />;
      case 'name':
        return <NameInput />;
      case 'age':
        return <AgeInput />;
      case 'parentReading':
        return <ParentReading />;
      case 'genreYoung':
        return <GenreYoung />;
      case 'topThreeGenres':
        return <TopThreeGenres />;
      case 'additionalGenres':
        return <AdditionalGenres />;
      case 'fictionNonFictionRatio':
        return <FictionNonFictionRatio />;
      case 'genreNonFiction':
        return <GenreNonFiction />;
      case 'youngInterests':
        return <YoungInterests />;
      case 'bookSeries':
        return <BookSeries />;
      case 'results':
        return <Results />;
      default:
        return <StartScreen />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ease-in-out">
      {stage !== 'start' && stage !== 'results' && (
        <div className="p-4 bg-indigo-100">
          <ProgressBar progress={progress} />
        </div>
      )}
      <div className="p-6 md:p-8">
        {renderStage()}
      </div>
    </div>
  );
};

export default QuizContainer;