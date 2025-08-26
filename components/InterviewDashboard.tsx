'use client';

import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Award,
  Star,
  BookOpen
} from 'lucide-react';
import StatCard from './dashboard/statcard';
import AchievementBadge from './dashboard/achivementbadge';
import QuickActions from './dashboard/quickactions';

interface InterviewDashboardProps {
  userId: string;
  userInterviews: any[];
  recentFeedback?: any[];
}

export const InterviewDashboard = ({ 
  userId, 
  userInterviews, 
  recentFeedback = [] 
}: InterviewDashboardProps) => {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    improvementRate: 0,
    completionRate: 0
  });

  const [achievements, setAchievements] = useState([
    {
      id: '1',
      title: 'First Interview',
      description: 'Completed your first practice interview',
      type: 'bronze' as const,
      isNew: false
    },
    {
      id: '2',
      title: 'Quick Learner',
      description: 'Improved score by 20+ points',
      type: 'silver' as const,
      isNew: true
    }
  ]);

  useEffect(() => {
    // Calculate stats based on user interviews and feedback
    const totalInterviews = userInterviews.length;
    const completedInterviews = recentFeedback.length;
    const avgScore = recentFeedback.length > 0 
      ? recentFeedback.reduce((sum, f) => sum + (f.totalScore || 0), 0) / recentFeedback.length
      : 0;

    setStats({
      totalInterviews,
      averageScore: Math.round(avgScore),
      improvementRate: Math.floor(Math.random() * 25) + 5, // Simulated
      completionRate: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0
    });
  }, [userInterviews, recentFeedback]);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          title="Total Interviews"
          value={stats.totalInterviews}
          change="+2 this week"
          trend="up"
        />
        <StatCard
          icon={Star}
          title="Average Score"
          value={`${stats.averageScore}%`}
          change="+5% improvement"
          trend="up"
        />
        <StatCard
          icon={TrendingUp}
          title="Improvement Rate"
          value={`+${stats.improvementRate}%`}
          change="vs last month"
          trend="up"
        />
        <StatCard
          icon={Award}
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          change="of started interviews"
          trend="neutral"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions userId={userId} />

      {/* Recent Achievements */}
      <div className="bg-dark-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-400" />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <AchievementBadge key={achievement.id} {...achievement} />
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-dark-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-200" />
          Performance Insights
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-dark-300/50 rounded-lg">
            <div>
              <h4 className="font-medium">Communication Skills</h4>
              <p className="text-sm text-gray-400">Your strongest area</p>
            </div>
            <div className="text-green-400 font-semibold">85%</div>
          </div>
          <div className="flex justify-between items-center p-4 bg-dark-300/50 rounded-lg">
            <div>
              <h4 className="font-medium">Technical Knowledge</h4>
              <p className="text-sm text-gray-400">Room for improvement</p>
            </div>
            <div className="text-yellow-400 font-semibold">72%</div>
          </div>
        </div>
      </div>
    </div>
  );
};