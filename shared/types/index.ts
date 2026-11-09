export type PropertyId = 'PROP-RUH-01' | 'PROP-MAK-02' | 'PROP-JED-03';

export interface Property {
  id: PropertyId;
  code: string;
  nameEn: string;
  nameAr: string;
  city: 'Riyadh' | 'Makkah' | 'Jeddah';
  cityAr: string;
  keys: number;
  starRating: number;
  taxRegistrationNumber: string; // 15 digits ZATCA TRN
  currency: 'SAR';
  manager: string;
}

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface ChartAccount {
  code: string;
  nameEn: string;
  nameAr: string;
  category: AccountCategory;
  subCategory: string;
  subCategoryAr: string;
  normalBalance: NormalBalance;
  isActive: boolean;
  parentCode?: string;
}

export type VoucherType =
  | 'JOURNAL'
  | 'CASH_PAYMENT'
  | 'CASH_RECEIPT'
  | 'BANK_PAYMENT'
  | 'BANK_RECEIPT'
  | 'NIGHT_AUDIT'
  | 'PAYROLL'
  | 'INVENTORY_ISSUE';

export type VoucherStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'POSTED' | 'REVERSED';

export type ChequeStatus =
  | 'WAITING_FOR_CHECKS'
  | 'WAITING_FOR_APPROVAL'
  | 'READY_TO_ISSUE'
  | 'ISSUED_AND_CLEARED';

export interface ChequeRecord {
  id: string;
  propertyId: PropertyId;
  chequeNumber: string;
  bankName: string;
  glAccountCode: string;
  beneficiary: string;
  beneficiaryAr?: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: ChequeStatus;
  voucherRef?: string;
  notes?: string;
  preparedBy: string;
  approvedByFC?: string;
  approvedByGM?: string;
  clearedAt?: string;
}

export interface VoucherEntry {
  id: string;
  accountCode: string;
  accountNameEn: string;
  accountNameAr: string;
  debit: number;
  credit: number;
  costCenter: string;
  memo: string;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  propertyId: PropertyId;
  type: VoucherType;
  date: string;
  fiscalPeriod: string; // e.g. 2026-11
  narration: string;
  narrationAr: string;
  entries: VoucherEntry[];
  totalDebit: number;
  totalCredit: number;
  status: VoucherStatus;
  postedBy?: string;
  postedAt?: string;
  referenceDoc?: string;
  isBalanced: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  vatNumber: string;
  crNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTermsDays: number;
  creditLimitSAR: number;
  currentBalanceSAR: number;
  category: 'FOOD_BEVERAGE' | 'GUEST_AMENITIES' | 'LINEN_LAUNDRY' | 'ENGINEERING' | 'IT_SYSTEMS';
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  propertyId: PropertyId;
  poNumber?: string;
  grnNumber?: string;
  invoiceDate: string;
  dueDate: string;
  subtotalSAR: number;
  vatAmountSAR: number; // 15%
  totalAmountSAR: number;
  paidAmountSAR: number;
  status: 'PENDING_MATCH' | 'MATCHED' | 'PARTIALLY_PAID' | 'PAID' | 'DISPUTED';
  threeWayMatchStatus: 'MATCHED' | 'DISCREPANCY' | 'NO_PO_ATTACHED';
}

export interface CustomerAccount {
  id: string;
  accountNumber: string;
  type: 'CITY_LEDGER' | 'CORPORATE' | 'AIRLINE' | 'GOVERNMENT' | 'TRAVEL_AGENCY';
  nameEn: string;
  nameAr: string;
  contactPerson: string;
  phone: string;
  creditLimitSAR: number;
  currentBalanceSAR: number;
  status: 'ACTIVE' | 'ON_HOLD' | 'SUSPENDED';
}

