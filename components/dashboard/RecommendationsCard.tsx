'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Recommendations {
  aiTips: string[];
  personalizedTips: string[];
  foodSuggestions: string[];
  goalProgress: {
    onTrack: boolean;
    areas: string[];
  };
}

interface NutritionalAnalysis {
  weeklyAverage: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  adherenceRate: number;
}

export default function RecommendationsCard() {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [analysis, setAnalysis] = useState<NutritionalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/recommendations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      setRecommendations(response.data.recommendations);
      setAnalysis(response.data.nutritionalAnalysis);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Don't show error toast on component mount
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchRecommendations();
    toast.success('Recommendations updated!');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || !analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Log some meals to get personalized recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Goal Progress
            </h4>
            <Badge variant={recommendations.goalProgress.onTrack ? 'default' : 'secondary'}>
              {analysis.adherenceRate}% adherence
            </Badge>
          </div>
          
          {recommendations.goalProgress.onTrack ? (
            <p className="text-green-600 text-sm">✓ You're on track with your nutrition goals!</p>
          ) : (
            <div className="space-y-1">
              <p className="text-orange-600 text-sm">Areas needing attention:</p>
              <div className="flex flex-wrap gap-1">
                {recommendations.goalProgress.areas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Tips */}
        {recommendations.aiTips.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              AI Insights
            </h4>
            <ul className="space-y-2">
              {recommendations.aiTips.slice(0, 3).map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Personalized Tips */}
        {recommendations.personalizedTips.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Personalized Tips</h4>
            <ul className="space-y-2">
              {recommendations.personalizedTips.slice(0, 3).map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Food Suggestions */}
        {recommendations.foodSuggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recommended Foods</h4>
            <div className="flex flex-wrap gap-2">
              {recommendations.foodSuggestions.map((food) => (
                <Badge key={food} variant="outline" className="text-xs capitalize">
                  {food.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Average Summary */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Weekly Average vs Goals</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Calories</div>
              <div className="font-medium">
                {Math.round(analysis.weeklyAverage.calories)} / {analysis.dailyGoals.calories}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Protein</div>
              <div className="font-medium">
                {Math.round(analysis.weeklyAverage.protein)}g / {analysis.dailyGoals.protein}g
              </div>
            </div>
            <div>
              <div className="text-gray-500">Carbs</div>
              <div className="font-medium">
                {Math.round(analysis.weeklyAverage.carbs)}g / {analysis.dailyGoals.carbs}g
              </div>
            </div>
            <div>
              <div className="text-gray-500">Fat</div>
              <div className="font-medium">
                {Math.round(analysis.weeklyAverage.fat)}g / {analysis.dailyGoals.fat}g
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}