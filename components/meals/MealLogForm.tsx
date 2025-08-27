'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mealsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Camera, Type, Search, Plus, X } from 'lucide-react';
import FoodSearch from './FoodSearch';

interface Food {
  _id: string;
  name: string;
  brand?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealFood {
  food: Food;
  quantity: number;
}

export default function MealLogForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mealType, setMealType] = useState<string>('');
  const [logMethod, setLogMethod] = useState<'manual' | 'image' | 'text'>('manual');
  const [foods, setFoods] = useState<MealFood[]>([]);
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textDescription, setTextDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);

  const handleAddFood = (food: Food) => {
    setFoods(prev => [...prev, { food, quantity: 100 }]);
    setShowFoodSearch(false);
  };

  const handleRemoveFood = (index: number) => {
    setFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setFoods(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const response = await mealsAPI.analyzeImage({
          imageBase64: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mealType
        });

        const { result } = response.data;
        // Convert AI result to our format
        const analyzedFoods = result.foods.map((food: any) => ({
          food: {
            _id: `temp-${Date.now()}-${Math.random()}`,
            name: food.name,
            nutrition: food.nutrition
          },
          quantity: food.estimatedWeight
        }));

        setFoods(analyzedFoods);
        toast.success('Image analyzed successfully!');
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      toast.error('Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeText = async () => {
    if (!textDescription.trim()) return;

    setIsLoading(true);
    try {
      const response = await mealsAPI.analyzeText({
        description: textDescription,
        mealType
      });

      const { result } = response.data;
      // Convert AI result to our format
      const analyzedFoods = result.foods.map((food: any) => ({
        food: {
          _id: `temp-${Date.now()}-${Math.random()}`,
          name: food.name,
          nutrition: food.nutrition
        },
        quantity: food.estimatedWeight
      }));

      setFoods(analyzedFoods);
      toast.success('Text analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze text');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalNutrition = () => {
    return foods.reduce((total, { food, quantity }) => {
      const multiplier = quantity / 100; // nutrition is per 100g
      return {
        calories: total.calories + (food.nutrition.calories * multiplier),
        protein: total.protein + (food.nutrition.protein * multiplier),
        carbs: total.carbs + (food.nutrition.carbs * multiplier),
        fat: total.fat + (food.nutrition.fat * multiplier)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mealType) {
      toast.error('Please select a meal type');
      return;
    }

    if (foods.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

    setIsLoading(true);
    try {
      const mealData = {
        date: new Date().toISOString(),
        mealType,
        foods: foods.map(({ food, quantity }) => ({
          foodId: food._id,
          quantity
        })),
        notes,
        logMethod
      };

      await mealsAPI.logMeal(mealData);
      toast.success('Meal logged successfully!');
      
      // Reset form
      setMealType('');
      setFoods([]);
      setNotes('');
      setImageFile(null);
      setTextDescription('');
      setLogMethod('manual');
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to log meal');
    } finally {
      setIsLoading(false);
    }
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Your Meal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meal Type */}
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Log Method Selection */}
            <div className="space-y-2">
              <Label>How would you like to log this meal?</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={logMethod === 'manual' ? 'default' : 'outline'}
                  onClick={() => setLogMethod('manual')}
                  className="flex-1"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Foods
                </Button>
                <Button
                  type="button"
                  variant={logMethod === 'image' ? 'default' : 'outline'}
                  onClick={() => setLogMethod('image')}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant={logMethod === 'text' ? 'default' : 'outline'}
                  onClick={() => setLogMethod('text')}
                  className="flex-1"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Describe Meal
                </Button>
              </div>
            </div>

            {/* Method-specific inputs */}
            {logMethod === 'manual' && (
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={() => setShowFoodSearch(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food
                </Button>
                {showFoodSearch && (
                  <FoodSearch
                    onSelect={handleAddFood}
                    onClose={() => setShowFoodSearch(false)}
                  />
                )}
              </div>
            )}

            {logMethod === 'image' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Food Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                {imageFile && (
                  <Button
                    type="button"
                    onClick={analyzeImage}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                )}
              </div>
            )}

            {logMethod === 'text' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Describe your meal</Label>
                  <Input
                    id="description"
                    placeholder="e.g., grilled chicken breast with rice and vegetables"
                    value={textDescription}
                    onChange={(e) => setTextDescription(e.target.value)}
                  />
                </div>
                {textDescription && (
                  <Button
                    type="button"
                    onClick={analyzeText}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Description'}
                  </Button>
                )}
              </div>
            )}

            {/* Food List */}
            {foods.length > 0 && (
              <div className="space-y-4">
                <Label>Foods in this meal:</Label>
                {foods.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.food.name}</p>
                      {item.food.brand && (
                        <p className="text-sm text-gray-500">{item.food.brand}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min="0"
                        step="0.1"
                      />
                      <span className="text-sm text-gray-500">g</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFood(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Nutrition Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Meal Nutrition</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">{Math.round(totalNutrition.calories)}</span>
                      <div className="text-gray-500">Calories</div>
                    </div>
                    <div>
                      <span className="font-medium">{Math.round(totalNutrition.protein)}g</span>
                      <div className="text-gray-500">Protein</div>
                    </div>
                    <div>
                      <span className="font-medium">{Math.round(totalNutrition.carbs)}g</span>
                      <div className="text-gray-500">Carbs</div>
                    </div>
                    <div>
                      <span className="font-medium">{Math.round(totalNutrition.fat)}g</span>
                      <div className="text-gray-500">Fat</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes about this meal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || foods.length === 0 || !mealType}
              className="w-full"
            >
              {isLoading ? 'Logging Meal...' : 'Log Meal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}