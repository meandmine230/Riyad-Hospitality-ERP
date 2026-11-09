import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Property,
  PropertyId,
  Voucher,
  Supplier,
  VendorInvoice,
  CustomerAccount,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceiptNote,
  StockItem,
  RecipeItem,
  BankAccount,
  PettyCashFloat,
  DepartmentBudget,
  EmployeeRecord,
  PMSNightAuditData,
  AgentTask,
  ChartAccount,
  ChequeRecord,
  CorporateInvoice,
  CashierShiftDrop,
  StoreIssueVoucher,
} from '../../shared/types';
import { PROPERTIES } from '../../shared/constants/properties';
import { STANDARD_CHART_OF_ACCOUNTS } from '../../shared/constants/chartOfAccounts';
import { validateVoucherEntries } from '../../shared/utilities/financialEngine';
import { calculateWeightedAverageCost } from '../../shared/utilities/inventoryEngine';
import { calculateGosi, calculateSaudiEosb } from '../../shared/utilities/saudiLaborEngine';
import { Language } from '../../shared/utilities/i18n';

interface ERPContextType {
  // Global context
  currentPropertyId: PropertyId | 'ALL';
  setCurrentPropertyId: (id: PropertyId | 'ALL') => void;
  currentProperty: Property | null;
  properties: Property[];
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  fiscalPeriod: string;
  setFiscalPeriod: (period: string) => void;
  activeYear: number;
  setActiveYear: (year: number) => void;

  // Master Data
  accounts: ChartAccount[];
  vouchers: Voucher[];
  suppliers: Supplier[];
  vendorInvoices: VendorInvoice[];
  customerAccounts: CustomerAccount[];
  corporateInvoices: CorporateInvoice[];
  cashierDrops: CashierShiftDrop[];
  storeIssueVouchers: StoreIssueVoucher[];
  requisitions: PurchaseRequisition[];
  purchaseOrders: PurchaseOrder[];
  grns: GoodsReceiptNote[];
  stockItems: StockItem[];
  recipes: RecipeItem[];
  bankAccounts: BankAccount[];
  pettyCashFloats: PettyCashFloat[];
  budgets: DepartmentBudget[];
  employees: EmployeeRecord[];
  nightAuditBatches: PMSNightAuditData[];
  agentTasks: AgentTask[];
  cheques: ChequeRecord[];
  auditLogs: { timestamp: string; action: string; user: string; details: string }[];

  // Actions
  addVoucher: (voucher: Omit<Voucher, 'id' | 'isBalanced'>) => { success: boolean; error?: string; voucher?: Voucher };
  reverseVoucher: (voucherId: string, reason: string) => boolean;
  postNightAuditToGL: (auditId: string) => { success: boolean; voucherNumber?: string; error?: string };
  approveVendorInvoiceMatch: (invoiceId: string) => boolean;
  receiveGoodsToStore: (grnId: string) => boolean;
  receiveGoodsWithHACCP: (grnId: string, haccp: { vehicleTempC: number; expiryVerified: boolean; qualityInspection: 'PASSED' | 'CONDITIONAL' | 'REJECTED'; rejectionNotes?: string }) => { success: boolean; status: string };
  allocateCorporatePayment: (customerId: string, invoiceIds: string[], paymentAmountSAR: number, bankGlAccount: string, memo: string) => { success: boolean; voucherNumber?: string; error?: string };
  reconcileCashierShiftDrop: (dropId: string, actualCash: number, actualMada: number, actualCC: number) => { success: boolean; voucherNumber?: string; variance: number };
  issueStoreRequisition: (sivData: Omit<StoreIssueVoucher, 'id' | 'sivNumber' | 'status'>) => { success: boolean; sivNumber?: string; voucherNumber?: string };
  approveRequisition: (reqId: string) => boolean;
  approvePO: (poId: string) => boolean;
  addCheque: (cheque: Omit<ChequeRecord, 'id'>) => ChequeRecord;
  signCheque: (chequeId: string, role: 'FC' | 'GM') => boolean;
  issueCheque: (chequeId: string) => boolean;
  clearCheque: (chequeId: string) => boolean;
  addStockItem: (item: Omit<StockItem, 'id' | 'totalValuationSAR'>) => StockItem;
  updateBudget: (budgetId: string, newAllocatedAnnualSAR: number) => void;
  addEmployee: (emp: Omit<EmployeeRecord, 'id' | 'gosiEmployeeDeductionSAR' | 'gosiEmployerContributionSAR' | 'accumulatedEosbSAR'>) => EmployeeRecord;
  updateEmployeeSalary: (empId: string, basic: number, housing: number, transport: number) => void;
  exportDatabaseJSON: () => string;
  resetToDefaultData: () => void;
}

const ERPContext = createContext<ERPContextType | null>(null);

// Initial Agent Tasks
const INITIAL_AGENT_TASKS: AgentTask[] = [
  {
    id: 'TSK-001',
    agentId: 'AGENT-00',
    agentName: 'CTO / Master Orchestrator',
    moduleName: 'Executive Control Room',
    title: 'Establish Multi-Agent Orchestration & Governance Protocol',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    dependencies: [],
    deliverables: ['Work breakdown', 'Agent assignments', 'Task board'],
    testCoverage: '100% Architecture Compliance',
  },
  {
    id: 'TSK-002',
    agentId: 'AGENT-01',
    agentName: 'System Architect',
    moduleName: 'System Architecture',
    title: 'Unified Multi-Property Boundaries & Integration Standards',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    dependencies: ['TSK-001'],
    deliverables: ['System Diagram', 'API Standards', 'Security Model'],
    testCoverage: 'System Contracts Verified',
  },
  {
    id: 'TSK-003',
    agentId: 'AGENT-02',
    agentName: 'Database Architect',
    moduleName: 'Database Architecture',
    title: 'Financial ERD, USALI COA & Decimal Precision Specification',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    dependencies: ['TSK-002'],
    deliverables: ['Data dictionary', 'Shared schemas', 'Seed matrices'],
    testCoverage: 'Schema Constraints Verified',
  },
  {
    id: 'TSK-004',
    agentId: 'AGENT-03',
    agentName: 'Finance & GL Team',
    moduleName: 'General Ledger Core',
    title: 'Double-Entry Posting Engine & Trial Balance Calculation',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    dependencies: ['TSK-003'],
    deliverables: ['Journal Voucher Engine', 'Posting Service', 'Trial Balance'],
    testCoverage: '4/4 Unit Tests Passing',
  },
  {
    id: 'TSK-005',
    agentId: 'AGENT-04',
    agentName: 'AP & AR Subledger Team',
    moduleName: 'Accounts Payable & Receivable',
    title: 'Supplier Master, AP Aging & Guest/City Ledger Subledgers',
    priority: 'HIGH',
    status: 'COMPLETED',
    dependencies: ['TSK-004'],
    deliverables: ['Aging Engine', 'Corporate Ledgers', 'Payment Runs'],
    testCoverage: 'Subledger Reconciliation Passing',
  },
  {
    id: 'TSK-006',
    agentId: 'AGENT-05',
    agentName: 'Procurement Team',
    moduleName: 'Procurement & 3-Way Match',
    title: 'PO to GRN to Invoice 3-Way Matching Engine with Tolerances',
    priority: 'HIGH',
    status: 'COMPLETED',
    dependencies: ['TSK-004'],
    deliverables: ['PO Approval Flow', 'GRN Bay Inspection', '3-Way Matcher'],
    testCoverage: '3/3 Unit Tests Passing',
  },
  {
    id: 'TSK-007',
    agentId: 'AGENT-06',
    agentName: 'Inventory & Store Team',
    moduleName: 'Inventory & F&B Costing',
    title: 'Moving Weighted Average Valuation & Recipe Menu Costing Engine',
    priority: 'HIGH',
    status: 'COMPLETED',
    dependencies: ['TSK-006'],
    deliverables: ['Weighted Avg Engine', 'Recipe BOM Costing', 'Store Transfer'],
    testCoverage: '2/2 Unit Tests Passing',
  },
  {
    id: 'TSK-008',
    agentId: 'AGENT-07',
    agentName: 'Treasury & Banking Team',
    moduleName: 'Treasury & Cash Management',
    title: 'Bank Accounts, Auto-Reconciliation Feed & Petty Cash Custodians',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dependencies: ['TSK-004'],
    deliverables: ['Bank Statement Matcher', 'Cheque Register', 'Petty Cash Floats'],
    testCoverage: 'Bank Balance Reconciled',
  },
  {
    id: 'TSK-009',
    agentId: 'AGENT-08',
    agentName: 'Budget Management Team',
    moduleName: 'Departmental Budgets',
    title: 'Annual Budget Allocations, Commitments & Real-Time Variance',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dependencies: ['TSK-004'],
    deliverables: ['Variance Analytics', 'Budget Limits', 'USALI Grouping'],
    testCoverage: 'Variance Formula Verified',
  },
  {
    id: 'TSK-010',
    agentId: 'AGENT-09',
    agentName: 'HR & Payroll Team',
    moduleName: 'Saudi Labor & GOSI',
    title: 'Saudi Labor Law Compliance: GOSI (9.75%/11.75%) & Article 84 EOSB',
    priority: 'HIGH',
    status: 'COMPLETED',
    dependencies: ['TSK-004'],
    deliverables: ['GOSI Calculator', 'EOSB Gratuity Engine', 'Payroll Accrual JV'],
    testCoverage: '4/4 Unit Tests Passing',
  },
  {
    id: 'TSK-011',
    agentId: 'AGENT-10',
    agentName: 'Hotel Integrations Team',
    moduleName: 'PMS, POS & MoT Sync',
    title: 'Night Audit Staging Bridge (Opera/Cloudbeds) & MoT Telemetry',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    dependencies: ['TSK-004'],
    deliverables: ['Night Audit Bridge', 'GL Ingestion', 'MoT/ZATCA Staging'],
    testCoverage: 'Telemetry Sync Validated',
  },
  {
    id: 'TSK-012',
    agentId: 'AGENT-11',
    agentName: 'Reporting & BI Team',
    moduleName: 'Financial Reporting & BI',
    title: 'Daily Revenue Flash, Departmental P&L, Balance Sheet & RevPAR',
    priority: 'HIGH',
    status: 'COMPLETED',
    dependencies: ['TSK-004', 'TSK-011'],
    deliverables: ['Flash Report', 'USALI P&L', 'Balance Sheet', 'Hospitality KPIs'],
    testCoverage: 'Financial Reports Reconciled',
  },
  {
    id: 'TSK-013',
    agentId: 'AGENT-12',
    agentName: 'Frontend & UI Design Team',
    moduleName: 'Design System & Navigation',
    title: 'Bilingual RTL/LTR Hospitality Design System & Data Grids',
    priority: 'HIGH',
    status: 'COMPLETED',
    dependencies: ['TSK-002'],
    deliverables: ['Cairo RTL Fonts', 'Financial Tables', 'Voucher Modals'],
    testCoverage: 'Bilingual Visual Verification Passing',
  },
  {
    id: 'TSK-014',
    agentId: 'AGENT-13',
    agentName: 'QA & Testing Team',
    moduleName: 'Automated Test Suite',
    title: 'Zero-Defect Verification via node:test across all 14 Subsystems',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    dependencies: ['TSK-004', 'TSK-006', 'TSK-007', 'TSK-010'],
    deliverables: ['13/13 Pure Unit Tests Passing', 'Debit=Credit Enforcement'],
    testCoverage: '100% Pass Rate',
  },
  {
    id: 'TSK-015',
    agentId: 'AGENT-14',
    agentName: 'DevOps & Release Team',
    moduleName: 'DevOps & Audit Log',
    title: 'Audit Trails, Immutable Snapshots & Production Release Readiness',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dependencies: ['TSK-014'],
    deliverables: ['Audit Logger', 'JSON Backup Export', 'Health Monitoring'],
    testCoverage: 'Production Gate Approved',
  },
];

