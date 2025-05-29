import React, { useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';
import Card from '../common/Card';

const BookSeries: React.FC = () => {
  const { nextStage, prevStage, name, age, bookSeries, updateBookSeriesResponse } = useQuiz();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  
  // Mock book series data - this would come from an API or external source
  const getBookSeriesByAge = () => {
    // Age-appropriate book series (simplified for the example)
    if (age && age <= 7) {
      return [
        { id: 'peppa', title: 'Peppa Pig' },
        { id: 'hungry-caterpillar', title: 'The Very Hungry Caterpillar' },
        { id: 'gruffalo', title: 'The Gruffalo' },
        { id: 'spot', title: 'Spot the Dog' },
        { id: 'thomas', title: 'Thomas the Tank Engine' },
        { id: 'paddington', title: 'Paddington Bear' },
        { id: 'peter-rabbit', title: 'Peter Rabbit' },
        { id: 'mog', title: 'Mog the Cat' },
      ];
    } else if (age && age <= 10) {
      return [
        { id: 'harry-potter', title: 'Harry Potter' },
        { id: 'diary-wimpy-kid', title: 'Diary of a Wimpy Kid' },
        { id: 'captain-underpants', title: 'Captain Underpants' },
        { id: 'dog-man', title: 'Dog Man' },
        { id: 'beast-quest', title: 'Beast Quest' },
        { id: 'roald-dahl', title: 'Roald Dahl books' },
        { id: 'rainbow-magic', title: 'Rainbow Magic' },
        { id: 'horrid-henry', title: 'Horrid Henry' },
      ];
    } else {
      return [
        { id: 'harry-potter', title: 'Harry Potter' },
        { id: 'percy-jackson', title: 'Percy Jackson' },
        { id: 'hunger-games', title: 'The Hunger Games' },
        { id: 'maze-runner', title: 'The Maze Runner' },
        { id: 'divergent', title: 'Divergent' },
        { id: 'shadowhunters', title: 'Shadowhunters' },
        { id: 'wings-of-fire', title: 'Wings of Fire' },
        { id: 'lord-of-rings', title: 'The Lord of the Rings' },
      ];
    }
  };
  
  const allSeries = getBookSeriesByAge();
  const seriesPerPage = 4;
  const totalPages = Math.ceil(allSeries.length / seriesPerPage);
  
  const currentSeries = allSeries.slice(
    currentPage * seriesPerPage, 
    (currentPage + 1) * seriesPerPage
  );
  
  const hasReadSeries = (seriesId: string): boolean => {
    const found = bookSeries.find(item => item.seriesId === seriesId);
    return found ? found.hasRead : false;
  };
  
  const getSeriesResponse = (seriesId: string): string | null => {
    const found = bookSeries.find(item => item.seriesId === seriesId);
    return found?.response || null;
  };
  
  const handleSeriesClick = (seriesId: string) => {
    const hasRead = !hasReadSeries(seriesId);
    updateBookSeriesResponse(seriesId, hasRead);
    
    if (hasRead) {
      setActiveSeries(seriesId);
    } else {
      setActiveSeries(null);
    }
  };
  
  const handleResponse = (seriesId: string, response: 'love' | 'like' | 'dontReadAnymore' | 'didNotEnjoy') => {
    updateBookSeriesResponse(seriesId, true, response);
    setActiveSeries(null);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setActiveSeries(null);
    } else {
      nextStage();
    }
  };
  
  const ResponseOptions = ({ seriesId }: { seriesId: string }) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fadeIn">
      <p className="text-sm font-medium text-gray-800 mb-3">How did you like it?</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleResponse(seriesId, 'love')}
          className="bg-pink-100 hover:bg-pink-200 text-pink-800 py-2 rounded-lg text-sm"
        >
          I love it! 😍
        </button>
        <button
          onClick={() => handleResponse(seriesId, 'like')}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-lg text-sm"
        >
          I like it 🙂
        </button>
        <button
          onClick={() => handleResponse(seriesId, 'dontReadAnymore')}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 rounded-lg text-sm"
        >
          Don't read anymore ⏱️
        </button>
        <button
          onClick={() => handleResponse(seriesId, 'didNotEnjoy')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm"
        >
          Didn't enjoy it 👎
        </button>
      </div>
    </div>
  );
  
  const getResponseEmoji = (response: string | null) => {
    switch (response) {
      case 'love': return '😍';
      case 'like': return '🙂';
      case 'dontReadAnymore': return '⏱️';
      case 'didNotEnjoy': return '👎';
      default: return '';
    }
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <BookOpenCheck className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Have you read these books?
        </h2>
        <p className="text-gray-600">
          Tap on any book series you've read, {name}!
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Page {currentPage + 1} of {totalPages}
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        {currentSeries.map((series) => (
          <div key={series.id}>
            <Card
              selected={hasReadSeries(series.id)}
              selectable
              onClick={() => handleSeriesClick(series.id)}
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{series.title}</h3>
                  {hasReadSeries(series.id) && getSeriesResponse(series.id) && (
                    <p className="text-sm text-gray-600 mt-1">
                      Your opinion: {getResponseEmoji(getSeriesResponse(series.id))}
                    </p>
                  )}
                </div>
                
                {hasReadSeries(series.id) ? (
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-indigo-600"></div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not read</span>
                )}
              </div>
            </Card>
            
            {activeSeries === series.id && <ResponseOptions seriesId={series.id} />}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentPage > 0 ? () => setCurrentPage(prev => prev - 1) : prevStage}
        >
          {currentPage > 0 ? 'Previous Page' : 'Back'}
        </Button>
        
        <Button 
          onClick={handleNextPage}
        >
          {currentPage < totalPages - 1 ? 'Next Page' : 'Finish'}
        </Button>
      </div>
    </div>
  );
};

export default BookSeries;