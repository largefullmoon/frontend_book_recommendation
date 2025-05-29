import React, { createContext, useContext, useState, ReactNode } from 'react';

type QuizStage = 
  | 'start' 
  | 'parentConsent'
  | 'name' 
  | 'age' 
  | 'parentContact'
  | 'parentReading'
  | 'genreYoung' 
  | 'genreNonFiction' 
  | 'youngInterests'
  | 'topThreeGenres'
  | 'additionalGenres'
  | 'fictionNonFictionRatio'
  | 'bookSeries'
  | 'results';

interface BookSeriesResponse {
  seriesId: string;
  response: 'love' | 'like' | 'dontReadAnymore' | 'didNotEnjoy' | null;
  hasRead: boolean;
}

interface QuizContextType {
  stage: QuizStage;
  setStage: (stage: QuizStage) => void;
  name: string;
  setName: (name: string) => void;
  age: number | null;
  setAge: (age: number | null) => void;
  parentReading: string | null;
  setParentReading: (reading: string | null) => void;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  selectedInterests: string[];
  setSelectedInterests: (interests: string[]) => void;
  nonFictionInterests: string[];
  setNonFictionInterests: (interests: string[]) => void;
  bookSeries: BookSeriesResponse[];
  setBookSeries: (series: BookSeriesResponse[]) => void;
  updateBookSeriesResponse: (
    seriesId: string, 
    hasRead: boolean, 
    response?: 'love' | 'like' | 'dontReadAnymore' | 'didNotEnjoy'
  ) => void;
  contactInfo: string;
  setContactInfo: (info: string) => void;
  parentEmail: string;
  setParentEmail: (email: string) => void;
  parentPhone: string;
  setParentPhone: (phone: string) => void;
  topThreeGenres: string[];
  setTopThreeGenres: (genres: string[]) => void;
  additionalGenres: string[];
  setAdditionalGenres: (genres: string[]) => void;
  fictionNonFictionRatio: number;
  setFictionNonFictionRatio: (ratio: number) => void;
  progress: number;
  nextStage: () => void;
  prevStage: () => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<QuizStage>('start');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [parentReading, setParentReading] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [nonFictionInterests, setNonFictionInterests] = useState<string[]>([]);
  const [bookSeries, setBookSeries] = useState<BookSeriesResponse[]>([]);
  const [contactInfo, setContactInfo] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [topThreeGenres, setTopThreeGenres] = useState<string[]>([]);
  const [additionalGenres, setAdditionalGenres] = useState<string[]>([]);
  const [fictionNonFictionRatio, setFictionNonFictionRatio] = useState(50);

  // Calculate progress based on current stage and total stages
  const calculateProgress = (): number => {
    const stages: QuizStage[] = [
      'start',
      'parentConsent',
      'name',
      'age',
      'parentReading',
      'genreYoung',
      'genreNonFiction',
      'youngInterests',
      'bookSeries',
      'results'
    ];
    
    // Skip stages based on age
    const filteredStages = stages.filter(s => {
      if (age === null) return true;
      
      if (s === 'parentReading' && age > 7) return false;
      if (s === 'genreYoung' && (age < 6 || age > 10)) return false;
      if (s === 'youngInterests' && age > 5) return false;
      
      return true;
    });
    
    const currentIndex = filteredStages.indexOf(stage);
    return currentIndex === -1 ? 0 : (currentIndex / (filteredStages.length - 1)) * 100;
  };

  const progress = calculateProgress();

  const updateBookSeriesResponse = (
    seriesId: string, 
    hasRead: boolean,
    response?: 'love' | 'like' | 'dontReadAnymore' | 'didNotEnjoy'
  ) => {
    setBookSeries(prev => {
      const existing = prev.find(item => item.seriesId === seriesId);
      
      if (existing) {
        return prev.map(item => 
          item.seriesId === seriesId 
            ? { ...item, hasRead, response: response || item.response } 
            : item
        );
      } else {
        return [...prev, { seriesId, hasRead, response: response || null }];
      }
    });
  };

  const nextStage = () => {
    const stageMap: Record<QuizStage, QuizStage> = {
      'start': 'parentConsent',
      'parentConsent': 'parentContact',
      'parentContact': 'name',
      'name': 'age',
      'age': age && age <= 7 ? 'parentReading' : getGenreStageForAge(),
      'parentReading': getGenreStageForAge(),
      'genreYoung': 'bookSeries',
      'topThreeGenres': age && age >= 11 ? 'fictionNonFictionRatio' : 'additionalGenres',
      'additionalGenres': 'bookSeries',
      'fictionNonFictionRatio': 'bookSeries',
      'genreNonFiction': 'bookSeries',
      'youngInterests': 'bookSeries',
      'bookSeries': 'results',
      'results': 'start'
    };
    
    setStage(stageMap[stage]);
  };

  const getGenreStageForAge = (): QuizStage => {
    if (age === null) return 'topThreeGenres';
    if (age <= 5) return 'youngInterests';
    if (age >= 6 && age <= 10) return 'genreYoung';
    return 'topThreeGenres';
  };

  const prevStage = () => {
    const reverseStageMap: Record<QuizStage, QuizStage> = {
      'start': 'start',
      'parentConsent': 'start',
      'parentContact': 'parentConsent',
      'name': 'parentContact',
      'age': 'name',
      'parentReading': 'age',
      'topThreeGenres': age && age <= 7 ? 'parentReading' : 'age',
      'fictionNonFictionRatio': 'topThreeGenres',
      'additionalGenres': 'topThreeGenres',
      'genreNonFiction': 'fictionNonFictionRatio',
      'youngInterests': 'age',
      'genreYoung': age && age <= 7 ? 'parentReading' : 'age',
      'bookSeries': getPreviousStageForBookSeries(),
      'results': 'bookSeries'
    };
    
    setStage(reverseStageMap[stage]);
  };

  const getPreviousStageForBookSeries = (): QuizStage => {
    if (age === null) return 'genreNonFiction';
    if (age <= 5) return 'youngInterests';
    if (age >= 6 && age <= 10) return 'genreYoung';
    return 'genreNonFiction';
  };

  const resetQuiz = () => {
    setStage('start');
    setName('');
    setAge(null);
    setParentReading(null);
    setSelectedGenres([]);
    setSelectedInterests([]);
    setNonFictionInterests([]);
    setBookSeries([]);
    setContactInfo('');
    setParentEmail('');
    setParentPhone('');
    setTopThreeGenres([]);
    setAdditionalGenres([]);
    setFictionNonFictionRatio(50);
  };

  return (
    <QuizContext.Provider
      value={{
        stage,
        setStage,
        name,
        setName,
        age,
        setAge,
        parentReading,
        setParentReading,
        selectedGenres,
        setSelectedGenres,
        selectedInterests,
        setSelectedInterests,
        nonFictionInterests,
        setNonFictionInterests,
        bookSeries,
        setBookSeries,
        updateBookSeriesResponse,
        contactInfo,
        setContactInfo,
        parentEmail,
        setParentEmail,
        parentPhone,
        setParentPhone,
        topThreeGenres,
        setTopThreeGenres,
        additionalGenres,
        setAdditionalGenres,
        fictionNonFictionRatio,
        setFictionNonFictionRatio,
        progress,
        nextStage,
        prevStage,
        resetQuiz
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};