// Initial Vouchers
const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'VOUCH-001',
    voucherNumber: 'JV-2026-0038',
    propertyId: 'PROP-RUH-01',
    type: 'JOURNAL',
    date: '2026-11-01',
    fiscalPeriod: '2026-11',
    narration: 'Monthly Prepaid Insurance Amortization Allocation for Property',
    narrationAr: 'إطفاء قسط التأمين الشهري المدفوع مقدماً على الفندق',
    isBalanced: true,
    totalDebit: 18500,
    totalCredit: 18500,
    status: 'POSTED',
    postedBy: 'Ahmed Al-Shehri (Chief Accountant)',
    postedAt: '2026-11-01 09:15',
    entries: [
      {
        id: 'e1',
        accountCode: '6100',
        accountNameEn: 'Rooms Operating Expenses & Linen',
        accountNameAr: 'مصروفات تشغيل الغرف والبياضات',
        debit: 18500,
        credit: 0,
        costCenter: 'ROOMS',
        memo: 'Amortization share Nov 2026',
      },
      {
        id: 'e2',
        accountCode: '1230',
        accountNameEn: 'Prepaid Expenses & Insurance',
        accountNameAr: 'مصروفات مدفوعة مقدماً وتأمين',
        debit: 0,
        credit: 18500,
        costCenter: 'ADMIN',
        memo: 'Credit prepaid balance',
      },
    ],
  },
  {
    id: 'VOUCH-002',
    voucherNumber: 'BPV-2026-0089',
    propertyId: 'PROP-RUH-01',
    type: 'BANK_PAYMENT',
    date: '2026-11-03',
    fiscalPeriod: '2026-11',
    narration: 'Direct Wire Payment to Saudi Food Industries Co. (Invoice SA-9821)',
    narrationAr: 'حوالة بنكية لمورد الأغذية السعودي (فاتورة SA-9821)',
    isBalanced: true,
    totalDebit: 45000,
    totalCredit: 45000,
    status: 'POSTED',
    postedBy: 'Sultan Al-Otaibi (Finance Director)',
    postedAt: '2026-11-03 14:20',
    referenceDoc: 'INV-SA-9821',
    entries: [
      {
        id: 'e3',
        accountCode: '2110',
        accountNameEn: 'Accounts Payable - Trade Suppliers',
        accountNameAr: 'ذمم دائنة - الموردون التجاريون',
        debit: 45000,
        credit: 0,
        costCenter: 'FIN',
        memo: 'Payment settle AP balance',
      },
      {
        id: 'e4',
        accountCode: '1120',
        accountNameEn: 'Bank Current Account - Al Rajhi Bank',
        accountNameAr: 'حساب جاري - مصرف الراجحي',
        debit: 0,
        credit: 45000,
        costCenter: 'FIN',
        memo: 'Al Rajhi Wire Trans #TX83921',
      },
    ],
  },
  {
    id: 'VOUCH-003',
    voucherNumber: 'NA-2026-1107',
    propertyId: 'PROP-RUH-01',
    type: 'NIGHT_AUDIT',
    date: '2026-11-07',
    fiscalPeriod: '2026-11',
    narration: 'Daily Night Audit Revenue Journal — Opera Cloud PMS Interface (Nov 7)',
    narrationAr: 'قيد ترحيل إيرادات التدقيق الليلي اليومي لنظام أوبرا السحابي (7 نوفمبر)',
    isBalanced: true,
    totalDebit: 326750,
    totalCredit: 326750,
    status: 'POSTED',
    postedBy: 'Automated PMS Night Audit Interface',
    postedAt: '2026-11-08 04:30',
    referenceDoc: 'NA-OPERA-20261107',
    entries: [
      {
        id: 'na1',
        accountCode: '1130',
        accountNameEn: 'Guest Ledger (In-House Guests Receivable)',
        accountNameAr: 'حسابات نزلاء الفندق (دفتر النزلاء)',
        debit: 215000,
        credit: 0,
        costCenter: 'FO',
        memo: 'In-house guest folios billed',
      },
      {
        id: 'na2',
        accountCode: '1140',
        accountNameEn: 'City Ledger (Corporate & Travel Agents)',
        accountNameAr: 'حسابات الذمم المدينة والشركات',
        debit: 68750,
        credit: 0,
        costCenter: 'SALES',
        memo: 'Corporate direct billings',
      },
      {
        id: 'na3',
        accountCode: '1150',
        accountNameEn: 'Credit Card Receivables (Visa/Mastercard/Mada)',
        accountNameAr: 'مقبوضات بطاقات الائتمان ومدى تحت التحصيل',
        debit: 43000,
        credit: 0,
        costCenter: 'FIN',
        memo: 'Front office credit card settlements',
      },
      {
        id: 'na4',
        accountCode: '4100',
        accountNameEn: 'Rooms Revenue - Transient & Corporate',
        accountNameAr: 'إيرادات الغرف - الأفراد والشركات',
        debit: 0,
        credit: 218000,
        costCenter: 'ROOMS',
        memo: 'Room charges 268 occupied rooms',
      },
      {
        id: 'na5',
        accountCode: '4200',
        accountNameEn: 'Food & Beverage Revenue - Outlets & Banquets',
        accountNameAr: 'إيرادات الأغذية والمشروبات',
        debit: 0,
        credit: 58000,
        costCenter: 'FB',
        memo: 'Restaurant and in-room dining billing',
      },
      {
        id: 'na6',
        accountCode: '4300',
        accountNameEn: 'Minor Operated Departments (Laundry/Spa/Transport)',
        accountNameAr: 'إيرادات الأقسام المساندة (مغسلة ونادي صحي)',
        debit: 0,
        credit: 8140,
        costCenter: 'SPA',
        memo: 'Spa & laundry revenue',
      },
      {
        id: 'na7',
        accountCode: '2130',
        accountNameEn: 'Output VAT Payable (15% ZATCA)',
        accountNameAr: 'ضريبة القيمة المضافة المحصلة (15%)',
        debit: 0,
        credit: 42610,
        costCenter: 'TAX',
        memo: '15% VAT on daily revenue',
      },
    ],
  },
];

// Initial Suppliers
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    code: 'VEND-FOOD-01',
    nameEn: 'Saudi Food Industries & Catering Co.',
    nameAr: 'الشركة السعودية للصناعات الغذائية والإعاشة',
    vatNumber: '310928374600003',
    crNumber: '1010892746',
    contactPerson: 'Tariq Al-Zahrani',
    phone: '+966 11 482 9900',
    email: 'orders@saudifood.com.sa',
    paymentTermsDays: 30,
    creditLimitSAR: 500000,
    currentBalanceSAR: 128500,
    category: 'FOOD_BEVERAGE',
  },
  {
    id: 'SUP-002',
    code: 'VEND-LINEN-02',
    nameEn: 'Kingdom Luxury Textiles & Linen Mill',
    nameAr: 'مصنع المملكة للأقمشة الفاخرة والبياضات الفندقية',
    vatNumber: '310839201900003',
    crNumber: '1010394827',
    contactPerson: 'Majed Al-Mutairi',
    phone: '+966 11 294 8811',
    email: 'sales@kingdomlinen.sa',
    paymentTermsDays: 45,
    creditLimitSAR: 350000,
    currentBalanceSAR: 74200,
    category: 'LINEN_LAUNDRY',
  },
  {
    id: 'SUP-003',
    code: 'VEND-AMEN-03',
    nameEn: 'Arabian Oud & Luxury Hospitality Amenities Co.',
    nameAr: 'شركة العود العربي ومستلزمات الضيافة الفاخرة',
    vatNumber: '310748291000003',
    crNumber: '1010564738',
    contactPerson: 'Reem Al-Dossary',
    phone: '+966 11 512 4433',
    email: 'hospitality@arabianoudamenities.com',
    paymentTermsDays: 30,
    creditLimitSAR: 250000,
    currentBalanceSAR: 42100,
    category: 'GUEST_AMENITIES',
  },
];

// Initial Invoices
const INITIAL_INVOICES: VendorInvoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'INV-SA-9821',
    supplierId: 'SUP-001',
    supplierName: 'Saudi Food Industries & Catering Co.',
    propertyId: 'PROP-RUH-01',
    poNumber: 'PO-2026-0104',
    grnNumber: 'GRN-2026-0098',
    invoiceDate: '2026-10-25',
    dueDate: '2026-11-24',
    subtotalSAR: 60000,
    vatAmountSAR: 9000,
    totalAmountSAR: 69000,
    paidAmountSAR: 45000,
    status: 'PARTIALLY_PAID',
    threeWayMatchStatus: 'MATCHED',
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-KL-4402',
    supplierId: 'SUP-002',
    supplierName: 'Kingdom Luxury Textiles & Linen Mill',
    propertyId: 'PROP-RUH-01',
    poNumber: 'PO-2026-0112',
    grnNumber: 'GRN-2026-0105',
    invoiceDate: '2026-11-02',
    dueDate: '2026-12-17',
    subtotalSAR: 64521.74,
    vatAmountSAR: 9678.26,
    totalAmountSAR: 74200,
    paidAmountSAR: 0,
    status: 'MATCHED',
    threeWayMatchStatus: 'MATCHED',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-AO-1099',
    supplierId: 'SUP-003',
    supplierName: 'Arabian Oud & Luxury Hospitality Amenities Co.',
    propertyId: 'PROP-RUH-01',
    poNumber: 'PO-2026-0118',
    grnNumber: 'GRN-2026-0111',
    invoiceDate: '2026-11-05',
    dueDate: '2026-12-05',
    subtotalSAR: 36608.70,
    vatAmountSAR: 5491.30,
    totalAmountSAR: 42100,
    paidAmountSAR: 0,
    status: 'PENDING_MATCH',
    threeWayMatchStatus: 'MATCHED',
  },
];

