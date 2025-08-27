export function calculateBmrHarrisBenedict(gender, weightKg, heightCm, age) {
    const male = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
    const female = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
    const other = (male + female) / 2;
    return gender === 'MALE' ? male : gender === 'FEMALE' ? female : other;
}
export function calculateDailyTargets(gender, weightKg, heightCm, age, activityLevel, goal) {
    const bmr = calculateBmrHarrisBenedict(gender, weightKg, heightCm, age);
    const tdee = bmr * (activityLevel || 1.2);
    let calories = tdee;
    if (goal === 'LOSS')
        calories = tdee - 500; // approx 0.45kg/week
    if (goal === 'GAIN')
        calories = tdee + 300; // lean bulk
    calories = Math.max(1200, Math.round(calories));
    // Protein: 1.6g/kg, Fat: 25% cals, Carbs: rest
    const proteinGrams = Math.round(Math.max(80, 1.6 * weightKg));
    const fatsCalories = Math.round(0.25 * calories);
    const fatsGrams = Math.round(fatsCalories / 9);
    const proteinCalories = proteinGrams * 4;
    const carbsCalories = Math.max(0, calories - proteinCalories - fatsCalories);
    const carbsGrams = Math.round(carbsCalories / 4);
    return { calories, proteinGrams, fatsGrams, carbsGrams };
}
export function sumNutrients(items) {
    return items.reduce((acc, it) => {
        acc.calories += it.calories || 0;
        acc.protein += it.protein || 0;
        acc.carbs += it.carbs || 0;
        acc.fat += it.fat || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