export interface PurchaseRequisition {
  id: string;
  reqNumber: string;
  propertyId: PropertyId;
  department: string;
  requestedBy: string;
  date: string;
  requiredDate: string;
  justification: string;
  items: {
    sku: string;
    description: string;
    quantity: number;
    uom: string;
    estimatedUnitCostSAR: number;
    estimatedTotalSAR: number;
  }[];
  totalEstimatedSAR: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED_DEPT_HEAD' | 'APPROVED_FINANCE' | 'CONVERTED_TO_PO' | 'REJECTED';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  propertyId: PropertyId;
  requisitionId?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  deliveryDueDate: string;
  paymentTerms: string;
  items: {
    sku: string;
    description: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitPriceSAR: number;
    vatRate: number; // 0.15
    lineTotalSAR: number;
  }[];
  subtotalSAR: number;
  vatTotalSAR: number;
  grandTotalSAR: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'FULFILLED' | 'CANCELLED';
  matchedInvoiceNumber?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  propertyId: PropertyId;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receivingDate: string;
  receivedBy: string;
  storeLocation: string;
  items: {
    sku: string;
    description: string;
    quantityOrdered: number;
    quantityReceived: number;
    quantityAccepted: number;
    quantityRejected: number;
    rejectionReason?: string;
    unitPriceSAR: number;
    totalSAR: number;
    expiryDate?: string;
    temperatureChecked?: string;
  }[];
  totalAcceptedValueSAR: number;
  status: 'INSPECTED_ACCEPTED' | 'ACCEPTED_WITH_DISCREPANCY' | 'POSTED_TO_INVENTORY';
}

export interface StockItem {
  id: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  category: 'F_AND_B' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'GUEST_SUPPLIES';
  uom: string;
  reorderLevel: number;
  stores: {
    storeName: 'Main Store' | 'F&B Kitchen Store' | 'Housekeeping Floor Store' | 'Engineering Store';
    quantityOnHand: number;
  }[];
  totalOnHand: number;
  weightedAvgCostSAR: number;
  lastPurchasePriceSAR: number;
  totalValuationSAR: number;
}

export interface RecipeItem {
  id: string;
  recipeCode: string;
  menuNameEn: string;
  menuNameAr: string;
  outlet: 'Main Restaurant (Al Liwan)' | 'In-Room Dining' | 'Lobby Lounge' | 'Pool Terrace';
  portionYield: number;
  sellingPriceSAR: number;
  ingredients: {
    itemSku: string;
    itemName: string;
    portionQty: number;
    uom: string;
    unitCostSAR: number;
    lineCostSAR: number;
  }[];
  totalCostPerPortionSAR: number;
  targetFoodCostPercentage: number;
  actualFoodCostPercentage: number;
  grossMarginSAR: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'HIGH_COST_ALERT';
}

export interface BankAccount {
  id: string;
  bankName: 'Al Rajhi Bank' | 'Saudi National Bank (SNB)' | 'Riyad Bank';
  accountTitle: string;
  accountNumber: string;
  iban: string;
  currency: 'SAR';
  glAccountCode: string;
  currentBookBalanceSAR: number;
  unreconciledBankBalanceSAR: number;
}

export interface PettyCashFloat {
  id: string;
  custodianName: string;
  propertyId: PropertyId;
  department: string;
  authorizedLimitSAR: number;
  currentCashSAR: number;
  pendingVouchersSAR: number;
  glAccountCode: string;
  status: 'ACTIVE' | 'REPLENISHMENT_REQUESTED';
}

export interface DepartmentBudget {
  id: string;
  propertyId: PropertyId;
  fiscalYear: number;
  department: 'Rooms' | 'Food & Beverage' | 'Administration & General' | 'Sales & Marketing' | 'Property Operations & Maintenance';
  allocatedAnnualSAR: number;
  allocatedYtdSAR: number;
  actualYtdSAR: number;
  committedSAR: number;
  varianceSAR: number; // allocatedYtd - actualYtd
  variancePercentage: number;
  isOverBudget: boolean;
}