// Initial Customer Accounts
const INITIAL_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'CUST-001',
    accountNumber: 'CL-ARAMCO-01',
    type: 'CORPORATE',
    nameEn: 'Saudi Aramco Headquarters - Executive Lodging',
    nameAr: 'أرامكو السعودية - إقامة الوفود التنفيذية',
    contactPerson: 'Fahad Al-Subaie',
    phone: '+966 13 874 0000',
    creditLimitSAR: 500000,
    currentBalanceSAR: 142500,
    status: 'ACTIVE',
  },
  {
    id: 'CUST-002',
    accountNumber: 'CL-MOT-02',
    type: 'GOVERNMENT',
    nameEn: 'Ministry of Tourism - VIP Hospitality Delegation',
    nameAr: 'وزارة السياحة - استضافة الوفود الرسمية',
    contactPerson: 'Bandar Al-Qahtani',
    phone: '+966 11 834 5000',
    creditLimitSAR: 750000,
    currentBalanceSAR: 218000,
    status: 'ACTIVE',
  },
  {
    id: 'CUST-003',
    accountNumber: 'CL-SAUDIA-03',
    type: 'AIRLINE',
    nameEn: 'Saudia Airlines - Flight Deck & Crew Accommodations',
    nameAr: 'الخطوط الجوية العربية السعودية - أطقم الطيران',
    contactPerson: 'Nasser Al-Ghamdi',
    phone: '+966 12 686 0000',
    creditLimitSAR: 400000,
    currentBalanceSAR: 95400,
    status: 'ACTIVE',
  },
];

// Initial Corporate Folio Invoices for City Ledger Direct Billing
const INITIAL_CORPORATE_INVOICES: CorporateInvoice[] = [
  {
    id: 'CORP-INV-001',
    invoiceNumber: 'CL-INV-2026-081',
    customerAccountId: 'CUST-001',
    customerName: 'Saudi Aramco Headquarters - Executive Lodging',
    folioNumber: 'FOL-88421',
    guestName: 'Eng. Khalid Al-Falih & Delegation',
    roomNumber: 'Suite 1402 (Presidential)',
    checkInDate: '2026-10-20',
    checkOutDate: '2026-10-25',
    amountSAR: 28500,
    paidAmountSAR: 0,
    balanceDueSAR: 28500,
    dueDate: '2026-11-25',
    status: 'UNPAID',
  },
  {
    id: 'CORP-INV-002',
    invoiceNumber: 'CL-INV-2026-082',
    customerAccountId: 'CUST-001',
    customerName: 'Saudi Aramco Headquarters - Executive Lodging',
    folioNumber: 'FOL-88439',
    guestName: 'Aramco Energy Strategy Workshop (10 Rooms)',
    roomNumber: 'Executive Floor (1201-1210)',
    checkInDate: '2026-10-24',
    checkOutDate: '2026-10-28',
    amountSAR: 64000,
    paidAmountSAR: 0,
    balanceDueSAR: 64000,
    dueDate: '2026-11-28',
    status: 'UNPAID',
  },
  {
    id: 'CORP-INV-003',
    invoiceNumber: 'CL-INV-2026-083',
    customerAccountId: 'CUST-001',
    customerName: 'Saudi Aramco Headquarters - Executive Lodging',
    folioNumber: 'FOL-88470',
    guestName: 'Board of Directors Banquet Dinner',
    roomNumber: 'Grand Al-Faisaliah Ballroom',
    checkInDate: '2026-10-29',
    checkOutDate: '2026-10-29',
    amountSAR: 50000,
    paidAmountSAR: 0,
    balanceDueSAR: 50000,
    dueDate: '2026-11-29',
    status: 'UNPAID',
  },
  {
    id: 'CORP-INV-004',
    invoiceNumber: 'CL-INV-2026-091',
    customerAccountId: 'CUST-002',
    customerName: 'Ministry of Tourism - VIP Hospitality Delegation',
    folioNumber: 'FOL-88510',
    guestName: 'UNWTO International Tourism Ministerial Delegation',
    roomNumber: 'Royal Suites (1501-1506)',
    checkInDate: '2026-10-26',
    checkOutDate: '2026-10-31',
    amountSAR: 120000,
    paidAmountSAR: 0,
    balanceDueSAR: 120000,
    dueDate: '2026-11-30',
    status: 'UNPAID',
  },
  {
    id: 'CORP-INV-005',
    invoiceNumber: 'CL-INV-2026-092',
    customerAccountId: 'CUST-002',
    customerName: 'Ministry of Tourism - VIP Hospitality Delegation',
    folioNumber: 'FOL-88522',
    guestName: 'National Tourism Platform Gala Event',
    roomNumber: 'Al-Oasis Palace Pavilion',
    checkInDate: '2026-10-30',
    checkOutDate: '2026-10-30',
    amountSAR: 98000,
    paidAmountSAR: 0,
    balanceDueSAR: 98000,
    dueDate: '2026-11-30',
    status: 'UNPAID',
  },
  {
    id: 'CORP-INV-006',
    invoiceNumber: 'CL-INV-2026-101',
    customerAccountId: 'CUST-003',
    customerName: 'Saudia Airlines - Flight Deck & Crew Accommodations',
    folioNumber: 'FOL-88535',
    guestName: 'Weekly Flight Deck Pilots & Cabin Crew Block (40 Nights)',
    roomNumber: 'Floor 6 Dedicated Crew Wing',
    checkInDate: '2026-10-22',
    checkOutDate: '2026-10-29',
    amountSAR: 55400,
    paidAmountSAR: 0,
    balanceDueSAR: 55400,
    dueDate: '2026-11-22',
    status: 'UNPAID',
  },
  {
    id: 'CORP-INV-007',
    invoiceNumber: 'CL-INV-2026-102',
    customerAccountId: 'CUST-003',
    customerName: 'Saudia Airlines - Flight Deck & Crew Accommodations',
    folioNumber: 'FOL-88540',
    guestName: 'Layover Flight Dispatch Crew (25 Nights)',
    roomNumber: 'Floor 7 Dedicated Crew Wing',
    checkInDate: '2026-10-29',
    checkOutDate: '2026-11-05',
    amountSAR: 40000,
    paidAmountSAR: 0,
    balanceDueSAR: 40000,
    dueDate: '2026-11-29',
    status: 'UNPAID',
  },
];

// Initial Front Office Cashier Shift Drops
const INITIAL_CASHIER_DROPS: CashierShiftDrop[] = [
  {
    id: 'DROP-001',
    propertyId: 'PROP-RUH-01',
    shiftCode: 'MORNING',
    cashierName: 'Reem Al-Otaibi',
    cashierNameAr: 'ريم العتيبي',
    terminalId: 'FO-TERM-01',
    dropDate: '2026-11-08',
    expectedCashSAR: 6400,
    actualCashSAR: 6400,
    expectedMadaSAR: 24500,
    actualMadaSAR: 24500,
    expectedCreditCardSAR: 18200,
    actualCreditCardSAR: 18200,
    varianceSAR: 0,
    status: 'RECONCILED',
    postedVoucherNumber: 'JV-DROP-20261108-A',
    dropEnvelopeNumber: 'ENV-2026-0891',
    witnessedBy: 'Bandar Al-Mutawa (Chief Cashier)',
  },
  {
    id: 'DROP-002',
    propertyId: 'PROP-RUH-01',
    shiftCode: 'EVENING',
    cashierName: 'Saud Al-Ghamdi',
    cashierNameAr: 'سعود الغامدي',
    terminalId: 'FO-TERM-02',
    dropDate: '2026-11-08',
    expectedCashSAR: 8200,
    actualCashSAR: 8150,
    expectedMadaSAR: 31400,
    actualMadaSAR: 31400,
    expectedCreditCardSAR: 22800,
    actualCreditCardSAR: 22800,
    varianceSAR: -50,
    status: 'PENDING_AUDIT',
    dropEnvelopeNumber: 'ENV-2026-0892',
    witnessedBy: 'Fahad Al-Zahrani (Night Auditor)',
  },
  {
    id: 'DROP-003',
    propertyId: 'PROP-RUH-01',
    shiftCode: 'NIGHT',
    cashierName: 'Fahad Al-Zahrani',
    cashierNameAr: 'فهد الزهراني',
    terminalId: 'FO-TERM-01',
    dropDate: '2026-11-08',
    expectedCashSAR: 3100,
    actualCashSAR: 3100,
    expectedMadaSAR: 14200,
    actualMadaSAR: 14200,
    expectedCreditCardSAR: 9800,
    actualCreditCardSAR: 9800,
    varianceSAR: 0,
    status: 'PENDING_AUDIT',
    dropEnvelopeNumber: 'ENV-2026-0893',
    witnessedBy: 'Sultan Al-Otaibi (Assistant Manager)',
  },
];

// Initial Store Issue Vouchers (SIV)
const INITIAL_STORE_ISSUES: StoreIssueVoucher[] = [
  {
    id: 'SIV-001',
    propertyId: 'PROP-RUH-01',
    sivNumber: 'SIV-2026-0041',
    date: '2026-11-08',
    requestingOutlet: 'Main Restaurant (Al Liwan)',
    costCenterCode: '403001001',
    issuedBy: 'Mubarak Al-Husseini (Storekeeper)',
    receivedByChef: 'Samir Al-Bishi (Executive Chef)',
    items: [
      { sku: 'SKU-BEEF-WAGYU', name: 'Premium Australian Wagyu Beef', quantity: 15, uom: 'kg', unitCostSAR: 195, totalCostSAR: 2925 },
      { sku: 'SKU-OUD-AMENITY', name: 'Royal Taif Rose & Amber Body Wash', quantity: 30, uom: 'bottle', unitCostSAR: 14.5, totalCostSAR: 435 },
    ],
    totalCostSAR: 3360,
    status: 'POSTED_TO_GL',
    postedVoucherNumber: 'JV-SIV-20261108-01',
  },
  {
    id: 'SIV-002',
    propertyId: 'PROP-RUH-01',
    sivNumber: 'SIV-2026-0042',
    date: '2026-11-08',
    requestingOutlet: 'In-Room Dining',
    costCenterCode: '403001002',
    issuedBy: 'Mubarak Al-Husseini (Storekeeper)',
    receivedByChef: 'Tariq Al-Hamad (Sous Chef)',
    items: [
      { sku: 'SKU-BEEF-WAGYU', name: 'Premium Australian Wagyu Beef', quantity: 8, uom: 'kg', unitCostSAR: 195, totalCostSAR: 1560 },
    ],
    totalCostSAR: 1560,
    status: 'APPROVED_COST_CONTROLLER',
  },
];

