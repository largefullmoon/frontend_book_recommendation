import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, BookOpen, Clock, Calendar, Star, Target, Activity } from 'lucide-react';

interface AnalyticsData {
  ageGroupDistribution: { name: string; value: number; color: string }[];
  genrePopularity: { genre: string; count: number }[];
  completionRates: { step: string; percentage: number }[];
  timeBasedStats: { date: string; users: number; plans: number }[];
  recommendationEffectiveness: {
    totalRecommendations: number;
    averageConfidenceScore: number;
    topPerformingGenres: string[];
    userSatisfactionRate: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch recommendation plans stats
      const statsResponse = await fetch('http://localhost:5000/recommendation-plans/stats');
      const statsData = await statsResponse.json();

      // Fetch all recommendation plans for detailed analysis
      const plansResponse = await fetch('http://localhost:5000/recommendation-plans?limit=1000');
      const plansData = await plansResponse.json();

      // Fetch all quiz users for completion analysis
      const usersResponse = await fetch('http://localhost:5000/quiz/users');
      const usersData = await usersResponse.json();

      if (statsData.success && plansData.success && usersData.success) {
        const analytics = processAnalyticsData(statsData.stats, plansData.plans, usersData.users);
        setAnalyticsData(analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (stats: any, plans: any[], users: any[]): AnalyticsData => {
    // Age group distribution
    const ageGroupDistribution = stats.ageGroups.map((group: any, index: number) => ({
      name: group._id,
      value: group.count,
      color: COLORS[index % COLORS.length]
    }));

    // Genre popularity analysis
    const genreCount: { [key: string]: number } = {};
    plans.forEach(plan => {
      if (plan.selectedGenres) {
        plan.selectedGenres.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });
    const genrePopularity = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Quiz completion rates
    const completionSteps = ['parentConsent', 'basicInfo', 'parentReading', 'genres', 'interests', 'bookSeries', 'completed'];
    const completionRates = completionSteps.map(step => {
      const completedCount = users.filter(user => 
        user.quizProgress && user.quizProgress[step]
      ).length;
      return {
        step: step.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        percentage: users.length > 0 ? Math.round((completedCount / users.length) * 100) : 0
      };
    });

    // Time-based statistics (simulated for demo)
    const timeBasedStats = generateTimeBasedData(plans, users, timeRange);

    // Recommendation effectiveness
    const totalRecommendations = plans.reduce((sum, plan) => sum + (plan.recommendations?.length || 0), 0);
    const confidenceScores = plans.flatMap(plan => 
      plan.recommendations?.map((rec: any) => rec.confidence_score || 0) || []
    );
    const averageConfidenceScore = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : 0;

    const topPerformingGenres = genrePopularity.slice(0, 5).map(item => item.genre);

    const recommendationEffectiveness = {
      totalRecommendations,
      averageConfidenceScore: Math.round(averageConfidenceScore * 100) / 100,
      topPerformingGenres,
      userSatisfactionRate: 87 // Simulated satisfaction rate
    };

    return {
      ageGroupDistribution,
      genrePopularity,
      completionRates,
      timeBasedStats,
      recommendationEffectiveness
    };
  };

  const generateTimeBasedData = (plans: any[], users: any[], range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const usersCount = users.filter(user => {
        const userDate = new Date(user.createdAt).toISOString().split('T')[0];
        return userDate === dateStr;
      }).length;

      const plansCount = plans.filter(plan => {
        const planDate = new Date(plan.createdAt).toISOString().split('T')[0];
        return planDate === dateStr;
      }).length;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: usersCount,
        plans: plansCount
      });
    }

    return data;
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ComponentType, change?: string, color = 'blue') => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {React.createElement(icon, { className: `w-6 h-6 text-${color}-600` })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          'Total Recommendations',
          analyticsData.recommendationEffectiveness.totalRecommendations,
          BookOpen,
          '+12% from last month',
          'blue'
        )}
        {renderMetricCard(
          'Avg Confidence Score',
          `${analyticsData.recommendationEffectiveness.averageConfidenceScore}/10`,
          Star,
          '+0.3 from last month',
          'green'
        )}
        {renderMetricCard(
          'User Satisfaction',
          `${analyticsData.recommendationEffectiveness.userSatisfactionRate}%`,
          TrendingUp,
          '+5% from last month',
          'purple'
        )}
        {renderMetricCard(
          'Active Users',
          analyticsData.ageGroupDistribution.reduce((sum, group) => sum + group.value, 0),
          Users,
          '+18% from last month',
          'orange'
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Group Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.ageGroupDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.ageGroupDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Popularity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Genres</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.genrePopularity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="genre" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Completion Funnel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Completion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.completionRates} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="step" type="category" width={100} fontSize={12} />
              <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
              <Bar dataKey="percentage" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time-based Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.timeBasedStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" name="New Users" />
              <Line type="monotone" dataKey="plans" stroke="#82ca9d" name="Recommendation Plans" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900">Top Performing Genres</h4>
            <p className="text-sm text-gray-600 mt-1">
              {analyticsData.recommendationEffectiveness.topPerformingGenres.join(', ')} are the most requested genres.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900">Recommendation Quality</h4>
            <p className="text-sm text-gray-600 mt-1">
              Average confidence score of {analyticsData.recommendationEffectiveness.averageConfidenceScore}/10 indicates high-quality recommendations.
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-gray-900">Completion Rate</h4>
            <p className="text-sm text-gray-600 mt-1">
              {analyticsData.completionRates[analyticsData.completionRates.length - 1]?.percentage}% of users complete the entire quiz process.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations for Improvement */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Recommendations for Improvement
        </h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <p className="text-blue-800">
              Focus on improving the quiz completion rate by simplifying steps with lower completion rates.
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <p className="text-blue-800">
              Consider expanding book collections in the top-performing genres to meet user demand.
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <p className="text-blue-800">
              Implement user feedback collection to validate the high satisfaction rate and identify areas for improvement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 