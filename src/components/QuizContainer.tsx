import React from 'react';
import { useQuiz } from '../context/QuizContext';
import ProgressBar from './ProgressBar';
import StartScreen from './stages/StartScreen';
import ParentConsent from './stages/ParentConsent';
import NameInput from './stages/NameInput';
import AgeInput from './stages/AgeInput';
import ParentReading from './stages/ParentReading';
import GenreYoung from './stages/GenreYoung';
import TopThreeGenres from './stages/TopThreeGenres';
import FictionGenres from './stages/FictionGenres';
import FictionGenresAdditional from './stages/FictionGenresAdditional';
import NonFictionGenres from './stages/NonFictionGenres';
import AdditionalGenres from './stages/AdditionalGenres';
import AdditionalGenresYoung from './stages/AdditionalGenresYoung';
import FictionNonFictionRatio from './stages/FictionNonFictionRatio';
import GenreNonFiction from './stages/GenreNonFiction';
import YoungInterests from './stages/YoungInterests';
import BookSeries from './stages/BookSeries';
import ContactInfo from './stages/ContactInfo';
import Results from './stages/Results';

const QuizContainer: React.FC = () => {
  const { stage, progress, saveError, isSaving } = useQuiz();
  
  const renderStage = () => {
    switch (stage) {
      case 'start':
        return <StartScreen />;
      case 'parentConsent':
        return <ParentConsent />;
      case 'name':
        return <NameInput />;
      case 'age':
        return <AgeInput />;
      case 'parentReading':
        return <ParentReading />;
      case 'genreYoung':
        return <GenreYoung />;
      case 'fictionGenres':
        return <FictionGenres />;
      case 'fictionGenresAdditional':
        return <FictionGenresAdditional />;
      case 'nonFictionGenres':
        return <NonFictionGenres />;
      case 'additionalGenres':
        return <AdditionalGenres />;
      case 'additionalGenresYoung':
        return <AdditionalGenresYoung />;
      case 'fictionNonFictionRatio':
        return <FictionNonFictionRatio />;
      case 'genreNonFiction':
        return <GenreNonFiction />;
      case 'youngInterests':
        return <YoungInterests />;
      case 'bookSeries':
        return <BookSeries />;
      case 'contactInfo':
        return <ContactInfo />;
      case 'results':
        return <Results />;
      default:
        return <StartScreen />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ease-in-out">
      {stage !== 'start' && stage !== 'results' && (
        <div className="p-4 bg-indigo-100">
          <ProgressBar progress={progress} />
          {/* Save status indicator */}
          {isSaving && (
            <div className="mt-2 flex items-center justify-center text-sm text-indigo-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent mr-2"></div>
              Saving your progress...
            </div>
          )}
          {saveError && (
            <div className="mt-2 text-sm text-red-600 text-center bg-red-50 p-2 rounded">
              {saveError}
            </div>
          )}
        </div>
      )}
      <div className="p-6 md:p-8">
        {renderStage()}
      </div>
    </div>
  );
};

export default QuizContainer;