import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';

const ParentContact: React.FC = () => {
  const { setParentEmail, setParentPhone, nextStage, prevStage } = useQuiz();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const validateAndProceed = () => {
    if (!email || !phone) {
      setError('Please fill in both email and phone number.');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.match(/^\+?[\d\s-]{10,}$/)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setParentEmail(email);
    setParentPhone(phone);
    nextStage();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Parent Contact Information</h2>
        <p className="text-gray-600">Please provide your contact details so we can send you book recommendations.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Parent Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="parent@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Parent Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+1 (123) 456-7890"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStage}
          className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={validateAndProceed}
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ParentContact; 