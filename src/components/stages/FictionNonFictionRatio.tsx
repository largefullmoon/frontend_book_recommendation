import React from 'react';
import { useQuiz } from '../../context/QuizContext';

const RATIOS = [
  { fiction: 70, nonfiction: 30 },
  { fiction: 60, nonfiction: 40 },
  { fiction: 50, nonfiction: 50 },
  { fiction: 40, nonfiction: 60 },
  { fiction: 30, nonfiction: 70 },
];

const FictionNonFictionRatio: React.FC = () => {
  const { setFictionNonFictionRatio, nextStage, prevStage } = useQuiz();
  const [selectedRatio, setSelectedRatio] = React.useState<number | null>(null);

  const handleContinue = () => {
    if (selectedRatio !== null) {
      setFictionNonFictionRatio(selectedRatio);
      nextStage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Fiction vs Non-Fiction</h2>
        <p className="text-gray-600">
          Choose your preferred balance between fiction and non-fiction books.
        </p>
      </div>

      <div className="space-y-4">
        {RATIOS.map((ratio, index) => (
          <button
            key={index}
            onClick={() => setSelectedRatio(ratio.fiction)}
            className={`w-full p-6 rounded-lg text-left transition-all ${
              selectedRatio === ratio.fiction
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedRatio === ratio.fiction 
                    ? 'border-white bg-indigo-600' 
                    : 'border-gray-400 bg-white'
                  }`}
                >
                  {selectedRatio === ratio.fiction && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="font-medium">
                  {ratio.fiction}% Fiction / {ratio.nonfiction}% Non-Fiction
                </span>
              </div>
            </div>
            <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${
                  selectedRatio === ratio.fiction
                    ? 'bg-indigo-400'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${ratio.fiction}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStage}
          className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedRatio === null}
          className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
            selectedRatio === null
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default FictionNonFictionRatio; 