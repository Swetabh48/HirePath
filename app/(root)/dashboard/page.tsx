'use client';

import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NutritionSummary from '@/components/dashboard/NutritionSummary';
import RecommendationsCard from '@/components/dashboard/RecommendationsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Utensils, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Calculate BMI
  const heightInM = user.profile.height / 100;
  const bmi = user.profile.weight / (heightInM * heightInM);
  const bmiCategory = 
    bmi < 18.5 ? 'Underweight' :
    bmi < 25 ? 'Normal' :
    bmi < 30 ? 'Overweight' : 'Obese';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user.profile.firstName}!
          </h1>
          <p className="text-green-100">
            Track your nutrition and reach your {user.profile.fitnessGoal.replace('_', ' ')} goals
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Goal</p>
                  <p className="text-xl font-bold">{user.profile.dailyCalorieGoal} cal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Weight</p>
                  <p className="text-xl font-bold">{user.profile.weight} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">BMI</p>
                  <p className="text-xl font-bold">{bmi.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{bmiCategory}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Goal</p>
                  <p className="text-sm font-medium capitalize">
                    {user.profile.fitnessGoal.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NutritionSummary />
          </div>
          <div>
            <RecommendationsCard />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="mr-2 h-5 w-5" />
                Log a Meal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Quickly log your meals with our AI-powered food recognition
              </p>
              <Link href="/dashboard/meals">
                <Button className="w-full">Log Meal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Meal Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get personalized meal plans based on your goals
              </p>
              <Link href="/dashboard/meal-plans">
                <Button variant="outline" className="w-full">View Plans</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Track Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Monitor your weight and body measurements over time
              </p>
              <Link href="/dashboard/progress">
                <Button variant="outline" className="w-full">View Progress</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meals logged today</h3>
              <p className="text-gray-500 mb-4">Start tracking your nutrition by logging your first meal</p>
              <Link href="/dashboard/meals">
                <Button>Log Your First Meal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}