// Initial Purchase Orders & GRNs
const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'PO-001',
    poNumber: 'PO-2026-0112',
    propertyId: 'PROP-RUH-01',
    supplierId: 'SUP-002',
    supplierName: 'Kingdom Luxury Textiles & Linen Mill',
    date: '2026-10-28',
    deliveryDueDate: '2026-11-04',
    paymentTerms: '45 Days Net',
    status: 'FULFILLED',
    matchedInvoiceNumber: 'INV-KL-4402',
    items: [
      {
        sku: 'SKU-LINEN-KING',
        description: 'Egyptian Cotton 600-Thread Count King Bed Sheets',
        quantityOrdered: 300,
        quantityReceived: 300,
        unitPriceSAR: 145,
        vatRate: 0.15,
        lineTotalSAR: 43500,
      },
      {
        sku: 'SKU-TOWEL-BATH',
        description: 'Luxury Plush Turkish Cotton Bath Towels (800 GSM)',
        quantityOrdered: 500,
        quantityReceived: 500,
        unitPriceSAR: 42,
        vatRate: 0.15,
        lineTotalSAR: 21000,
      },
    ],
    subtotalSAR: 64500,
    vatTotalSAR: 9675,
    grandTotalSAR: 74175,
  },
  {
    id: 'PO-002',
    poNumber: 'PO-2026-0125',
    propertyId: 'PROP-RUH-01',
    supplierId: 'SUP-001',
    supplierName: 'Saudi Food Industries & Catering Co.',
    date: '2026-11-05',
    deliveryDueDate: '2026-11-10',
    paymentTerms: '30 Days Net',
    status: 'ISSUED',
    items: [
      {
        sku: 'SKU-BEEF-WAGYU',
        description: 'Australian Wagyu Ribeye Marbling Score 7-8 (Chilled)',
        quantityOrdered: 120,
        quantityReceived: 0,
        unitPriceSAR: 195,
        vatRate: 0.15,
        lineTotalSAR: 23400,
      },
      {
        sku: 'SKU-SALMON-NOR',
        description: 'Fresh Norwegian Whole Salmon (Superior Grade 5-6kg)',
        quantityOrdered: 80,
        quantityReceived: 0,
        unitPriceSAR: 88,
        vatRate: 0.15,
        lineTotalSAR: 7040,
      },
    ],
    subtotalSAR: 30440,
    vatTotalSAR: 4566,
    grandTotalSAR: 35006,
  },
];

const INITIAL_GRNS: GoodsReceiptNote[] = [
  {
    id: 'GRN-001',
    grnNumber: 'GRN-2026-0105',
    propertyId: 'PROP-RUH-01',
    poNumber: 'PO-2026-0112',
    supplierId: 'SUP-002',
    supplierName: 'Kingdom Luxury Textiles & Linen Mill',
    receivingDate: '2026-11-01',
    receivedBy: 'Khaled Al-Ghamdi (Receiving Bay Supervisor)',
    storeLocation: 'Housekeeping Floor Store (Level B1)',
    items: [
      {
        sku: 'SKU-LINEN-KING',
        description: 'Egyptian Cotton 600-Thread Count King Bed Sheets',
        quantityOrdered: 300,
        quantityReceived: 300,
        quantityAccepted: 300,
        quantityRejected: 0,
        unitPriceSAR: 145,
        totalSAR: 43500,
      },
      {
        sku: 'SKU-TOWEL-BATH',
        description: 'Luxury Plush Turkish Cotton Bath Towels (800 GSM)',
        quantityOrdered: 500,
        quantityReceived: 500,
        quantityAccepted: 500,
        quantityRejected: 0,
        unitPriceSAR: 42,
        totalSAR: 21000,
      },
    ],
    totalAcceptedValueSAR: 64500,
    status: 'POSTED_TO_INVENTORY',
  },
];

// Initial Stock Items
const INITIAL_STOCK_ITEMS: StockItem[] = [
  {
    id: 'STK-001',
    sku: 'SKU-BEEF-WAGYU',
    nameEn: 'Australian Wagyu Ribeye MB 7-8 (Chilled)',
    nameAr: 'لحم واغيو أسترالي فاخر ريب آي مبرد',
    category: 'F_AND_B',
    uom: 'kg',
    reorderLevel: 40,
    stores: [
      { storeName: 'Main Store', quantityOnHand: 65 },
      { storeName: 'F&B Kitchen Store', quantityOnHand: 25 },
    ],
    totalOnHand: 90,
    weightedAvgCostSAR: 195.0,
    lastPurchasePriceSAR: 195.0,
    totalValuationSAR: 17550.0,
  },
  {
    id: 'STK-002',
    sku: 'SKU-LINEN-KING',
    nameEn: 'King Bed Luxury Fitted Sheet 600TC',
    nameAr: 'ملاءة سرير ملكي فاخرة قطن مصري 600 خيط',
    category: 'HOUSEKEEPING',
    uom: 'piece',
    reorderLevel: 150,
    stores: [
      { storeName: 'Main Store', quantityOnHand: 450 },
      { storeName: 'Housekeeping Floor Store', quantityOnHand: 280 },
    ],
    totalOnHand: 730,
    weightedAvgCostSAR: 145.0,
    lastPurchasePriceSAR: 145.0,
    totalValuationSAR: 105850.0,
  },
  {
    id: 'STK-003',
    sku: 'SKU-OUD-AMENITY',
    nameEn: 'Royal Taif Rose & Amber Body Wash 60ml',
    nameAr: 'غسول الجسم الفاخر بدهن الورد الطائفي والعنبر 60 مل',
    category: 'GUEST_SUPPLIES',
    uom: 'bottle',
    reorderLevel: 800,
    stores: [
      { storeName: 'Main Store', quantityOnHand: 1800 },
      { storeName: 'Housekeeping Floor Store', quantityOnHand: 650 },
    ],
    totalOnHand: 2450,
    weightedAvgCostSAR: 14.5,
    lastPurchasePriceSAR: 14.5,
    totalValuationSAR: 35525.0,
  },
];

// Initial F&B Recipes
const INITIAL_RECIPES: RecipeItem[] = [
  {
    id: 'REC-001',
    recipeCode: 'DISH-WAGYU-BURGER',
    menuNameEn: 'Al Faisaliah Truffle Wagyu Burger',
    menuNameAr: 'برغر الواغيو الفاخر بالكمأة والبريوش الذهبي',
    outlet: 'Main Restaurant (Al Liwan)',
    portionYield: 1,
    sellingPriceSAR: 135.0,
    ingredients: [
      { itemSku: 'SKU-BEEF-WAGYU', itemName: 'Wagyu Mince (220g)', portionQty: 0.22, uom: 'kg', unitCostSAR: 195.0, lineCostSAR: 42.9 },
      { itemSku: 'SKU-BRIOCHE', itemName: 'Artisan Brioche Bun', portionQty: 1, uom: 'piece', unitCostSAR: 4.5, lineCostSAR: 4.5 },
      { itemSku: 'SKU-TRUFFLE-MAYO', itemName: 'Black Truffle Emulsion', portionQty: 0.03, uom: 'kg', unitCostSAR: 120.0, lineCostSAR: 3.6 },
    ],
    totalCostPerPortionSAR: 51.0,
    targetFoodCostPercentage: 35.0,
    actualFoodCostPercentage: 37.8,
    grossMarginSAR: 84.0,
    status: 'ACCEPTABLE',
  },
  {
    id: 'REC-002',
    recipeCode: 'DISH-KABSA-ROYAL',
    menuNameEn: 'Royal Saudi Najdi Lamb Kabsa',
    menuNameAr: 'كبسة اللحم النجدية الملكية بالمكسرات والزعفران',
    outlet: 'Main Restaurant (Al Liwan)',
    portionYield: 1,
    sellingPriceSAR: 165.0,
    ingredients: [
      { itemSku: 'SKU-LAMB-NAJDI', itemName: 'Fresh Local Najdi Lamb Shank', portionQty: 0.45, uom: 'kg', unitCostSAR: 85.0, lineCostSAR: 38.25 },
      { itemSku: 'SKU-RICE-BASMATI', itemName: 'Aged Long Grain Basmati Rice', portionQty: 0.15, uom: 'kg', unitCostSAR: 12.0, lineCostSAR: 1.8 },
      { itemSku: 'SKU-SAFFRON-SPICE', itemName: 'Pure Saffron & Kabsa Aromatics', portionQty: 0.01, uom: 'pack', unitCostSAR: 25.0, lineCostSAR: 4.5 },
    ],
    totalCostPerPortionSAR: 44.55,
    targetFoodCostPercentage: 30.0,
    actualFoodCostPercentage: 27.0,
    grossMarginSAR: 120.45,
    status: 'OPTIMAL',
  },
];

// Initial Bank Accounts
const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'BANK-01',
    bankName: 'Al Rajhi Bank',
    accountTitle: 'Riyada Hospitality Al Faisaliah Operating Account',
    accountNumber: '839201948271001',
    iban: 'SA4480000839201948271001',
    currency: 'SAR',
    glAccountCode: '1120',
    currentBookBalanceSAR: 4850320.5,
    unreconciledBankBalanceSAR: 4850320.5,
  },
  {
    id: 'BANK-02',
    bankName: 'Saudi National Bank (SNB)',
    accountTitle: 'Riyada Hospitality Payroll & Capital Expenditure Account',
    accountNumber: '109283746109002',
    iban: 'SA1210000109283746109002',
    currency: 'SAR',
    glAccountCode: '1121',
    currentBookBalanceSAR: 2984150.0,
    unreconciledBankBalanceSAR: 2984150.0,
  },
];

// Initial Petty Cash
const INITIAL_PETTY_CASH: PettyCashFloat[] = [
  {
    id: 'PC-01',
    custodianName: 'Bandar Al-Mutawa (Front Office Cashier)',
    propertyId: 'PROP-RUH-01',
    department: 'Front Office',
    authorizedLimitSAR: 15000,
    currentCashSAR: 11420,
    pendingVouchersSAR: 3580,
    glAccountCode: '1110',
    status: 'ACTIVE',
  },
  {
    id: 'PC-02',
    custodianName: 'Samir Al-Bishi (Executive Chef)',
    propertyId: 'PROP-RUH-01',
    department: 'Food & Beverage Kitchen',
    authorizedLimitSAR: 10000,
    currentCashSAR: 4200,
    pendingVouchersSAR: 5800,
    glAccountCode: '1110',
    status: 'REPLENISHMENT_REQUESTED',
  },
];

