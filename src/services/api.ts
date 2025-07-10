import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface BookSeriesResponse {
  seriesId: string;
  response: 'love' | 'like' | 'dontReadAnymore' | 'didNotEnjoy' | null;
  hasRead: boolean;
}

interface CompleteQuizData {
  userId: string;
  name: string;
  age: number | null;
  parentEmail: string;
  parentPhone: string;
  parentReading: string | null;
  selectedGenres: string[];
  selectedInterests: string[];
  nonFictionInterests: string[];
  topThreeGenres: string[];
  fictionGenres: string[];
  nonFictionGenres: string[];
  additionalGenres: string[];
  fictionNonFictionRatio: number;
  bookSeries: BookSeriesResponse[];
  completedAt: string;
}

interface UserUpdateData {
  userId: string;
  name?: string;
  age?: number | null;
  parentReading?: string | null;
  selectedGenres?: string[];
  selectedInterests?: string[];
  nonFictionInterests?: string[];
  topThreeGenres?: string[];
  fictionGenres?: string[];
  nonFictionGenres?: string[];
  additionalGenres?: string[];
  fictionNonFictionRatio?: number;
  bookSeries?: BookSeriesResponse[];
}

export const api = {
  // Save parent consent and create user
  saveParentConsent: async (email: string, phone: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/quiz/parent-consent`, {
        email,
        phone,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error saving parent consent:', error);
      throw error;
    }
  },

  // Update user with basic info
  updateUserBasicInfo: async (userId: string, name: string, age: number) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/quiz/users/${userId}/basic-info`, {
        name,
        age,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating basic info:', error);
      throw error;
    }
  },

  // Update user with parent reading info
  updateParentReading: async (userId: string, readingHabits: string) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/quiz/users/${userId}/parent-reading`, {
        parentReading: readingHabits,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating parent reading info:', error);
      throw error;
    }
  },

  // Update user with genre preferences (all genre-related data)
  updateGenrePreferences: async (userId: string, data: {
    selectedGenres?: string[],
    topThreeGenres?: string[],
    fictionGenres?: string[],
    nonFictionGenres?: string[],
    additionalGenres?: string[],
    fictionNonFictionRatio?: number
  }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/quiz/users/${userId}/genres`, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating genre preferences:', error);
      throw error;
    }
  },

  // Update user with interests
  updateInterests: async (userId: string, interests: string[], nonFictionInterests?: string[]) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/quiz/users/${userId}/interests`, {
        selectedInterests: interests,
        nonFictionInterests: nonFictionInterests || [],
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating interests:', error);
      throw error;
    }
  },

  // Update user with book series responses
  updateBookSeriesResponses: async (userId: string, bookResponses: BookSeriesResponse[]) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/quiz/users/${userId}/book-series`, {
        bookSeries: bookResponses,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating book series responses:', error);
      throw error;
    }
  },

  // Save individual book series response
  saveBookSeriesResponse: async (userId: string, seriesId: string, hasRead: boolean, response?: string) => {
    try {
      const apiResponse = await axios.post(`${API_BASE_URL}/quiz/users/${userId}/book-series/response`, {
        seriesId,
        hasRead,
        response: response || null,
        timestamp: new Date().toISOString()
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Error saving book series response:', error);
      throw error;
    }
  },

  // Complete quiz and save all final data
  completeQuiz: async (quizData: CompleteQuizData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/quiz/complete`, {
        ...quizData,
        completedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  },

  // Update user data incrementally
  updateUserData: async (updateData: UserUpdateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/quiz/users/${updateData.userId}`, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },

  // Get user data for recommendations
  getUserData: async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quiz/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  // Save recommendations for user
  saveRecommendations: async (userId: string, recommendations: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/quiz/users/${userId}/recommendations`, {
        recommendations,
        generatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  saveBasicInfo: async (name: string, age: number) => {
    console.warn('saveBasicInfo is deprecated. Use updateUserBasicInfo instead.');
    return { success: true };
  },

  saveParentReading: async (userId: string, readingHabits: string) => {
    return api.updateParentReading(userId, readingHabits);
  },

  saveGenrePreferences: async (userId: string, data: any) => {
    return api.updateGenrePreferences(userId, data);
  },

  saveInterests: async (userId: string, interests: string[]) => {
    return api.updateInterests(userId, interests);
  },

  saveBookSeriesResponses: async (userId: string, bookResponses: any[]) => {
    return api.updateBookSeriesResponses(userId, bookResponses);
  },

  saveQuizData: async (quizData: any) => {
    console.warn('saveQuizData is deprecated. Use completeQuiz instead.');
    return { success: true };
  }
}; 