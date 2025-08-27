'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mealsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Utensils, Zap, Beef, Wheat, Droplet } from 'lucide-react';

interface NutritionData {
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  percentages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
}

function CircularProgress({ percentage, color, size = 80 }: CircularProgressProps) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default function NutritionSummary({ date }: { date?: string }) {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNutritionSummary();
  }, [date]);

  const fetchNutritionSummary = async () => {
    try {
      setLoading(true);
      const params = date ? { date } : {};
      const response = await mealsAPI.getSummary(params);
      setNutritionData(response.data);
    } catch (error: any) {
      toast.error('Failed to load nutrition summary');
      console.error('Error fetching nutrition summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5" />
            Today's Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nutritionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5" />
            Today's Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No nutrition data available</p>
        </CardContent>
      </Card>
    );
  }

  const macroCards = [
    {
      name: 'Calories',
      icon: Zap,
      current: nutritionData.totalNutrition.calories,
      goal: nutritionData.goals.calories,
      remaining: nutritionData.remaining.calories,
      percentage: nutritionData.percentages.calories,
      color: '#059669',
      unit: 'cal'
    },
    {
      name: 'Protein',
      icon: Beef,
      current: nutritionData.totalNutrition.protein,
      goal: nutritionData.goals.protein,
      remaining: nutritionData.remaining.protein,
      percentage: nutritionData.percentages.protein,
      color: '#dc2626',
      unit: 'g'
    },
    {
      name: 'Carbs',
      icon: Wheat,
      current: nutritionData.totalNutrition.carbs,
      goal: nutritionData.goals.carbs,
      remaining: nutritionData.remaining.carbs,
      percentage: nutritionData.percentages.carbs,
      color: '#2563eb',
      unit: 'g'
    },
    {
      name: 'Fat',
      icon: Droplet,
      current: nutritionData.totalNutrition.fat,
      goal: nutritionData.goals.fat,
      remaining: nutritionData.remaining.fat,
      percentage: nutritionData.percentages.fat,
      color: '#7c3aed',
      unit: 'g'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Utensils className="mr-2 h-5 w-5" />
          Today's Nutrition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {macroCards.map((macro) => (
            <div key={macro.name} className="text-center">
              <div className="flex flex-col items-center space-y-2">
                <CircularProgress 
                  percentage={Math.min(macro.percentage, 100)} 
                  color={macro.color}
                />
                <div>
                  <div className="flex items-center justify-center text-sm text-gray-600 mb-1">
                    <macro.icon className="h-4 w-4 mr-1" />
                    {macro.name}
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round(macro.current)}/{macro.goal} {macro.unit}
                  </div>
                  <div className="text-xs text-gray-500">
                    {macro.remaining > 0 ? `${Math.round(macro.remaining)} left` : 'Goal reached!'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional nutrients */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Nutrients</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{Math.round(nutritionData.totalNutrition.fiber)}g</div>
              <div className="text-gray-500">Fiber</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{Math.round(nutritionData.totalNutrition.sugar)}g</div>
              <div className="text-gray-500">Sugar</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{Math.round(nutritionData.totalNutrition.sodium)}mg</div>
              <div className="text-gray-500">Sodium</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}