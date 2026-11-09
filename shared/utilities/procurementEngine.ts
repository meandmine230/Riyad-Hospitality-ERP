export interface MatchLineResult {
  sku: string;
  poQty: number;
  grnQty: number;
  invoiceQty: number;
  poPriceSAR: number;
  invoicePriceSAR: number;
  quantityMatched: boolean;
  priceMatched: boolean;
  varianceSAR: number;
  status: 'MATCHED' | 'QTY_EXCEEDED' | 'PRICE_VARIANCE_EXCEEDED';
}

export interface ThreeWayMatchResult {
  overallStatus: 'MATCHED' | 'DISCREPANCY';
  lines: MatchLineResult[];
  poTotalSAR: number;
  grnTotalSAR: number;
  invoiceTotalSAR: number;
  priceVarianceSAR: number;
  variancePercentage: number;
  isApprovalRequired: boolean;
  approvalReason?: string;
}

/**
 * Validates 3-way matching between Purchase Order, Goods Receipt Note, and Vendor Invoice.
 * Standard Saudi hospitality policy:
 * - Invoiced Qty cannot exceed GRN Accepted Qty.
 * - Price variance tolerated up to 2.5% or 250 SAR, otherwise requires Financial Controller approval.
 */
export function executeThreeWayMatch(params: {
  poItems: { sku: string; quantity: number; unitPriceSAR: number }[];
  grnItems: { sku: string; quantityAccepted: number; unitPriceSAR: number }[];
  invoiceItems: { sku: string; quantityBilled: number; unitPriceSAR: number }[];
  maxPriceVariancePercent?: number; // default 2.5%
}): ThreeWayMatchResult {
  const maxVariancePercent = params.maxPriceVariancePercent ?? 2.5;
  const lines: MatchLineResult[] = [];
  let poTotalSAR = 0;
  let grnTotalSAR = 0;
  let invoiceTotalSAR = 0;
  let hasDiscrepancy = false;
  const approvalReasons: string[] = [];

  const grnMap = new Map(params.grnItems.map((g) => [g.sku, g]));
  const invoiceMap = new Map(params.invoiceItems.map((i) => [i.sku, i]));

  for (const poItem of params.poItems) {
    const grn = grnMap.get(poItem.sku);
    const inv = invoiceMap.get(poItem.sku);

    const grnQty = grn ? grn.quantityAccepted : 0;
    const invQty = inv ? inv.quantityBilled : 0;
    const invPrice = inv ? inv.unitPriceSAR : poItem.unitPriceSAR;

    poTotalSAR += poItem.quantity * poItem.unitPriceSAR;
    grnTotalSAR += grnQty * poItem.unitPriceSAR;
    invoiceTotalSAR += invQty * invPrice;

    // Quantity validation: Invoiced qty must not exceed GRN accepted qty
    const quantityMatched = invQty <= grnQty;

    // Price validation: Price variance
    const priceDiff = Math.abs(invPrice - poItem.unitPriceSAR);
    const variancePercent = poItem.unitPriceSAR > 0 ? (priceDiff / poItem.unitPriceSAR) * 100 : 0;
    const priceMatched = variancePercent <= maxVariancePercent;

    let lineStatus: MatchLineResult['status'] = 'MATCHED';
    if (!quantityMatched) {
      lineStatus = 'QTY_EXCEEDED';
      hasDiscrepancy = true;
      approvalReasons.push(`SKU ${poItem.sku}: Invoiced quantity (${invQty}) exceeds GRN received quantity (${grnQty}).`);
    } else if (!priceMatched) {
      lineStatus = 'PRICE_VARIANCE_EXCEEDED';
      hasDiscrepancy = true;
      approvalReasons.push(`SKU ${poItem.sku}: Price variance of ${variancePercent.toFixed(1)}% exceeds the ${maxVariancePercent}% policy limit.`);
    }

    lines.push({
      sku: poItem.sku,
      poQty: poItem.quantity,
      grnQty,
      invoiceQty: invQty,
      poPriceSAR: poItem.unitPriceSAR,
      invoicePriceSAR: invPrice,
      quantityMatched,
      priceMatched,
      varianceSAR: Math.round((invQty * invPrice - grnQty * poItem.unitPriceSAR) * 100) / 100,
      status: lineStatus,
    });
  }

  const priceVarianceSAR = Math.round((invoiceTotalSAR - grnTotalSAR) * 100) / 100;
  const variancePercentage = grnTotalSAR > 0 ? Math.round(((invoiceTotalSAR - grnTotalSAR) / grnTotalSAR) * 1000) / 10 : 0;

  return {
    overallStatus: hasDiscrepancy ? 'DISCREPANCY' : 'MATCHED',
    lines,
    poTotalSAR: Math.round(poTotalSAR * 100) / 100,
    grnTotalSAR: Math.round(grnTotalSAR * 100) / 100,
    invoiceTotalSAR: Math.round(invoiceTotalSAR * 100) / 100,
    priceVarianceSAR,
    variancePercentage,
    isApprovalRequired: hasDiscrepancy,
    approvalReason: approvalReasons.join(' | ') || undefined,
  };
}
