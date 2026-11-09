import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWeightedAverageCost, calculateRecipeCost } from './inventoryEngine';

test('Inventory Engine: recalculates moving weighted average cost accurately', () => {
  // Existing: 100 units @ 50 SAR = 5,000 SAR
  // Received: 50 units @ 65 SAR = 3,250 SAR
  // New Total: 150 units, Total Value = 8,250 SAR -> New Avg = 8250 / 150 = 55.00 SAR
  const result = calculateWeightedAverageCost({
    currentQuantity: 100,
    currentAvgCostSAR: 50,
    receivedQuantity: 50,
    receivedUnitPriceSAR: 65,
  });

  assert.equal(result.newQuantity, 150);
  assert.equal(result.newAvgCostSAR, 55);
  assert.equal(result.newTotalValuationSAR, 8250);
});

test('Inventory Engine: computes F&B recipe food cost percentage and classifies margin', () => {
  // Luxury Wagyu Burger: ingredients cost 36 SAR, Selling Price = 120 SAR -> 30% Food Cost (OPTIMAL)
  const optimalRecipe = calculateRecipeCost(
    [
      { portionQty: 1, unitCostSAR: 25 }, // Wagyu patty
      { portionQty: 1, unitCostSAR: 5 },  // Brioche bun
      { portionQty: 1, unitCostSAR: 6 },  // Truffle mayo & toppings
    ],
    120
  );

  assert.equal(optimalRecipe.totalCostPerPortionSAR, 36);
  assert.equal(optimalRecipe.foodCostPercentage, 30);
  assert.equal(optimalRecipe.grossMarginSAR, 84);
  assert.equal(optimalRecipe.status, 'OPTIMAL');

  // High cost dish: ingredients cost 55 SAR, Selling Price = 100 SAR -> 55% Food Cost (HIGH_COST_ALERT)
  const highCostRecipe = calculateRecipeCost(
    [{ portionQty: 1, unitCostSAR: 55 }],
    100
  );
  assert.equal(highCostRecipe.foodCostPercentage, 55);
  assert.equal(highCostRecipe.status, 'HIGH_COST_ALERT');
});
