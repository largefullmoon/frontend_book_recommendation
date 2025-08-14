import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../services/api';

type QuizStage = 
  | 'start' 
  | 'parentConsent'
  | 'name' 
  | 'age' 
  | 'parentReading'
  | 'genreYoung' 
  | 'genreNonFiction' 
  | 'youngInterests'
  | 'fictionGenres'
  | 'fictionGenresAdditional'
  | 'nonFictionGenres'
  | 'additionalGenres'
  | 'additionalGenresYoung'
  | 'fictionNonFictionRatio'
  | 'bookSeries'
  | 'contactInfo'
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
  fictionGenres: string[];
  setFictionGenres: (genres: string[]) => void;
  nonFictionGenres: string[];
  setNonFictionGenres: (genres: string[]) => void;
  additionalGenres: string[];
  setAdditionalGenres: (genres: string[]) => void;
  fictionNonFictionRatio: number;
  setFictionNonFictionRatio: (ratio: number) => void;
  progress: number;
  nextStage: () => void;
  prevStage: () => void;
  resetQuiz: () => void;
  userId: string | null;
  saveError: string | null;
  isSaving: boolean;
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
  const [fictionGenres, setFictionGenres] = useState<string[]>([]);
  const [nonFictionGenres, setNonFictionGenres] = useState<string[]>([]);
  const [additionalGenres, setAdditionalGenres] = useState<string[]>([]);
  const [fictionNonFictionRatio, setFictionNonFictionRatio] = useState(50);
  const [userId, setUserId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      'fictionGenres',
      'nonFictionGenres',
      'additionalGenres',
      'fictionNonFictionRatio',
      'bookSeries',
      'contactInfo',
      'results'
    ];
    
    // Skip stages based on age
    const filteredStages = stages.filter(s => {
      if (age === null) return true;
      
      if (s === 'parentReading' && age > 7) return false;
      if (s === 'genreYoung' && (age < 6 || age > 10)) return false;
      if (s === 'youngInterests' && age > 5) return false;
      if (s === 'fictionGenres' && age <= 10) return false;
      if (s === 'nonFictionGenres' && age <= 10) return false;
      if (s === 'additionalGenres' && (age <= 10 || age > 11)) return false;
      if (s === 'fictionNonFictionRatio' && age <= 10) return false;
      
      return true;
    });
    
    const currentIndex = filteredStages.indexOf(stage);
    return currentIndex === -1 ? 0 : (currentIndex / (filteredStages.length - 1)) * 100;
  };

  const progress = calculateProgress();

  // Helper function to save current state to database
  const saveCurrentState = async () => {
    if (!userId) return;
    
    // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
    if (userId.startsWith('user_')) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await api.updateUserData({
        userId,
        name: name || undefined,
        age,
        parentReading,
        selectedGenres: selectedGenres.length > 0 ? selectedGenres : undefined,
        selectedInterests: selectedInterests.length > 0 ? selectedInterests : undefined,
        nonFictionInterests: nonFictionInterests.length > 0 ? nonFictionInterests : undefined,
        topThreeGenres: topThreeGenres.length > 0 ? topThreeGenres : undefined,
        fictionGenres: fictionGenres.length > 0 ? fictionGenres : undefined,
        nonFictionGenres: nonFictionGenres.length > 0 ? nonFictionGenres : undefined,
        additionalGenres: additionalGenres.length > 0 ? additionalGenres : undefined,
        fictionNonFictionRatio,
        bookSeries: bookSeries.length > 0 ? bookSeries : undefined
      });
    } catch (error) {
      console.error('Failed to save current state:', error);
      setSaveError('Failed to save progress. Your data may not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBookSeriesResponse = async (
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

    // Save individual response to backend (skip if temporary userId)
    if (userId && !userId.startsWith('user_') && response) {
      try {
        await api.saveBookSeriesResponse(userId, seriesId, hasRead, response);
      } catch (error) {
        console.error('Failed to save book series response:', error);
        setSaveError('Failed to save book preference.');
      }
    }
  };

  const nextStage = async () => {
    const stageMap: Record<QuizStage, QuizStage> = {
      'start': 'parentConsent',
      'parentConsent': 'name',
      'name': 'age',
      'age': age && age <= 7 ? 'parentReading' : getGenreStageForAge(),
      'parentReading': getGenreStageForAge(),
      'genreYoung': 'additionalGenresYoung',
      'genreNonFiction': 'bookSeries',
      'youngInterests': 'bookSeries',
      'fictionGenres': 'fictionGenresAdditional',
      'fictionGenresAdditional': 'nonFictionGenres',
      'nonFictionGenres': 'fictionNonFictionRatio',
      'additionalGenres': 'fictionNonFictionRatio',
      'additionalGenresYoung': 'bookSeries',
      'fictionNonFictionRatio': 'bookSeries',
      'bookSeries': 'contactInfo',
      'contactInfo': 'results',
      'results': 'start'
    };

    // Save data based on current stage before moving to next
    setIsSaving(true);
    setSaveError(null);
    
    try {
      switch (stage) {
        case 'parentConsent':
          // Create a new user ID for this session
          const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setUserId(newUserId);
          break;

        case 'name':
        case 'age':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && name && age !== null) {
            await api.updateUserBasicInfo(userId, name, age);
          }
          break;

        case 'parentReading':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && parentReading) {
            await api.updateParentReading(userId, parentReading);
          }
          break;

        case 'genreYoung':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && selectedGenres.length > 0) {
            await api.updateGenrePreferences(userId, { selectedGenres });
          }
          break;

        case 'youngInterests':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && selectedInterests.length > 0) {
            await api.updateInterests(userId, selectedInterests);
          }
          break;

        case 'fictionGenres':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && fictionGenres.length > 0) {
            await api.updateGenrePreferences(userId, { fictionGenres });
          }
          break;

        case 'fictionGenresAdditional':
          // The fictionGenres are already updated in the component
          break;

        case 'nonFictionGenres':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && nonFictionGenres.length > 0) {
            await api.updateGenrePreferences(userId, { nonFictionGenres });
          }
          break;

        case 'additionalGenres':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && additionalGenres.length > 0) {
            await api.updateGenrePreferences(userId, { additionalGenres });
          }
          break;

        case 'additionalGenresYoung':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && additionalGenres.length > 0) {
            await api.updateGenrePreferences(userId, { additionalGenres });
          }
          break;

        case 'fictionNonFictionRatio':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && fictionNonFictionRatio !== 50) {
            await api.updateGenrePreferences(userId, { fictionNonFictionRatio });
          }
          break;

        case 'bookSeries':
          // Skip saving if we have a temporary userId (will be saved in contactInfo stage)
          if (userId && !userId.startsWith('user_') && bookSeries.length > 0) {
            await api.updateBookSeriesResponses(userId, bookSeries);
          }
          break;

        case 'contactInfo':
          if (userId && (parentEmail || parentPhone)) {
            try {
              // Save parent consent and get real userId from backend
              const consentResponse = await api.saveParentConsent(parentEmail, parentPhone);
              const realUserId = consentResponse.userId;
              setUserId(realUserId);
              
              // Now save all the quiz data with the real userId
              if (name && age !== null) {
                await api.updateUserBasicInfo(realUserId, name, age);
              }
              
              if (parentReading) {
                await api.updateParentReading(realUserId, parentReading);
              }
              
              // Save genre preferences based on age
              if (age && age <= 5 && selectedInterests.length > 0) {
                await api.updateInterests(realUserId, selectedInterests);
              } else if (age && age >= 6 && age <= 10 && selectedGenres.length > 0) {
                await api.updateGenrePreferences(realUserId, { selectedGenres });
              } else if (age && age >= 11) {
                if (fictionGenres.length > 0) {
                  await api.updateGenrePreferences(realUserId, { fictionGenres });
                }
                if (nonFictionGenres.length > 0) {
                  await api.updateGenrePreferences(realUserId, { nonFictionGenres });
                }
                if (additionalGenres.length > 0) {
                  await api.updateGenrePreferences(realUserId, { additionalGenres });
                }
                if (fictionNonFictionRatio !== 50) {
                  await api.updateGenrePreferences(realUserId, { fictionNonFictionRatio });
                }
              }
              
              if (additionalGenres.length > 0) {
                await api.updateGenrePreferences(realUserId, { additionalGenres });
              }
              
              if (bookSeries.length > 0) {
                await api.updateBookSeriesResponses(realUserId, bookSeries);
              }
              
            } catch (error) {
              console.error('Failed to save contact info and quiz data:', error);
              setSaveError('Failed to save your information. Please try again.');
              return; // Don't proceed to next stage if saving fails
            }
          }
          break;

        case 'results':
          // Quiz is already completed in contactInfo stage, just mark as complete
          if (userId) {
            try {
              await api.completeQuiz({
                userId,
                name,
                age,
                parentEmail,
                parentPhone,
                parentReading,
                selectedGenres: age && age >= 11 ? [...fictionGenres, ...nonFictionGenres, ...additionalGenres] : [...selectedGenres, ...additionalGenres],
                selectedInterests,
                nonFictionInterests,
                topThreeGenres,
                fictionGenres,
                nonFictionGenres,
                additionalGenres,
                fictionNonFictionRatio,
                bookSeries,
                completedAt: new Date().toISOString()
              });
            } catch (error) {
              console.error('Failed to mark quiz as complete:', error);
              // Don't show error to user since they already have their recommendations
            }
          }
          break;
      }

      // Save current state after each stage, but skip for contactInfo since we don't have a valid userId yet
      if (stage !== 'contactInfo') {
        await saveCurrentState();
      }
      
    } catch (error) {
      console.error('Failed to save stage data:', error);
      setSaveError('Failed to save your progress. Please try again.');
      // Don't prevent moving to next stage, but show error
    } finally {
      setIsSaving(false);
    }
    
    // For users aged 11+, skip additionalGenres stage after nonFictionGenres
    let nextStage = stageMap[stage];
    if (stage === 'nonFictionGenres' && age && age > 11) {
      nextStage = 'fictionNonFictionRatio';
    }
    
    setStage(nextStage);
  };

  const getGenreStageForAge = (): QuizStage => {
    if (age === null) return 'fictionGenres';
    if (age <= 5) return 'youngInterests';
    if (age >= 6 && age <= 10) return 'genreYoung';
    return 'fictionGenres';
  };

  const prevStage = () => {
    const reverseStageMap: Record<QuizStage, QuizStage> = {
      'start': 'start',
      'parentConsent': 'start',
      'name': 'parentConsent',
      'age': 'name',
      'parentReading': 'age',
      'fictionGenres': age && age <= 7 ? 'parentReading' : 'age',
      'fictionGenresAdditional': 'fictionGenres',
      'nonFictionGenres': 'fictionGenresAdditional',
      'fictionNonFictionRatio': 'nonFictionGenres',
      'additionalGenres': 'nonFictionGenres',
      'additionalGenresYoung': 'genreYoung',
      'genreNonFiction': 'fictionNonFictionRatio',
      'youngInterests': 'age',
      'genreYoung': age && age <= 7 ? 'parentReading' : 'age',
      'bookSeries': getPreviousStageForBookSeries(),
      'contactInfo': 'bookSeries',
      'results': 'contactInfo'
    };
    
    // For users aged 11+, handle reverse navigation from fictionNonFictionRatio
    let previousStage = reverseStageMap[stage];
    if (stage === 'fictionNonFictionRatio' && age && age > 11) {
      previousStage = 'nonFictionGenres';
    }
    
    setStage(previousStage);
  };

  const getPreviousStageForBookSeries = (): QuizStage => {
    if (age === null) return 'genreNonFiction';
    if (age <= 5) return 'youngInterests';
    if (age >= 6 && age <= 10) return 'additionalGenresYoung';
    return 'fictionNonFictionRatio';
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
    setFictionGenres([]);
    setNonFictionGenres([]);
    setAdditionalGenres([]);
    setFictionNonFictionRatio(50);
    setUserId(null);
    setSaveError(null);
    setIsSaving(false);
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
        fictionGenres,
        setFictionGenres,
        nonFictionGenres,
        setNonFictionGenres,
        additionalGenres,
        setAdditionalGenres,
        fictionNonFictionRatio,
        setFictionNonFictionRatio,
        progress,
        nextStage,
        prevStage,
        resetQuiz,
        userId,
        saveError,
        isSaving
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};