'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { progressAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, TrendingUp, TrendingDown, Minus, Camera } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressEntry {
  _id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  mood?: string;
  energyLevel?: number;
  workoutCompleted?: boolean;
  waterIntake?: number;
  notes?: string;
}

interface Trends {
  weight: {
    change: number;
    direction: string;
  };
  averageMood: number;
  averageEnergyLevel: number;
  workoutFrequency: number;
}

export default function ProgressPage() {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logging, setLogging] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    mood: '',
    energyLevel: '',
    workoutCompleted: false,
    waterIntake: '',
    notes: ''
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await progressAPI.getProgress({ days: 30 });
      setProgressEntries(response.data.progress);
      setTrends(response.data.trends);
    } catch (error) {
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLogging(true);
    try {
      const progressData: any = {
        date: new Date(formData.date).toISOString()
      };

      if (formData.weight) progressData.weight = parseFloat(formData.weight);
      if (formData.bodyFat) progressData.bodyFat = parseFloat(formData.bodyFat);
      if (formData.mood) progressData.mood = formData.mood;
      if (formData.energyLevel) progressData.energyLevel = parseInt(formData.energyLevel);
      if (formData.waterIntake) progressData.waterIntake = parseFloat(formData.waterIntake);
      if (formData.notes) progressData.notes = formData.notes;
      progressData.workoutCompleted = formData.workoutCompleted;

      await progressAPI.logProgress(progressData);
      toast.success('Progress logged successfully!');
      
      setShowLogForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        mood: '',
        energyLevel: '',
        workoutCompleted: false,
        waterIntake: '',
        notes: ''
      });
      fetchProgress();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to log progress');
    } finally {
      setLogging(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: progressEntries
      .filter(entry => entry.weight)
      .reverse()
      .map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: progressEntries
          .filter(entry => entry.weight)
          .reverse()
          .map(entry => entry.weight),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weight Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
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
            <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
            <p className="text-gray-600">Monitor your health and fitness journey</p>
          </div>
          <Button onClick={() => setShowLogForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Progress
          </Button>
        </div>

        {/* Trends Cards */}
        {trends && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    trends.weight.direction === 'increasing' ? 'bg-red-100' :
                    trends.weight.direction === 'decreasing' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {trends.weight.direction === 'increasing' ? (
                      <TrendingUp className="h-6 w-6 text-red-600" />
                    ) : trends.weight.direction === 'decreasing' ? (
                      <TrendingDown className="h-6 w-6 text-green-600" />
                    ) : (
                      <Minus className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weight Change</p>
                    <p className="text-xl font-bold">
                      {trends.weight.change > 0 ? '+' : ''}{trends.weight.change.toFixed(1)} kg
                    </p>
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
                    <p className="text-sm text-gray-600">Avg. Mood</p>
                    <p className="text-xl font-bold">{trends.averageMood.toFixed(1)}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Energy</p>
                    <p className="text-xl font-bold">{trends.averageEnergyLevel.toFixed(1)}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Workout Rate</p>
                    <p className="text-xl font-bold">{trends.workoutFrequency}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Log Form */}
        {showLogForm && (
          <Card>
            <CardHeader>
              <CardTitle>Log Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogProgress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyFat">Body Fat (%)</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      placeholder="15.5"
                      value={formData.bodyFat}
                      onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Mood</Label>
                    <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="How are you feeling?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="terrible">Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Energy Level</Label>
                    <Select value={formData.energyLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, energyLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Energy level 1-5" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Low</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waterIntake">Water Intake (ml)</Label>
                    <Input
                      id="waterIntake"
                      type="number"
                      placeholder="2000"
                      value={formData.waterIntake}
                      onChange={(e) => setFormData(prev => ({ ...prev, waterIntake: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    <input
                      type="checkbox"
                      checked={formData.workoutCompleted}
                      onChange={(e) => setFormData(prev => ({ ...prev, workoutCompleted: e.target.checked }))}
                      className="mr-2"
                    />
                    Workout completed today
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={logging} className="flex-1">
                    {logging ? 'Logging...' : 'Log Progress'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowLogForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Weight Chart */}
        {progressEntries.filter(entry => entry.weight).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Progress Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {progressEntries.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress entries yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your progress to see trends over time</p>
                <Button onClick={() => setShowLogForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {progressEntries.slice(0, 5).map((entry) => (
                  <div key={entry._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{new Date(entry.date).toLocaleDateString()}</h4>
                      <div className="flex gap-2">
                        {entry.workoutCompleted && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Workout ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {entry.weight && (
                        <div>
                          <span className="text-gray-500">Weight:</span> {entry.weight} kg
                        </div>
                      )}
                      {entry.mood && (
                        <div>
                          <span className="text-gray-500">Mood:</span> {entry.mood}
                        </div>
                      )}
                      {entry.energyLevel && (
                        <div>
                          <span className="text-gray-500">Energy:</span> {entry.energyLevel}/5
                        </div>
                      )}
                      {entry.waterIntake && (
                        <div>
                          <span className="text-gray-500">Water:</span> {entry.waterIntake} ml
                        </div>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-gray-600 text-sm mt-2">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}