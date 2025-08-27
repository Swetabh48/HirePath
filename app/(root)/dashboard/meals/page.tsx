'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MealLogForm from '@/components/meals/MealLogForm';
import NutritionSummary from '@/components/dashboard/NutritionSummary';

export default function MealsPage() {
  const handleMealLogged = () => {
    // Refresh nutrition summary
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <MealLogForm onSuccess={handleMealLogged} />
          </div>
          <div>
            <NutritionSummary />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}