// Initial Budgets
const INITIAL_BUDGETS: DepartmentBudget[] = [
  {
    id: 'BDG-01',
    propertyId: 'PROP-RUH-01',
    fiscalYear: 2026,
    department: 'Rooms',
    allocatedAnnualSAR: 4800000,
    allocatedYtdSAR: 4400000,
    actualYtdSAR: 3950000,
    committedSAR: 120000,
    varianceSAR: 450000, // favorable
    variancePercentage: 10.2,
    isOverBudget: false,
  },
  {
    id: 'BDG-02',
    propertyId: 'PROP-RUH-01',
    fiscalYear: 2026,
    department: 'Food & Beverage',
    allocatedAnnualSAR: 5500000,
    allocatedYtdSAR: 5040000,
    actualYtdSAR: 5180000,
    committedSAR: 210000,
    varianceSAR: -140000, // unfavorable
    variancePercentage: -2.8,
    isOverBudget: true,
  },
  {
    id: 'BDG-03',
    propertyId: 'PROP-RUH-01',
    fiscalYear: 2026,
    department: 'Property Operations & Maintenance',
    allocatedAnnualSAR: 2200000,
    allocatedYtdSAR: 2010000,
    actualYtdSAR: 1980000,
    committedSAR: 95000,
    varianceSAR: 30000,
    variancePercentage: 1.5,
    isOverBudget: false,
  },
  {
    id: 'BDG-04',
    propertyId: 'PROP-RUH-01',
    fiscalYear: 2026,
    department: 'Administration & General',
    allocatedAnnualSAR: 3100000,
    allocatedYtdSAR: 2840000,
    actualYtdSAR: 2790000,
    committedSAR: 40000,
    varianceSAR: 50000,
    variancePercentage: 1.8,
    isOverBudget: false,
  },
];

// Initial Employees
const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'EMP-001',
    employeeNumber: 'HR-1001',
    nameEn: 'Sultan Mohammed Al-Otaibi',
    nameAr: 'سلطان محمد العتيبي',
    nationality: 'SAUDI',
    nationalIdOrIqama: '1092837461',
    propertyId: 'PROP-RUH-01',
    department: 'Executive Office',
    jobTitleEn: 'General Manager',
    jobTitleAr: 'المدير العام',
    joinDate: '2020-03-01',
    basicSalarySAR: 32000,
    housingAllowanceSAR: 8000,
    transportAllowanceSAR: 2500,
    otherAllowancesSAR: 0,
    totalGrossSalarySAR: 42500,
    gosiEmployeeDeductionSAR: 3900.0, // (32000+8000)*0.0975
    gosiEmployerContributionSAR: 4700.0, // (32000+8000)*0.1175
    accumulatedEosbSAR: 148750.0, // 6.6 yrs -> 5*0.5 + 1.6*1 = 4.1 months
    activeAdvancesSAR: 0,
  },
  {
    id: 'EMP-002',
    employeeNumber: 'HR-1014',
    nameEn: 'Hanan Abdullah Al-Ghamdi',
    nameAr: 'حنان عبدالله الغامدي',
    nationality: 'SAUDI',
    nationalIdOrIqama: '1083920194',
    propertyId: 'PROP-RUH-01',
    department: 'Finance & Accounting',
    jobTitleEn: 'Financial Controller',
    jobTitleAr: 'المراقب المالي العام',
    joinDate: '2022-06-15',
    basicSalarySAR: 22000,
    housingAllowanceSAR: 5500,
    transportAllowanceSAR: 1500,
    otherAllowancesSAR: 0,
    totalGrossSalarySAR: 29000,
    gosiEmployeeDeductionSAR: 2681.25, // 27500*0.0975
    gosiEmployerContributionSAR: 3231.25, // 27500*0.1175
    accumulatedEosbSAR: 63800.0,
    activeAdvancesSAR: 0,
  },
  {
    id: 'EMP-003',
    employeeNumber: 'HR-1038',
    nameEn: 'Marco Rossi',
    nameAr: 'ماركو روسي',
    nationality: 'NON_SAUDI',
    nationalIdOrIqama: '2394857610',
    propertyId: 'PROP-RUH-01',
    department: 'Food & Beverage Kitchen',
    jobTitleEn: 'Executive Chef',
    jobTitleAr: 'رئيس الطهاة التنفيذي',
    joinDate: '2023-01-10',
    basicSalarySAR: 24000,
    housingAllowanceSAR: 6000,
    transportAllowanceSAR: 2000,
    otherAllowancesSAR: 0,
    totalGrossSalarySAR: 32000,
    gosiEmployeeDeductionSAR: 0.0, // 0 for expat
    gosiEmployerContributionSAR: 600.0, // 30000*0.02
    accumulatedEosbSAR: 61333.0,
    activeAdvancesSAR: 5000,
  },
];

// Initial PMS Night Audit Batches
const INITIAL_PMS_AUDIT_BATCHES: PMSNightAuditData[] = [
  {
    id: 'PMS-AUDIT-20261107',
    auditDate: '2026-11-07',
    propertyId: 'PROP-RUH-01',
    pmsSystem: 'Opera Cloud',
    totalRooms: 320,
    occupiedRooms: 268,
    occupancyPercentage: 83.75,
    roomRevenueSAR: 218000.0,
    adrSAR: 813.43,
    revParSAR: 681.25,
    fbRevenueSAR: 58000.0,
    otherRevenueSAR: 8140.0,
    vatCollectedSAR: 42610.0,
    municipalityTaxSAR: 7100.0,
    totalDailyRevenueSAR: 326750.0,
    guestLedgerDebitBalanceSAR: 215000.0,
    cityLedgerTransfersSAR: 68750.0,
    creditCardSettlementsSAR: 43000.0,
    cashReceivedSAR: 0.0,
    isPostedToGL: true,
    postedVoucherNumber: 'NA-2026-1107',
    motSyncStatus: 'SYNCED_WITH_MINISTRY_OF_TOURISM',
  },
  {
    id: 'PMS-AUDIT-20261108',
    auditDate: '2026-11-08',
    propertyId: 'PROP-RUH-01',
    pmsSystem: 'Opera Cloud',
    totalRooms: 320,
    occupiedRooms: 284,
    occupancyPercentage: 88.75,
    roomRevenueSAR: 242000.0,
    adrSAR: 852.11,
    revParSAR: 756.25,
    fbRevenueSAR: 64200.0,
    otherRevenueSAR: 9800.0,
    vatCollectedSAR: 47400.0,
    municipalityTaxSAR: 7900.0,
    totalDailyRevenueSAR: 363400.0,
    guestLedgerDebitBalanceSAR: 245000.0,
    cityLedgerTransfersSAR: 72400.0,
    creditCardSettlementsSAR: 46000.0,
    cashReceivedSAR: 0.0,
    isPostedToGL: false,
    motSyncStatus: 'PENDING',
  },
];