export interface EmployeeRecord {
  id: string;
  employeeNumber: string;
  nameEn: string;
  nameAr: string;
  nationality: 'SAUDI' | 'NON_SAUDI';
  nationalIdOrIqama: string;
  propertyId: PropertyId;
  department: string;
  jobTitleEn: string;
  jobTitleAr: string;
  joinDate: string; // YYYY-MM-DD
  basicSalarySAR: number;
  housingAllowanceSAR: number;
  transportAllowanceSAR: number;
  otherAllowancesSAR: number;
  totalGrossSalarySAR: number;
  gosiEmployeeDeductionSAR: number;
  gosiEmployerContributionSAR: number;
  accumulatedEosbSAR: number;
  activeAdvancesSAR: number;
}

export interface PMSNightAuditData {
  id: string;
  auditDate: string;
  propertyId: PropertyId;
  pmsSystem: 'Opera Cloud' | 'Cloudbeds' | 'Mews';
  totalRooms: number;
  occupiedRooms: number;
  occupancyPercentage: number;
  roomRevenueSAR: number;
  adrSAR: number;
  revParSAR: number;
  fbRevenueSAR: number;
  otherRevenueSAR: number;
  vatCollectedSAR: number; // 15%
  municipalityTaxSAR: number; // 2.5% tourism/municipality if applicable
  totalDailyRevenueSAR: number;
  guestLedgerDebitBalanceSAR: number;
  cityLedgerTransfersSAR: number;
  creditCardSettlementsSAR: number;
  cashReceivedSAR: number;
  isPostedToGL: boolean;
  postedVoucherNumber?: string;
  motSyncStatus: 'SYNCED_WITH_MINISTRY_OF_TOURISM' | 'PENDING' | 'ERROR';
}

export interface AgentTask {
  id: string;
  agentId: string; // e.g. AGENT-03
  agentName: string;
  moduleName: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'READY' | 'IN_PROGRESS' | 'CODE_REVIEW' | 'QA_TESTING' | 'COMPLETED';
  dependencies: string[];
  deliverables: string[];
  testCoverage: string;
}

export interface CorporateInvoice {
  id: string;
  invoiceNumber: string;
  customerAccountId: string;
  customerName: string;
  folioNumber: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  amountSAR: number;
  paidAmountSAR: number;
  balanceDueSAR: number;
  dueDate: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
}

export interface CashierShiftDrop {
  id: string;
  propertyId: PropertyId;
  shiftCode: 'MORNING' | 'EVENING' | 'NIGHT';
  cashierName: string;
  cashierNameAr?: string;
  terminalId: string;
  dropDate: string;
  expectedCashSAR: number;
  actualCashSAR: number;
  expectedMadaSAR: number;
  actualMadaSAR: number;
  expectedCreditCardSAR: number;
  actualCreditCardSAR: number;
  varianceSAR: number; // total actual - total expected
  status: 'PENDING_AUDIT' | 'RECONCILED' | 'POSTED_TO_GL';
  postedVoucherNumber?: string;
  dropEnvelopeNumber: string;
  witnessedBy: string;
}

export interface StoreIssueVoucher {
  id: string;
  propertyId: PropertyId;
  sivNumber: string;
  date: string;
  requestingOutlet: 'Main Restaurant (Al Liwan)' | 'In-Room Dining' | 'Lobby Lounge' | 'Pool Terrace' | 'Banquet Hall';
  costCenterCode: string;
  issuedBy: string;
  receivedByChef: string;
  items: {
    sku: string;
    name: string;
    quantity: number;
    uom: string;
    unitCostSAR: number;
    totalCostSAR: number;
  }[];
  totalCostSAR: number;
  status: 'APPROVED_COST_CONTROLLER' | 'ISSUED_TO_KITCHEN' | 'POSTED_TO_GL';
  postedVoucherNumber?: string;
}
