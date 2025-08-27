'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mealPlansAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Calendar, Clock, ChefHat } from 'lucide-react';

interface MealPlan {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  generatedBy: string;
  meals: any[];
}

export default function MealPlansPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    daysCount: 7,
    startDate: new Date().toISOString().split('T')[0],
    preferences: {
      dietaryRestrictions: [] as string[],
      excludedFoods: [] as string[],
      maxPrepTime: 60,
      cuisinePreferences: [] as string[]
    }
  });

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const response = await mealPlansAPI.getMealPlans({});
      setMealPlans(response.data.mealPlans);
    } catch (error) {
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a meal plan name');
      return;
    }

    setCreating(true);
    try {
      await mealPlansAPI.generateMealPlan({
        ...formData,
        startDate: new Date(formData.startDate).toISOString()
      });
      
      toast.success('Meal plan generated successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        daysCount: 7,
        startDate: new Date().toISOString().split('T')[0],
        preferences: {
          dietaryRestrictions: [],
          excludedFoods: [],
          maxPrepTime: 60,
          cuisinePreferences: []
        }
      });
      fetchMealPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate meal plan');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meal Plans</h2>
            <p className="text-gray-600">AI-generated personalized meal plans for your goals</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate New Plan
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Generate New Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMealPlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Weekly Muscle Gain Plan"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daysCount">Duration (Days)</Label>
                    <Select 
                      value={formData.daysCount.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, daysCount: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">1 Week</SelectItem>
                        <SelectItem value="14">2 Weeks</SelectItem>
                        <SelectItem value="30">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Describe your meal plan goals..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={creating} className="flex-1">
                    {creating ? 'Generating...' : 'Generate Meal Plan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Meal Plans List */}
        {mealPlans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans yet</h3>
              <p className="text-gray-500 mb-4">
                Generate your first AI-powered meal plan tailored to your goals
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan) => (
              <Card key={plan._id} className={plan.isActive ? 'ring-2 ring-green-500' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.isActive && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {plan.generatedBy}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {plan.description && (
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {plan.meals?.length || 0} meals planned
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                    {!plan.isActive && (
                      <Button size="sm" className="w-full">
                        Make Active
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}