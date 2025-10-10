export function useCostCalculator() {
  return {
    calculateIngredientCosts: () => ({ ingredients: [], totalCost: 0 }),
    calculateMenuCost: () => ({ totalCost: 0, costPerServing: 0 }),
    isLoading: false,
    error: null
  }
}
