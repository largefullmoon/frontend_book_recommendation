import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

const ContactInfo: React.FC = () => {
  const { nextStage, prevStage, setParentEmail, setParentPhone } = useQuiz();
  const { showError } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate contact information
    if (!email && !phone) {
      showError('Please provide either an email address or phone number.');
      return;
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showError('Please enter a valid email address.');
      return;
    }

    if (phone && !phone.match(/^\+?[\d\s-]{10,}$/)) {
      showError('Please enter a valid phone number.');
      return;
    }

    setParentEmail(email);
    setParentPhone(phone);
    nextStage();
  };
  
  return (
    <div className="px-4 animate-fadeIn sm:px-0">
      <div className="mb-4 text-center sm:mb-6">
        <div className="inline-flex justify-center items-center bg-green-100 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3">
          <Mail className="text-green-600 w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Get Your Recommendations</h2>
      </div>
      
      <div className="p-3 mb-4 rounded-lg bg-green-50 sm:p-4 sm:mb-6">
        <p className="text-xs text-green-800 sm:text-sm">
          Just 1 last step, book explorer! Before Bookie goes on the big book hunt 📚✨
          Please hand this device to your parents so they can add their contact information below. That way, you'll get your special recommendations — and keep them forever! Once they do, your magical reading list will be on its way! 🚀📖
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="email" className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md sm:px-4 sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md sm:px-4 sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+1 (123) 456-7890"
          />
          <p className="mt-1 text-xs text-gray-500">
            We'll use these to send you their book recommendations
          </p>
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
            className="text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto"
          >
            Get My Recommendations
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactInfo; 