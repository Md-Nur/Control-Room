
export interface DailyMealRecord {
  date: string | Date;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
}

export const MEAL_PRICES = {
  breakfast: 30,
  lunch: 35,
  dinner: 35,
};

/**
 * Calculates the total meal cost for the month.
 * 
 * Rules:
 * - Breakfast = 30
 * - Lunch = 35
 * - Dinner = 35
 * - Default (if no meals specified) = Breakfast + Dinner (65)
 */
export const calculateMonthlyMealCost = (records: DailyMealRecord[]): number => {
  let totalCost = 0;

  for (const record of records) {
    const { breakfast, lunch, dinner } = record;
    // Check if any meal is explicitly set to true
    const isAnyMealSpecified = breakfast === true || lunch === true || dinner === true;

    if (!isAnyMealSpecified) {
      // Default: Breakfast + Dinner
      totalCost += MEAL_PRICES.breakfast + MEAL_PRICES.dinner;
    } else {
      // Sum specifically selected meals
      if (breakfast) totalCost += MEAL_PRICES.breakfast;
      if (lunch) totalCost += MEAL_PRICES.lunch;
      if (dinner) totalCost += MEAL_PRICES.dinner;
    }
  }

  return totalCost;
};
