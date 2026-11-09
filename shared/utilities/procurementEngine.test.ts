import test from 'node:test';
import assert from 'node:assert/strict';
import { executeThreeWayMatch } from './procurementEngine';

test('Procurement Engine: matches 3-way successfully when quantities and prices align', () => {
  const result = executeThreeWayMatch({
    poItems: [{ sku: 'SKU-LINEN-01', quantity: 100, unitPriceSAR: 85 }],
    grnItems: [{ sku: 'SKU-LINEN-01', quantityAccepted: 100, unitPriceSAR: 85 }],
    invoiceItems: [{ sku: 'SKU-LINEN-01', quantityBilled: 100, unitPriceSAR: 85 }],
  });

  assert.equal(result.overallStatus, 'MATCHED');
  assert.equal(result.isApprovalRequired, false);
  assert.equal(result.priceVarianceSAR, 0);
  assert.equal(result.lines[0].status, 'MATCHED');
});

test('Procurement Engine: flags discrepancy when invoiced quantity exceeds GRN received quantity', () => {
  const result = executeThreeWayMatch({
    poItems: [{ sku: 'SKU-FOOD-BEEF', quantity: 50, unitPriceSAR: 120 }],
    grnItems: [{ sku: 'SKU-FOOD-BEEF', quantityAccepted: 40, unitPriceSAR: 120 }], // only 40 delivered
    invoiceItems: [{ sku: 'SKU-FOOD-BEEF', quantityBilled: 50, unitPriceSAR: 120 }], // billed for 50
  });

  assert.equal(result.overallStatus, 'DISCREPANCY');
  assert.equal(result.isApprovalRequired, true);
  assert.equal(result.lines[0].status, 'QTY_EXCEEDED');
  assert.match(result.approvalReason || '', /exceeds GRN received quantity/);
});

test('Procurement Engine: flags price variance exceeding threshold', () => {
  const result = executeThreeWayMatch({
    poItems: [{ sku: 'SKU-AMENITY-KIT', quantity: 200, unitPriceSAR: 20 }],
    grnItems: [{ sku: 'SKU-AMENITY-KIT', quantityAccepted: 200, unitPriceSAR: 20 }],
    invoiceItems: [{ sku: 'SKU-AMENITY-KIT', quantityBilled: 200, unitPriceSAR: 22 }], // 10% increase > 2.5% max
    maxPriceVariancePercent: 2.5,
  });

  assert.equal(result.overallStatus, 'DISCREPANCY');
  assert.equal(result.isApprovalRequired, true);
  assert.equal(result.lines[0].status, 'PRICE_VARIANCE_EXCEEDED');
});
