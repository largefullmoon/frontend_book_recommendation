import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import Button from '../common/Button';

const ParentConsent: React.FC = () => {
  const { nextStage, prevStage, setParentEmail, setParentPhone } = useQuiz();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate contact information
    if (!email && !phone) {
      setError('Please provide either an email address or phone number.');
      return;
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phone && !phone.match(/^\+?[\d\s-]{10,}$/)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setParentEmail(email);
    setParentPhone(phone);
    nextStage();
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <div className="inline-flex justify-center items-center bg-blue-100 p-3 rounded-full mb-3">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Parents' Section</h2>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          This tool helps us recommend age-appropriate books for your child based on their interests. 
          We'll ask questions about their age, reading preferences, and books they've enjoyed.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+1 (123) 456-7890"
          />
          <p className="mt-1 text-xs text-gray-500">
            We'll use these to send you their book recommendations
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="consent"
              type="checkbox"
              checked={hasConsent}
              onChange={() => setHasConsent(!hasConsent)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="consent" className="font-medium text-gray-700">
              I give permission for my child to use this tool
            </label>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStage}
          >
            Back
          </Button>
          
          <Button 
            type="submit" 
            disabled={!hasConsent}
            className={!hasConsent ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Continue to Child's Section
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ParentConsent;