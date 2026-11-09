export interface InventoryValuationUpdate {
  sku: string;
  previousQuantity: number;
  previousAvgCostSAR: number;
  receivedQuantity: number;
  receivedUnitPriceSAR: number;
  newQuantity: number;
  newAvgCostSAR: number;
  newTotalValuationSAR: number;
}

/**
 * Computes Moving Weighted Average Cost when new stock is received.
 */
export function calculateWeightedAverageCost(params: {
  currentQuantity: number;
  currentAvgCostSAR: number;
  receivedQuantity: number;
  receivedUnitPriceSAR: number;
}): { newQuantity: number; newAvgCostSAR: number; newTotalValuationSAR: number } {
  const currentQty = Math.max(0, params.currentQuantity);
  const currentCost = Math.max(0, params.currentAvgCostSAR);
  const recQty = Math.max(0, params.receivedQuantity);
  const recCost = Math.max(0, params.receivedUnitPriceSAR);

  const totalQty = currentQty + recQty;

  if (totalQty === 0) {
    return { newQuantity: 0, newAvgCostSAR: 0, newTotalValuationSAR: 0 };
  }

  const currentTotalValuation = currentQty * currentCost;
  const receivedTotalValuation = recQty * recCost;
  const newTotalValuation = currentTotalValuation + receivedTotalValuation;

  const newAvgCostSAR = Math.round((newTotalValuation / totalQty) * 10000) / 10000;
  const newTotalValuationSAR = Math.round(totalQty * newAvgCostSAR * 100) / 100;

  return {
    newQuantity: totalQty,
    newAvgCostSAR,
    newTotalValuationSAR,
  };
}

export interface RecipeCostingCalculation {
  totalCostPerPortionSAR: number;
  sellingPriceSAR: number;
  grossMarginSAR: number;
  foodCostPercentage: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'HIGH_COST_ALERT';
}

/**
 * Computes F&B Recipe Costing, Food Cost %, and Cost Health classification.
 * Luxury hotel standard:
 * Optimal: <= 32%
 * Acceptable: 32.1% - 38%
 * High Cost Alert: > 38%
 */
export function calculateRecipeCost(
  ingredients: { portionQty: number; unitCostSAR: number }[],
  sellingPriceSAR: number
): RecipeCostingCalculation {
  let totalCost = 0;
  for (const ing of ingredients) {
    totalCost += (ing.portionQty || 0) * (ing.unitCostSAR || 0);
  }

  const totalCostPerPortionSAR = Math.round(totalCost * 100) / 100;
  const selling = Math.max(0.01, sellingPriceSAR);
  const grossMarginSAR = Math.round((selling - totalCostPerPortionSAR) * 100) / 100;
  const foodCostPercentage = Math.round((totalCostPerPortionSAR / selling) * 1000) / 10;

  let status: RecipeCostingCalculation['status'] = 'OPTIMAL';
  if (foodCostPercentage > 38) {
    status = 'HIGH_COST_ALERT';
  } else if (foodCostPercentage > 32) {
    status = 'ACCEPTABLE';
  }

  return {
    totalCostPerPortionSAR,
    sellingPriceSAR: selling,
    grossMarginSAR,
    foodCostPercentage,
    status,
  };
}
