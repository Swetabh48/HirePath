'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { foodsAPI } from '@/lib/api';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface Food {
  _id: string;
  name: string;
  brand?: string;
  category: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface FoodSearchProps {
  onSelect: (food: Food) => void;
  onClose: () => void;
}

export default function FoodSearch({ onSelect, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'fruits', 'vegetables', 'grains', 'protein', 'dairy', 'nuts_seeds',
    'oils_fats', 'beverages', 'snacks', 'desserts', 'condiments',
    'restaurant', 'fast_food', 'prepared_meals'
  ];

  useEffect(() => {
    if (query.length >= 2) {
      searchFoods();
    } else {
      setFoods([]);
    }
  }, [query, selectedCategory]);

  useEffect(() => {
    // Focus search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const searchFoods = async () => {
    setLoading(true);
    try {
      const params: any = { q: query };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await foodsAPI.search(params);
      setFoods(response.data.foods);
    } catch (error) {
      toast.error('Failed to search foods');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (food: Food) => {
    onSelect(food);
    setQuery('');
    setFoods([]);
  };

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-lg md:relative md:inset-auto">
      <CardContent className="p-6 h-full md:h-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Search Foods</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search for foods..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            )}

            {!loading && query.length >= 2 && foods.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No foods found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
              </div>
            )}

            {foods.map((food) => (
              <div
                key={food._id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelect(food)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{food.name}</h4>
                    {food.brand && (
                      <p className="text-sm text-gray-500">{food.brand}</p>
                    )}
                    <p className="text-xs text-gray-400 capitalize">
                      {food.category.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{food.nutrition.calories} cal</div>
                    <div className="text-gray-500">per 100g</div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>P: {food.nutrition.protein}g</div>
                  <div>C: {food.nutrition.carbs}g</div>
                  <div>F: {food.nutrition.fat}g</div>
                </div>
              </div>
            ))}
          </div>

          {query.length < 2 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Start typing to search for foods</p>
              <p className="text-sm text-gray-400 mt-1">Minimum 2 characters required</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}