// Initial Master Cheque Register
const INITIAL_CHEQUES: ChequeRecord[] = [
  {
    id: 'CHQ-001',
    propertyId: 'PROP-RUH-01',
    chequeNumber: 'CHQ-883901',
    bankName: 'Al Rajhi Bank',
    glAccountCode: '102001004',
    beneficiary: 'Almarai Food Company',
    beneficiaryAr: 'شركة المراعي للأغذية',
    amount: 48250.0,
    issueDate: '2026-11-01',
    dueDate: '2026-11-05',
    status: 'ISSUED_AND_CLEARED',
    voucherRef: 'BP-2026-001',
    notes: 'Payment for Dairy & Fresh Provision order PO-2026-001',
    preparedBy: 'Hanan Al-Ghamdi (FC)',
    approvedByFC: 'Hanan Abdullah Al-Ghamdi',
    approvedByGM: 'Sultan Mohammed Al-Otaibi',
    clearedAt: '2026-11-05 14:20',
  },
  {
    id: 'CHQ-002',
    propertyId: 'PROP-RUH-01',
    chequeNumber: 'CHQ-104921',
    bankName: 'Saudi National Bank (SNB)',
    glAccountCode: '102001001',
    beneficiary: 'Saudi Electricity Company (SEC)',
    beneficiaryAr: 'الشركة السعودية للكهرباء',
    amount: 32800.0,
    issueDate: '2026-11-04',
    dueDate: '2026-11-10',
    status: 'READY_TO_ISSUE',
    voucherRef: 'BP-2026-002',
    notes: 'Hotel energy consumption invoice settlement',
    preparedBy: 'Hanan Al-Ghamdi (FC)',
    approvedByFC: 'Hanan Abdullah Al-Ghamdi',
    approvedByGM: 'Sultan Mohammed Al-Otaibi',
  },
  {
    id: 'CHQ-003',
    propertyId: 'PROP-RUH-01',
    chequeNumber: 'CHQ-883902',
    bankName: 'Al Rajhi Bank',
    glAccountCode: '102001004',
    beneficiary: 'Binzagr Distribution Ltd',
    beneficiaryAr: 'شركة بن زقر للتوزيع المحدودة',
    amount: 24150.0,
    issueDate: '2026-11-06',
    dueDate: '2026-11-15',
    status: 'WAITING_FOR_APPROVAL',
    voucherRef: 'BP-2026-003',
    notes: 'Beverage and dry store quarterly stock shipment',
    preparedBy: 'Accounts Payable Specialist',
    approvedByFC: 'Hanan Abdullah Al-Ghamdi',
  },
  {
    id: 'CHQ-004',
    propertyId: 'PROP-RUH-01',
    chequeNumber: 'CHQ-883903',
    bankName: 'Al Rajhi Bank',
    glAccountCode: '102001004',
    beneficiary: 'Saudi Telecom Company (stc)',
    beneficiaryAr: 'شركة الاتصالات السعودية (stc)',
    amount: 8400.0,
    issueDate: '2026-11-07',
    dueDate: '2026-11-20',
    status: 'WAITING_FOR_CHECKS',
    voucherRef: 'BP-2026-004',
    notes: 'Fiber optics dedicated guest internet line',
    preparedBy: 'Accounts Payable Specialist',
  },
];

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPropertyId, setCurrentPropertyId] = useState<PropertyId | 'ALL'>('PROP-RUH-01');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fiscalPeriod, setFiscalPeriod] = useState<string>('2026-11');
  const [activeYear, setActiveYear] = useState<number>(2026);

  const [properties] = useState<Property[]>(PROPERTIES);
  const [accounts] = useState<ChartAccount[]>(STANDARD_CHART_OF_ACCOUNTS);
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('riyada_vouchers');
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>(() => {
    const saved = localStorage.getItem('riyada_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>(INITIAL_CUSTOMERS);
  const [corporateInvoices, setCorporateInvoices] = useState<CorporateInvoice[]>(() => {
    const saved = localStorage.getItem('riyada_corp_invoices');
    return saved ? JSON.parse(saved) : INITIAL_CORPORATE_INVOICES;
  });
  const [cashierDrops, setCashierDrops] = useState<CashierShiftDrop[]>(() => {
    const saved = localStorage.getItem('riyada_cashier_drops');
    return saved ? JSON.parse(saved) : INITIAL_CASHIER_DROPS;
  });
  const [storeIssueVouchers, setStoreIssueVouchers] = useState<StoreIssueVoucher[]>(() => {
    const saved = localStorage.getItem('riyada_store_issues');
    return saved ? JSON.parse(saved) : INITIAL_STORE_ISSUES;
  });
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [grns, setGrns] = useState<GoodsReceiptNote[]>(INITIAL_GRNS);
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('riyada_stock');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });
  const [recipes] = useState<RecipeItem[]>(INITIAL_RECIPES);
  const [bankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [pettyCashFloats] = useState<PettyCashFloat[]>(INITIAL_PETTY_CASH);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>(() => {
    const saved = localStorage.getItem('riyada_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });
  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => {
    const saved = localStorage.getItem('riyada_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  const [nightAuditBatches, setNightAuditBatches] = useState<PMSNightAuditData[]>(() => {
    const saved = localStorage.getItem('riyada_night_audit');
    return saved ? JSON.parse(saved) : INITIAL_PMS_AUDIT_BATCHES;
  });
  const [cheques, setCheques] = useState<ChequeRecord[]>(() => {
    const saved = localStorage.getItem('riyada_cheques');
    return saved ? JSON.parse(saved) : INITIAL_CHEQUES;
  });
  const [agentTasks] = useState<AgentTask[]>(INITIAL_AGENT_TASKS);

  useEffect(() => {
    localStorage.setItem('riyada_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('riyada_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('riyada_cheques', JSON.stringify(cheques));
  }, [cheques]);

  useEffect(() => {
    localStorage.setItem('riyada_corp_invoices', JSON.stringify(corporateInvoices));
  }, [corporateInvoices]);

  useEffect(() => {
    localStorage.setItem('riyada_cashier_drops', JSON.stringify(cashierDrops));
  }, [cashierDrops]);

  useEffect(() => {
    localStorage.setItem('riyada_store_issues', JSON.stringify(storeIssueVouchers));
  }, [storeIssueVouchers]);
  const [auditLogs, setAuditLogs] = useState<{ timestamp: string; action: string; user: string; details: string }[]>([
    {
      timestamp: '2026-11-08 12:00:00',
      action: 'SYSTEM_BOOT',
      user: 'Agent 00 (CTO)',
      details: 'All 14 specialist ERP modules initialized with full multi-property data isolation.',
    },
    {
      timestamp: '2026-11-08 12:15:30',
      action: 'QA_VERIFY',
      user: 'Agent 13 (QA)',
      details: 'Automated test suite executed: 13/13 tests passed, double-entry integrity confirmed.',
    },
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('riyada_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('riyada_invoices', JSON.stringify(vendorInvoices));
  }, [vendorInvoices]);

  useEffect(() => {
    localStorage.setItem('riyada_stock', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('riyada_night_audit', JSON.stringify(nightAuditBatches));
  }, [nightAuditBatches]);

  // Update HTML dir and lang
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const currentProperty = properties.find((p) => p.id === currentPropertyId) || null;

  // Add Voucher with Double Entry Verification
  const addVoucher = (voucherData: Omit<Voucher, 'id' | 'isBalanced'>) => {
    const validation = validateVoucherEntries(voucherData.entries);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(' | '),
      };
    }

    const newVoucher: Voucher = {
      ...voucherData,
      id: `VOUCH-${Date.now().toString().slice(-6)}`,
      isBalanced: true,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      postedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setVouchers((prev) => [newVoucher, ...prev]);

    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'VOUCHER_POST',
        user: voucherData.postedBy || 'Finance User',
        details: `Voucher ${newVoucher.voucherNumber} (${newVoucher.type}) posted. Balanced total: ${newVoucher.totalDebit} SAR.`,
      },
      ...prev,
    ]);

    return {
      success: true,
      voucher: newVoucher,
    };
  };

  // Reverse Voucher (reversals are standard in enterprise accounting, never delete)
  const reverseVoucher = (voucherId: string, reason: string) => {
    const target = vouchers.find((v) => v.id === voucherId);
    if (!target || target.status === 'REVERSED') return false;

    // Create opposing entry
    const reversalEntries = target.entries.map((e) => ({
      ...e,
      id: `${e.id}-rev`,
      debit: e.credit,
      credit: e.debit,
      memo: `Reversal: ${reason}`,
    }));

    const revVoucher: Voucher = {
      id: `VOUCH-REV-${Date.now().toString().slice(-6)}`,
      voucherNumber: `REV-${target.voucherNumber}`,
      propertyId: target.propertyId,
      type: target.type,
      date: new Date().toISOString().slice(0, 10),
      fiscalPeriod,
      narration: `Reversal of ${target.voucherNumber}: ${reason}`,
      narrationAr: `قيد عكسي لسند ${target.voucherNumber}: ${reason}`,
      entries: reversalEntries,
      totalDebit: target.totalCredit,
      totalCredit: target.totalDebit,
      status: 'POSTED',
      postedBy: 'System Controller Reversal',
      postedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isBalanced: true,
    };

    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, status: 'REVERSED' as const } : v)).concat(revVoucher)
    );

    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'VOUCHER_REVERSAL',
        user: 'Financial Controller',
        details: `Voucher ${target.voucherNumber} reversed with counter-voucher ${revVoucher.voucherNumber}. Reason: ${reason}`,
      },
      ...prev,
    ]);

    return true;
  };

  // Post Night Audit to GL
  const postNightAuditToGL = (auditId: string) => {
    const audit = nightAuditBatches.find((b) => b.id === auditId);
    if (!audit) return { success: false, error: 'Audit batch not found' };
    if (audit.isPostedToGL) return { success: false, error: 'Audit batch already posted to General Ledger' };

    const voucherNum = `NA-${audit.auditDate.replace(/-/g, '')}`;

    const entries = [
      {
        id: 'na-1',
        accountCode: '1130',
        accountNameEn: 'Guest Ledger (In-House Guests Receivable)',
        accountNameAr: 'حسابات نزلاء الفندق (دفتر النزلاء)',
        debit: audit.guestLedgerDebitBalanceSAR,
        credit: 0,
        costCenter: 'FO',
        memo: `Guest folio daily room & incidentals (${audit.auditDate})`,
      },
      {
        id: 'na-2',
        accountCode: '1140',
        accountNameEn: 'City Ledger (Corporate & Travel Agents)',
        accountNameAr: 'حسابات الذمم المدينة والشركات',
        debit: audit.cityLedgerTransfersSAR,
        credit: 0,
        costCenter: 'SALES',
        memo: `Corporate transfers (${audit.auditDate})`,
      },
      {
        id: 'na-3',
        accountCode: '1150',
        accountNameEn: 'Credit Card Receivables (Visa/Mastercard/Mada)',
        accountNameAr: 'مقبوضات بطاقات الائتمان ومدى تحت التحصيل',
        debit: audit.creditCardSettlementsSAR,
        credit: 0,
        costCenter: 'FIN',
        memo: `Settlements (${audit.auditDate})`,
      },
      {
        id: 'na-4',
        accountCode: '4100',
        accountNameEn: 'Rooms Revenue - Transient & Corporate',
        accountNameAr: 'إيرادات الغرف - الأفراد والشركات',
        debit: 0,
        credit: audit.roomRevenueSAR,
        costCenter: 'ROOMS',
        memo: `${audit.occupiedRooms} rooms revenue (ADR: ${audit.adrSAR} SAR)`,
      },
      {
        id: 'na-5',
        accountCode: '4200',
        accountNameEn: 'Food & Beverage Revenue - Outlets & Banquets',
        accountNameAr: 'إيرادات الأغذية والمشروبات',
        debit: 0,
        credit: audit.fbRevenueSAR,
        costCenter: 'FB',
        memo: `Daily restaurant and banquet sales`,
      },
      {
        id: 'na-6',
        accountCode: '4300',
        accountNameEn: 'Minor Operated Departments (Laundry/Spa/Transport)',
        accountNameAr: 'إيرادات الأقسام المساندة',
        debit: 0,
        credit: audit.otherRevenueSAR,
        costCenter: 'SPA',
        memo: `Spa & miscellaneous services`,
      },
      {
        id: 'na-7',
        accountCode: '2130',
        accountNameEn: 'Output VAT Payable (15% ZATCA)',
        accountNameAr: 'ضريبة القيمة المضافة المحصلة (15%)',
        debit: 0,
        credit: audit.vatCollectedSAR,
        costCenter: 'TAX',
        memo: `15% VAT component`,
      },
    ];

    const postResult = addVoucher({
      voucherNumber: voucherNum,
      propertyId: audit.propertyId,
      type: 'NIGHT_AUDIT',
      date: audit.auditDate,
      fiscalPeriod,
      narration: `PMS Night Audit Revenue Journal for ${audit.auditDate} (${audit.pmsSystem})`,
      narrationAr: `قيد إيرادات التدقيق الليلي لتاريخ ${audit.auditDate} (${audit.pmsSystem})`,
      entries,
      totalDebit: audit.totalDailyRevenueSAR,
      totalCredit: audit.totalDailyRevenueSAR,
      status: 'POSTED',
      postedBy: 'PMS Automated Interface',
      referenceDoc: audit.id,
    });

    if (!postResult.success) {
      return { success: false, error: postResult.error };
    }

    setNightAuditBatches((prev) =>
      prev.map((b) =>
        b.id === auditId
          ? {
              ...b,
              isPostedToGL: true,
              postedVoucherNumber: voucherNum,
              motSyncStatus: 'SYNCED_WITH_MINISTRY_OF_TOURISM' as const,
            }
          : b
      )
    );

    return { success: true, voucherNumber: voucherNum };
  };

  // Approve Vendor Invoice 3-Way Match
  const approveVendorInvoiceMatch = (invoiceId: string) => {
    setVendorInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'MATCHED' as const,
              threeWayMatchStatus: 'MATCHED' as const,
            }
          : inv
      )
    );
    return true;
  };

  // Receive Goods to Store & Update Moving Weighted Average
  const receiveGoodsToStore = (grnId: string) => {
    const targetGrn = grns.find((g) => g.id === grnId);
    if (!targetGrn) return false;

    setStockItems((prev) =>
      prev.map((item) => {
        const grnLine = targetGrn.items.find((i) => i.sku === item.sku);
        if (!grnLine) return item;

        const updated = calculateWeightedAverageCost({
          currentQuantity: item.totalOnHand,
          currentAvgCostSAR: item.weightedAvgCostSAR,
          receivedQuantity: grnLine.quantityAccepted,
          receivedUnitPriceSAR: grnLine.unitPriceSAR,
        });

        return {
          ...item,
          totalOnHand: updated.newQuantity,
          weightedAvgCostSAR: updated.newAvgCostSAR,
          lastPurchasePriceSAR: grnLine.unitPriceSAR,
          totalValuationSAR: updated.newTotalValuationSAR,
        };
      })
    );

    return true;
  };

  // Cheque Management Actions
  const addCheque = (chequeData: Omit<ChequeRecord, 'id'>) => {
    const newCheque: ChequeRecord = {
      ...chequeData,
      id: `CHQ-${Date.now().toString().slice(-6)}`,
    };
    setCheques((prev) => [newCheque, ...prev]);
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'CHEQUE_DRAFT',
        user: chequeData.preparedBy || 'Accounts Payable',
        details: `Cheque ${newCheque.chequeNumber} for ${newCheque.beneficiary} (${newCheque.amount} SAR) drafted.`,
      },
      ...prev,
    ]);
    return newCheque;
  };

  const signCheque = (chequeId: string, role: 'FC' | 'GM') => {
    setCheques((prev) =>
      prev.map((c) => {
        if (c.id !== chequeId) return c;
        const approvedByFC = role === 'FC' ? 'Hanan Abdullah Al-Ghamdi (FC)' : c.approvedByFC;
        const approvedByGM = role === 'GM' ? 'Sultan Mohammed Al-Otaibi (GM)' : c.approvedByGM;
        const isFullyApproved = Boolean(
          (role === 'FC' && c.approvedByGM) || (role === 'GM' && c.approvedByFC)
        );
        return {
          ...c,
          approvedByFC,
          approvedByGM,
          status: isFullyApproved ? ('READY_TO_ISSUE' as const) : ('WAITING_FOR_APPROVAL' as const),
        };
      })
    );
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'CHEQUE_SIGNATURE',
        user: role === 'FC' ? 'Financial Controller' : 'General Manager',
        details: `Cheque ${chequeId} signed by ${role}.`,
      },
      ...prev,
    ]);
    return true;
  };

  const issueCheque = (chequeId: string) => {
    setCheques((prev) =>
      prev.map((c) => (c.id === chequeId ? { ...c, status: 'READY_TO_ISSUE' as const } : c))
    );
    return true;
  };

  const clearCheque = (chequeId: string) => {
    setCheques((prev) =>
      prev.map((c) =>
        c.id === chequeId
          ? {
              ...c,
              status: 'ISSUED_AND_CLEARED' as const,
              clearedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : c
      )
    );
    return true;
  };

  // HACCP Food Safety Bay Inspection
  const receiveGoodsWithHACCP = (
    grnId: string,
    haccp: { vehicleTempC: number; expiryVerified: boolean; qualityInspection: 'PASSED' | 'CONDITIONAL' | 'REJECTED'; rejectionNotes?: string }
  ) => {
    if (haccp.qualityInspection === 'REJECTED') {
      setGrns((prev) =>
        prev.map((g) => (g.id === grnId ? { ...g, status: 'ACCEPTED_WITH_DISCREPANCY' as const } : g))
      );
      setAuditLogs((prev) => [
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          action: 'HACCP_REJECTION',
          user: 'Receiving Dock Hygiene Inspector',
          details: `GRN ${grnId} rejected due to temperature/quality violation: ${haccp.rejectionNotes || 'Over temperature spec'}.`,
        },
        ...prev,
      ]);
      return { success: true, status: 'REJECTED_HACCP' };
    }

    receiveGoodsToStore(grnId);
    setGrns((prev) =>
      prev.map((g) => (g.id === grnId ? { ...g, status: 'POSTED_TO_INVENTORY' as const } : g))
    );
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'HACCP_PASSED',
        user: 'Receiving Dock Hygiene Inspector',
        details: `GRN ${grnId} cleared HACCP cold-chain verification (${haccp.vehicleTempC}°C) and posted to store.`,
      },
      ...prev,
    ]);
    return { success: true, status: 'ACCEPTED_AND_POSTED' };
  };

  // City Ledger Corporate Direct Payment & Folio Allocation
  const allocateCorporatePayment = (
    customerId: string,
    invoiceIds: string[],
    paymentAmountSAR: number,
    bankGlAccount: string,
    memo: string
  ) => {
    if (paymentAmountSAR <= 0 || invoiceIds.length === 0) {
      return { success: false, error: 'Payment amount and at least one invoice are required.' };
    }

    let remainingPayment = paymentAmountSAR;
    setCorporateInvoices((prev) =>
      prev.map((inv) => {
        if (!invoiceIds.includes(inv.id) || remainingPayment <= 0) return inv;
        const allocated = Math.min(inv.balanceDueSAR, remainingPayment);
        remainingPayment -= allocated;
        const newPaid = inv.paidAmountSAR + allocated;
        const newBalance = inv.amountSAR - newPaid;
        return {
          ...inv,
          paidAmountSAR: newPaid,
          balanceDueSAR: newBalance,
          status: newBalance <= 0.01 ? ('PAID' as const) : ('PARTIALLY_PAID' as const),
        };
      })
    );

    // Update customer account balance
    setCustomerAccounts((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              currentBalanceSAR: Math.max(0, c.currentBalanceSAR - paymentAmountSAR),
            }
          : c
      )
    );

    const voucherNum = `BR-${Date.now().toString().slice(-6)}`;
    addVoucher({
      voucherNumber: voucherNum,
      propertyId: 'PROP-RUH-01',
      type: 'BANK_RECEIPT',
      date: new Date().toISOString().slice(0, 10),
      fiscalPeriod,
      narration: `Corporate Direct Settlement: ${memo}`,
      narrationAr: `سداد مستحقات دفتر المدينة للشركات - ${memo}`,
      totalDebit: paymentAmountSAR,
      totalCredit: paymentAmountSAR,
      status: 'POSTED',
      postedBy: 'Accounts Receivable Officer',
      entries: [
        {
          id: `br-1-${Date.now()}`,
          accountCode: bankGlAccount || '102001004',
          accountNameEn: 'Bank Current Account - Al Rajhi',
          accountNameAr: 'حساب جاري - مصرف الراجحي',
          debit: paymentAmountSAR,
          credit: 0,
          costCenter: 'FIN',
          memo: `Wire received from Corporate Client`,
        },
        {
          id: `br-2-${Date.now()}`,
          accountCode: '103001002',
          accountNameEn: 'Accounts Receivable - City Ledger Corporate',
          accountNameAr: 'ذمم مدينة - دفتر المدينة والشركات',
          debit: 0,
          credit: paymentAmountSAR,
          costCenter: 'FIN',
          memo: `Credit City Ledger account`,
        },
      ],
    });

    return { success: true, voucherNumber: voucherNum };
  };

  // Front Office Cashier Shift Drop Reconciliation
  const reconcileCashierShiftDrop = (
    dropId: string,
    actualCash: number,
    actualMada: number,
    actualCC: number
  ) => {
    const targetDrop = cashierDrops.find((d) => d.id === dropId);
    if (!targetDrop) return { success: false, variance: 0 };

    const totalActual = actualCash + actualMada + actualCC;
    const totalExpected = targetDrop.expectedCashSAR + targetDrop.expectedMadaSAR + targetDrop.expectedCreditCardSAR;
    const variance = Math.round((totalActual - totalExpected) * 100) / 100;
    const voucherNum = `JV-DROP-${Date.now().toString().slice(-6)}`;

    const entries = [
      {
        id: `d1-${Date.now()}`,
        accountCode: '101001004',
        accountNameEn: 'Cash in Transit - Cashier Shift Drops',
        accountNameAr: 'نقدية في الطريق - تحصيلات الصناديق',
        debit: actualCash,
        credit: 0,
        costCenter: 'FO',
        memo: `Cash envelope #${targetDrop.dropEnvelopeNumber}`,
      },
      {
        id: `d2-${Date.now()}`,
        accountCode: '102001004',
        accountNameEn: 'Bank Mada POS Terminal Settlement',
        accountNameAr: 'تسوية نقاط بيع مدى - مصرف الراجحي',
        debit: actualMada,
        credit: 0,
        costCenter: 'FO',
        memo: `Mada terminal ${targetDrop.terminalId}`,
      },
      {
        id: `d3-${Date.now()}`,
        accountCode: '102001004',
        accountNameEn: 'Bank Credit Card Settlement (Visa/MC)',
        accountNameAr: 'تسوية البطاقات الائتمانية فيزا وماستركارد',
        debit: actualCC,
        credit: 0,
        costCenter: 'FO',
        memo: `Credit card terminal settlement`,
      },
    ];

    if (variance < 0) {
      entries.push({
        id: `d-short-${Date.now()}`,
        accountCode: '401001015',
        accountNameEn: 'Front Office Cashier Shortage',
        accountNameAr: 'عجز صندوق موظفي الاستقبال',
        debit: Math.abs(variance),
        credit: 0,
        costCenter: 'FO',
        memo: `Cashier shortage for ${targetDrop.cashierName}`,
      });
    } else if (variance > 0) {
      entries.push({
        id: `d-over-${Date.now()}`,
        accountCode: '401001016',
        accountNameEn: 'Front Office Cashier Overage',
        accountNameAr: 'زيادة صندوق موظفي الاستقبال',
        debit: 0,
        credit: variance,
        costCenter: 'FO',
        memo: `Cashier overage for ${targetDrop.cashierName}`,
      });
    }

    entries.push({
      id: `d-gl-${Date.now()}`,
      accountCode: '103001001',
      accountNameEn: 'Guest Ledger - In-House Folio Settlements',
      accountNameAr: 'دفتر النزلاء - تسويات الفواتير المقفلة',
      debit: 0,
      credit: totalExpected,
      costCenter: 'FO',
      memo: `Opera PMS cashier shift settlement`,
    });

    addVoucher({
      voucherNumber: voucherNum,
      propertyId: targetDrop.propertyId,
      type: 'JOURNAL',
      date: targetDrop.dropDate,
      fiscalPeriod,
      narration: `Cashier Drop Reconciliation: ${targetDrop.cashierName} (${targetDrop.shiftCode}) - Terminal ${targetDrop.terminalId}`,
      narrationAr: `تسوية صندوق الاستقبال: ${targetDrop.cashierNameAr || targetDrop.cashierName} (${targetDrop.shiftCode})`,
      totalDebit: Math.max(totalActual, totalExpected),
      totalCredit: Math.max(totalActual, totalExpected),
      status: 'POSTED',
      postedBy: 'General Cashier & Night Auditor',
      entries,
    });

    setCashierDrops((prev) =>
      prev.map((d) =>
        d.id === dropId
          ? {
              ...d,
              actualCashSAR: actualCash,
              actualMadaSAR: actualMada,
              actualCreditCardSAR: actualCC,
              varianceSAR: variance,
              status: 'POSTED_TO_GL',
              postedVoucherNumber: voucherNum,
            }
          : d
      )
    );

    return { success: true, voucherNumber: voucherNum, variance };
  };

  // Stores Issue Voucher (SIV) Requisition
  const issueStoreRequisition = (sivData: Omit<StoreIssueVoucher, 'id' | 'sivNumber' | 'status'>) => {
    const sivNum = `SIV-${Date.now().toString().slice(-6)}`;
    const voucherNum = `JV-${sivNum}`;
    const totalCost = sivData.items.reduce((s, i) => s + i.totalCostSAR, 0);

    const newSiv: StoreIssueVoucher = {
      ...sivData,
      id: `SIV-${Date.now().toString().slice(-6)}`,
      sivNumber: sivNum,
      totalCostSAR: totalCost,
      status: 'POSTED_TO_GL',
      postedVoucherNumber: voucherNum,
    };

    setStoreIssueVouchers((prev) => [newSiv, ...prev]);

    setStockItems((prev) =>
      prev.map((item) => {
        const issuedLine = sivData.items.find((i) => i.sku === item.sku);
        if (!issuedLine) return item;
        const newOnHand = Math.max(0, item.totalOnHand - issuedLine.quantity);
        return {
          ...item,
          totalOnHand: newOnHand,
          totalValuationSAR: Math.round(newOnHand * item.weightedAvgCostSAR * 100) / 100,
        };
      })
    );

    addVoucher({
      voucherNumber: voucherNum,
      propertyId: sivData.propertyId,
      type: 'INVENTORY_ISSUE',
      date: sivData.date,
      fiscalPeriod,
      narration: `Stores Issue Voucher ${sivNum} to ${sivData.requestingOutlet}`,
      narrationAr: `سند صرف مواد ومؤن رقم ${sivNum} لقسم ${sivData.requestingOutlet}`,
      totalDebit: totalCost,
      totalCredit: totalCost,
      status: 'POSTED',
      postedBy: 'Cost Controller & Storekeeper',
      entries: [
        {
          id: `siv-d-${Date.now()}`,
          accountCode: sivData.costCenterCode || '403001001',
          accountNameEn: `F&B Cost of Sales - ${sivData.requestingOutlet}`,
          accountNameAr: `تكلفة الأغذية والمشروبات المستهلكة - ${sivData.requestingOutlet}`,
          debit: totalCost,
          credit: 0,
          costCenter: 'FB',
          memo: `Provisions issued to kitchen`,
        },
        {
          id: `siv-c-${Date.now()}`,
          accountCode: '104001001',
          accountNameEn: 'Food & Beverage Inventory - Main Store',
          accountNameAr: 'مخزون الأغذية والمشروبات - المستودع الرئيسي',
          debit: 0,
          credit: totalCost,
          costCenter: 'STORE',
          memo: `Credit main inventory valuation`,
        },
      ],
    });

    return { success: true, sivNumber: sivNum, voucherNumber: voucherNum };
  };

  const approveRequisition = (reqId: string) => {
    setRequisitions((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'APPROVED_FINANCE' as const } : r))
    );
    return true;
  };

  const approvePO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'ISSUED' as const } : p))
    );
    return true;
  };

  // Add new Stock Item
  const addStockItem = (itemData: Omit<StockItem, 'id' | 'totalValuationSAR'>) => {
    const totalVal = Math.round(itemData.totalOnHand * itemData.weightedAvgCostSAR * 100) / 100;
    const newItem: StockItem = {
      ...itemData,
      id: `STK-${Date.now().toString().slice(-6)}`,
      totalValuationSAR: totalVal,
    };
    setStockItems((prev) => [newItem, ...prev]);
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'STOCK_ITEM_CREATED',
        user: 'Cost Controller',
        details: `Item ${newItem.sku} (${newItem.nameEn}) added to master inventory. Valuation: ${totalVal} SAR.`,
      },
      ...prev,
    ]);
    return newItem;
  };

  // Update Department Budget
  const updateBudget = (budgetId: string, newAllocatedAnnualSAR: number) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== budgetId) return b;
        const allocatedYtd = Math.round((newAllocatedAnnualSAR / 12) * 11);
        const varianceSAR = allocatedYtd - b.actualYtdSAR - b.committedSAR;
        const variancePercentage = Math.round((varianceSAR / allocatedYtd) * 1000) / 10;
        return {
          ...b,
          allocatedAnnualSAR: newAllocatedAnnualSAR,
          allocatedYtdSAR: allocatedYtd,
          varianceSAR,
          variancePercentage,
          isOverBudget: varianceSAR < 0,
        };
      })
    );
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'BUDGET_UPDATED',
        user: 'Director of Finance',
        details: `Department budget ${budgetId} annual cap updated to ${newAllocatedAnnualSAR} SAR.`,
      },
      ...prev,
    ]);
  };

  // Add Employee Record with automatic GOSI and EOSB calculations
  const addEmployee = (
    empData: Omit<EmployeeRecord, 'id' | 'gosiEmployeeDeductionSAR' | 'gosiEmployerContributionSAR' | 'accumulatedEosbSAR'>
  ) => {
    const gosi = calculateGosi({
      nationality: empData.nationality,
      basicSalarySAR: empData.basicSalarySAR,
      housingAllowanceSAR: empData.housingAllowanceSAR,
    });

    const joinDateObj = new Date(empData.joinDate);
    const now = new Date();
    const yearsOfService = Math.max(0.1, (now.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const eosb = calculateSaudiEosb({
      yearsOfService,
      monthlyWageSAR: empData.totalGrossSalarySAR,
    });

    const newEmp: EmployeeRecord = {
      ...empData,
      id: `EMP-${Date.now().toString().slice(-6)}`,
      gosiEmployeeDeductionSAR: gosi.employeeDeductionSAR,
      gosiEmployerContributionSAR: gosi.employerContributionSAR,
      accumulatedEosbSAR: eosb.totalEosbSAR,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'EMPLOYEE_ONBOARDED',
        user: 'HR Manager',
        details: `Employee ${newEmp.employeeNumber} (${newEmp.nameEn}) onboarded. Gross: ${newEmp.totalGrossSalarySAR} SAR.`,
      },
      ...prev,
    ]);
    return newEmp;
  };

  // Update Employee Salary & Recalculate GOSI & EOSB
  const updateEmployeeSalary = (empId: string, basic: number, housing: number, transport: number) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const gross = basic + housing + transport + (emp.otherAllowancesSAR || 0);
        const gosi = calculateGosi({
          nationality: emp.nationality,
          basicSalarySAR: basic,
          housingAllowanceSAR: housing,
        });

        const joinDateObj = new Date(emp.joinDate);
        const now = new Date();
        const yearsOfService = Math.max(0.1, (now.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        const eosb = calculateSaudiEosb({
          yearsOfService,
          monthlyWageSAR: gross,
        });

        return {
          ...emp,
          basicSalarySAR: basic,
          housingAllowanceSAR: housing,
          transportAllowanceSAR: transport,
          totalGrossSalarySAR: gross,
          gosiEmployeeDeductionSAR: gosi.employeeDeductionSAR,
          gosiEmployerContributionSAR: gosi.employerContributionSAR,
          accumulatedEosbSAR: eosb.totalEosbSAR,
        };
      })
    );
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'EMPLOYEE_SALARY_UPDATED',
        user: 'Compensation & Benefits Officer',
        details: `Employee ${empId} wage updated (Basic: ${basic}, Housing: ${housing}, Transport: ${transport}). GOSI recalculated.`,
      },
      ...prev,
    ]);
  };

  // Export JSON Backup
  const exportDatabaseJSON = () => {
    return JSON.stringify(
      {
        exportTimestamp: new Date().toISOString(),
        properties,
        accounts,
        vouchers,
        suppliers,
        vendorInvoices,
        customerAccounts,
        corporateInvoices,
        cashierDrops,
        storeIssueVouchers,
        stockItems,
        recipes,
        budgets,
        employees,
        nightAuditBatches,
        cheques,
      },
      null,
      2
    );
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setVouchers(INITIAL_VOUCHERS);
    setVendorInvoices(INITIAL_INVOICES);
    setCorporateInvoices(INITIAL_CORPORATE_INVOICES);
    setCashierDrops(INITIAL_CASHIER_DROPS);
    setStoreIssueVouchers(INITIAL_STORE_ISSUES);
    setStockItems(INITIAL_STOCK_ITEMS);
    setBudgets(INITIAL_BUDGETS);
    setEmployees(INITIAL_EMPLOYEES);
    setNightAuditBatches(INITIAL_PMS_AUDIT_BATCHES);
    setCheques(INITIAL_CHEQUES);
  };

  return (
    <ERPContext.Provider
      value={{
        currentPropertyId,
        setCurrentPropertyId,
        currentProperty,
        properties,
        language,
        setLanguage,
        theme,
        setTheme,
        fiscalPeriod,
        setFiscalPeriod,
        activeYear,
        setActiveYear,
        accounts,
        vouchers,
        suppliers,
        vendorInvoices,
        customerAccounts,
        corporateInvoices,
        cashierDrops,
        storeIssueVouchers,
        requisitions,
        purchaseOrders,
        grns,
        stockItems,
        recipes,
        bankAccounts,
        pettyCashFloats,
        budgets,
        employees,
        nightAuditBatches,
        agentTasks,
        cheques,
        auditLogs,
        addVoucher,
        reverseVoucher,
        postNightAuditToGL,
        approveVendorInvoiceMatch,
        receiveGoodsToStore,
        receiveGoodsWithHACCP,
        allocateCorporatePayment,
        reconcileCashierShiftDrop,
        issueStoreRequisition,
        approveRequisition,
        approvePO,
        addCheque,
        signCheque,
        issueCheque,
        clearCheque,
        addStockItem,
        updateBudget,
        addEmployee,
        updateEmployeeSalary,
        exportDatabaseJSON,
        resetToDefaultData,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
}
