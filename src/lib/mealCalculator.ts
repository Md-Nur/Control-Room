
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
 * Calculates the total meal cost for a month or interval.
 * 
 * Rules:
 * - Breakfast = 30
 * - Lunch = 35
 * - Dinner = 35
 * 
 * @param records Array of meal records
 */
export const calculateMonthlyMealCost = (records: DailyMealRecord[]): number => {
  let totalCost = 0;

  for (const record of records) {
    const { breakfast, lunch, dinner } = record;
    if (breakfast) totalCost += MEAL_PRICES.breakfast;
    if (lunch) totalCost += MEAL_PRICES.lunch;
    if (dinner) totalCost += MEAL_PRICES.dinner;
  }

  return totalCost;
};
