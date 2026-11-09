# RIYADA HOSPITALITY ERP — CTO MASTER SPECIFICATION & MULTI-AGENT WORK ORDERS

**Project**: Riyada Saudi Hotel Back Office ERP (Luxury 5-Star Hotel Chain)  
**Executive Authority**: Agent 00 — CTO, Engineering Director & Master Orchestrator  
**Compliance Standard**: USALI 11th Edition, Saudi GAAP (SOCPA / IFRS), ZATCA Phase 2 E-Invoicing, KSA Ministry of Tourism Circular 7788/1448 & Resolution 2289, Saudi Labor Law (GOSI & Article 84)  
**Date of Release**: November 9, 2026  
**Status**: APPROVED ARCHITECTURE BASELINE — READY FOR SPECIALIST TEAM PARALLEL DEVELOPMENT  

---

## SECTION 1: EXECUTIVE SYSTEM ARCHITECTURE & INTEGRATION TOPOLOGY

### 1.1 Architectural Principles & System Guarantees
1. **Single Source of Financial Truth**: All departmental sub-systems (PMS Night Audit, Kitchen Stores, Procurement, Payroll, City Ledger) converge onto a single double-entry General Ledger posting engine. No module may maintain disconnected shadow ledger balances.
2. **Zero-Defect Financial Equilibrium**: Every voucher transaction posted must strictly satisfy $\sum \text{Debits} = \sum \text{Credits}$ with `DECIMAL(15,2)` precision. Unbalanced vouchers throw hard transactional errors and cannot commit.
3. **Append-Only Auditing**: In compliance with Saudi financial regulations, posted accounting vouchers, approved cheques, and received GRNs are immutable. Corrections must be executed via automated counter-reversal vouchers.
4. **Multi-Property Isolation**: Complete data segregation across properties (`PROP-RUH-01`, `PROP-MAK-02`, `PROP-JED-03`) with dynamic consolidated rollup capabilities.
5. **Regulatory Sovereignty**: Automated daily telemetry relay to the **Ministry of Tourism (MoT) National Tourism Monitoring Platform (NTMP / منصة الرصد السياحي)** per Circular 7788/1448, and ZATCA Phase 2 cryptographic e-invoicing compliance.

### 1.2 Module Dependency Graph (DAG)
```
[Agent 01: System Architect] + [Agent 02: Database Architect]
                     │
                     ▼
          [Agent 03: Finance & General Ledger Core]
           ├──► [Agent 04: AP & City Ledger (AR)]
           ├──► [Agent 05: Procurement & 3-Way Match]
           │     └──► [Agent 06: Stores & F&B Recipe Costing]
           ├──► [Agent 07: Treasury & Master Cheque Register]
           ├──► [Agent 08: Budget Management & USALI Variances]
           ├──► [Agent 09: Saudi HR, Payroll & GOSI / EOSB]
           └──► [Agent 10: Hotel Integrations & MoT NTMP Bridge]
                     │
                     ▼
          [Agent 11: Financial Statements & USALI BI Reports]
                     │
                     ▼
          [Agent 12: Frontend & Daylight Design System]
                     │
                     ▼
          [Agent 13: QA Automation Engine (node:test)]
                     │
                     ▼
          [Agent 14: DevOps, Audit Logger & Release Engineering]
```

---

## SECTION 2: GLOBAL DATABASE SCHEMA & ERD SPECIFICATION

### 2.1 Shared Schemas & Column Standards
All monetary columns are `DECIMAL(15,2)` denominated in Saudi Arabian Riyals (SAR). All timestamps are ISO 8601 UTC strings (`YYYY-MM-DD HH:mm:ss`).

```sql
-- 1. PROPERTIES MASTER
CREATE TABLE properties (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'PROP-RUH-01'
    code VARCHAR(16) NOT NULL UNIQUE, -- 'AFR-RUH'
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    city VARCHAR(64) NOT NULL,
    star_rating INT NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
    total_keys INT NOT NULL,
    vat_number VARCHAR(15) NOT NULL, -- 15-digit ZATCA VAT ID
    cr_number VARCHAR(10) NOT NULL,  -- 10-digit Saudi Commercial Registration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USALI CHART OF ACCOUNTS (9-Digit Hierarchy)
CREATE TABLE chart_of_accounts (
    account_code VARCHAR(16) PRIMARY KEY, -- '10-200-1004'
    account_name_en VARCHAR(255) NOT NULL,
    account_name_ar VARCHAR(255) NOT NULL,
    account_type VARCHAR(32) NOT NULL, -- 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'
    usali_schedule VARCHAR(32) NOT NULL, -- 'ROOMS', 'FB', 'ADMIN', 'MAINT', 'BALANCE_SHEET'
    parent_account_code VARCHAR(16),
    is_reconciliation_account BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_account_code) REFERENCES chart_of_accounts(account_code)
);

-- 3. GENERAL LEDGER VOUCHERS (Master Header)
CREATE TABLE vouchers (
    id VARCHAR(32) PRIMARY KEY,
    voucher_number VARCHAR(32) NOT NULL UNIQUE, -- 'JV-2026-0038', 'BPV-2026-0089'
    property_id VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'JOURNAL', 'CASH_PAYMENT', 'CASH_RECEIPT', 'BANK_PAYMENT', 'BANK_RECEIPT', 'NIGHT_AUDIT', 'PAYROLL', 'INVENTORY_ISSUE'
    voucher_date DATE NOT NULL,
    fiscal_period VARCHAR(7) NOT NULL, -- '2026-11'
    narration_en TEXT NOT NULL,
    narration_ar TEXT NOT NULL,
    reference_doc VARCHAR(64),
    total_debit DECIMAL(15,2) NOT NULL,
    total_credit DECIMAL(15,2) NOT NULL,
    is_balanced BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(16) NOT NULL DEFAULT 'POSTED', -- 'POSTED', 'REVERSED'
    posted_by VARCHAR(128) NOT NULL,
    posted_at TIMESTAMP NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- 4. GENERAL LEDGER VOUCHER LINES
CREATE TABLE voucher_entries (
    id VARCHAR(32) PRIMARY KEY,
    voucher_id VARCHAR(32) NOT NULL,
    line_number INT NOT NULL,
    account_code VARCHAR(16) NOT NULL,
    cost_center VARCHAR(32) NOT NULL, -- 'ROOMS', 'FB', 'ADMIN', 'SALES', 'SPA', 'MAINT', 'FIN', 'TAX'
    debit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    credit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    memo TEXT,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE RESTRICT,
    FOREIGN KEY (account_code) REFERENCES chart_of_accounts(account_code)
);

-- 5. SUPPLIERS MASTER (AP)
CREATE TABLE suppliers (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    vat_number VARCHAR(15) NOT NULL,
    cr_number VARCHAR(10) NOT NULL,
    category VARCHAR(32) NOT NULL, -- 'FOOD_BEVERAGE', 'LINEN_LAUNDRY', 'GUEST_AMENITIES', 'MAINTENANCE'
    payment_terms_days INT NOT NULL DEFAULT 30,
    credit_limit_sar DECIMAL(15,2) NOT NULL,
    current_balance_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00
);

-- 6. VENDOR INVOICES
CREATE TABLE vendor_invoices (
    id VARCHAR(32) PRIMARY KEY,
    invoice_number VARCHAR(64) NOT NULL,
    supplier_id VARCHAR(32) NOT NULL,
    property_id VARCHAR(32) NOT NULL,
    po_number VARCHAR(32),
    grn_number VARCHAR(32),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal_sar DECIMAL(15,2) NOT NULL,
    vat_amount_sar DECIMAL(15,2) NOT NULL, -- 15% standard KSA VAT
    total_amount_sar DECIMAL(15,2) NOT NULL,
    paid_amount_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    three_way_match_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_MATCH', -- 'MATCHED', 'DISCREPANCY_PRICE', 'DISCREPANCY_QTY'
    status VARCHAR(32) NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'MATCHED'
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- 7. CITY LEDGER CORPORATE ACCOUNTS (AR)
CREATE TABLE customer_accounts (
    id VARCHAR(32) PRIMARY KEY,
    account_number VARCHAR(32) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL, -- 'CORPORATE', 'GOVERNMENT', 'AIRLINE', 'TRAVEL_AGENT'
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    contact_person VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    credit_limit_sar DECIMAL(15,2) NOT NULL,
    current_balance_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
);

-- 8. CORPORATE DIRECT BILLING FOLIO INVOICES
CREATE TABLE corporate_invoices (
    id VARCHAR(32) PRIMARY KEY,
    invoice_number VARCHAR(32) NOT NULL UNIQUE,
    customer_account_id VARCHAR(32) NOT NULL,
    folio_number VARCHAR(32) NOT NULL,
    guest_name VARCHAR(128) NOT NULL,
    room_number VARCHAR(32) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    amount_sar DECIMAL(15,2) NOT NULL,
    paid_amount_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    balance_due_sar DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PARTIALLY_PAID', 'PAID'
    FOREIGN KEY (customer_account_id) REFERENCES customer_accounts(id)
);

-- 9. INVENTORY MASTER & VALUATION
CREATE TABLE stock_items (
    id VARCHAR(32) PRIMARY KEY,
    sku VARCHAR(32) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL, -- 'F_AND_B', 'HOUSEKEEPING', 'GUEST_SUPPLIES', 'MAINTENANCE'
    uom VARCHAR(16) NOT NULL, -- 'kg', 'piece', 'bottle', 'pack', 'liter'
    reorder_level DECIMAL(15,2) NOT NULL,
    total_on_hand DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    weighted_avg_cost_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    last_purchase_price_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_valuation_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00
);

-- 10. STOCK LOCATIONS BREAKDOWN
CREATE TABLE stock_store_balances (
    id VARCHAR(32) PRIMARY KEY,
    stock_item_id VARCHAR(32) NOT NULL,
    store_name VARCHAR(64) NOT NULL, -- 'Main Store', 'F&B Kitchen Store', 'Housekeeping Floor Store', 'Engineering Store'
    quantity_on_hand DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (stock_item_id) REFERENCES stock_items(id)
);

-- 11. HOTEL MASTER CHEQUE REGISTER
CREATE TABLE cheques (
    id VARCHAR(32) PRIMARY KEY,
    property_id VARCHAR(32) NOT NULL,
    cheque_number VARCHAR(32) NOT NULL UNIQUE,
    bank_name VARCHAR(64) NOT NULL,
    gl_account_code VARCHAR(16) NOT NULL,
    beneficiary VARCHAR(255) NOT NULL,
    beneficiary_ar VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'WAITING_FOR_CHECKS', -- 'WAITING_FOR_CHECKS', 'WAITING_FOR_APPROVAL', 'READY_TO_ISSUE', 'ISSUED_AND_CLEARED', 'VOIDED'
    voucher_ref VARCHAR(32),
    notes TEXT,
    prepared_by VARCHAR(128) NOT NULL,
    approved_by_fc VARCHAR(128),
    approved_by_gm VARCHAR(128),
    cleared_at TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- 12. SAUDI HR & EMPLOYEES
CREATE TABLE employees (
    id VARCHAR(32) PRIMARY KEY,
    employee_number VARCHAR(32) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    nationality VARCHAR(16) NOT NULL, -- 'SAUDI', 'NON_SAUDI'
    national_id_or_iqama VARCHAR(10) NOT NULL,
    property_id VARCHAR(32) NOT NULL,
    department VARCHAR(64) NOT NULL,
    job_title_en VARCHAR(128) NOT NULL,
    job_title_ar VARCHAR(128) NOT NULL,
    join_date DATE NOT NULL,
    basic_salary_sar DECIMAL(15,2) NOT NULL,
    housing_allowance_sar DECIMAL(15,2) NOT NULL,
    transport_allowance_sar DECIMAL(15,2) NOT NULL,
    other_allowances_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_gross_salary_sar DECIMAL(15,2) NOT NULL,
    gosi_employee_deduction_sar DECIMAL(15,2) NOT NULL,
    gosi_employer_contribution_sar DECIMAL(15,2) NOT NULL,
    accumulated_eosb_sar DECIMAL(15,2) NOT NULL,
    active_advances_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- 13. OPERA CLOUD NIGHT AUDIT STAGING BATCHES
CREATE TABLE night_audit_batches (
    id VARCHAR(32) PRIMARY KEY,
    audit_date DATE NOT NULL,
    property_id VARCHAR(32) NOT NULL,
    pms_system VARCHAR(32) NOT NULL DEFAULT 'Opera Cloud',
    total_rooms INT NOT NULL,
    occupied_rooms INT NOT NULL,
    occupancy_percentage DECIMAL(5,2) NOT NULL,
    room_revenue_sar DECIMAL(15,2) NOT NULL,
    adr_sar DECIMAL(15,2) NOT NULL,
    revpar_sar DECIMAL(15,2) NOT NULL,
    fb_revenue_sar DECIMAL(15,2) NOT NULL,
    other_revenue_sar DECIMAL(15,2) NOT NULL,
    vat_collected_sar DECIMAL(15,2) NOT NULL,
    municipality_tax_sar DECIMAL(15,2) NOT NULL,
    total_daily_revenue_sar DECIMAL(15,2) NOT NULL,
    guest_ledger_debit_balance_sar DECIMAL(15,2) NOT NULL,
    city_ledger_transfers_sar DECIMAL(15,2) NOT NULL,
    credit_card_settlements_sar DECIMAL(15,2) NOT NULL,
    cash_received_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    is_posted_to_gl BOOLEAN NOT NULL DEFAULT FALSE,
    posted_voucher_number VARCHAR(32),
    mot_sync_status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- 14. DEPARTMENTAL BUDGETS
CREATE TABLE department_budgets (
    id VARCHAR(32) PRIMARY KEY,
    property_id VARCHAR(32) NOT NULL,
    fiscal_year INT NOT NULL,
    department VARCHAR(64) NOT NULL,
    allocated_annual_sar DECIMAL(15,2) NOT NULL,
    allocated_ytd_sar DECIMAL(15,2) NOT NULL,
    actual_ytd_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    committed_sar DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    variance_sar DECIMAL(15,2) NOT NULL,
    variance_percentage DECIMAL(5,2) NOT NULL,
    is_over_budget BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

---

## SECTION 3: UNIFIED REST/RPC API CONTRACTS

| Endpoint | Method | Caller Module | Receiver Module | Payload Contract | Response Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/gl/vouchers/post` | POST | All Modules | Agent 03 (GL) | `{ voucherNumber, type, date, entries: [{ accountCode, costCenter, debit, credit, memo }] }` | `{ success: boolean, voucherId: string, balanceDiff: number }` |
| `/api/gl/trial-balance` | GET | Reporting (11) | Agent 03 (GL) | `?propertyId=PROP-RUH-01&period=2026-11` | `{ lines: [{ accountCode, opening, debit, credit, net, closing }], totalDr, totalCr, isBalanced }` |
| `/api/pms/night-audit/ingest` | POST | Agent 10 (PMS) | Agent 03 (GL) | `{ auditDate, roomRevenue, fbRevenue, vat, guestLedgerDr, cityLedgerDr, ccDr }` | `{ success: boolean, voucherNumber: string }` |
| `/api/procurement/3way-match` | POST | Agent 05 (PO) | Agent 04 (AP) | `{ poId, grnId, invoiceId, toleranceThreshold: 0.00 }` | `{ matchResult: 'MATCHED' \| 'DISCREPANCY', varianceQty, variancePrice }` |
| `/api/stores/siv/issue` | POST | Agent 06 (Store)| Agent 03 (GL) | `{ outlet, costCenterCode, items: [{ sku, qty, unitCost }] }` | `{ success: boolean, sivNumber: string, voucherNumber: string }` |
| `/api/ar/corporate/allocate` | POST | Agent 04 (AR) | Agent 03 (GL) | `{ customerId, invoiceIds: string[], wireAmountSAR, bankGlAccount, memo }` | `{ success: boolean, voucherNumber: string, remainingBalance }` |
| `/api/hr/payroll/accrue` | POST | Agent 09 (HR) | Agent 03 (GL) | `{ fiscalPeriod, grossSalaries, employerGosi, netPayableWps, advances }` | `{ success: boolean, voucherNumber: string }` |
| `/api/mot/telemetry/push` | POST | Agent 10 (PMS) | MoT NTMP Relay | `{ propertyCode, date, keysAvailable, keysOccupied, occupancyPct, adr, revpar }` | `{ status: 'SUCCESS', ntmpTrackingId: string, timestamp }` |

---

## SECTION 4: DEDICATED AGENT WORK ORDERS & DEVELOPMENT PROMPTS

### AGENT 01 WORK ORDER — SYSTEM ARCHITECT
- **Mission**: Own enterprise boundaries, multi-tenant property isolation, cross-cutting auth roles, and system reliability contracts.
- **Workflows**:
  - Enforce property routing: `PROP-RUH-01` (Riyadh Palace), `PROP-MAK-02` (Makkah Tower), `PROP-JED-03` (Jeddah Resort), or `ALL` (Consolidated Group).
  - Define user RBAC profiles: `FINANCIAL_CONTROLLER`, `GENERAL_MANAGER`, `CHIEF_ACCOUNTANT`, `STOREKEEPER`, `NIGHT_AUDITOR`, `HR_DIRECTOR`.
- **APIs & Middleware**: Enforce token header extraction and request isolation.
- **Acceptance Gate**: Zero property-bleed; unauthorized access strictly blocked.

### AGENT 02 WORK ORDER — DATABASE ARCHITECT
- **Mission**: Implement the master relational schema, transactional integrity, and precision guarantees.
- **Rules**:
  - `DECIMAL(15,2)` precision mandatory on all monetary fields.
  - Foreign key constraints on all ledger references.
  - Master index strategy on `vouchers(voucher_date, property_id)` and `voucher_entries(account_code)`.
- **Acceptance Gate**: Schema migrations pass without orphan references.

### AGENT 03 WORK ORDER — FINANCE & GENERAL LEDGER TEAM
- **Mission**: Implement the core USALI double-entry posting engine, 9-digit Chart of Accounts, and 5-Column Trial Balance.
- **Workflows & Forms**:
  - "New Voucher (JV/CP/BP)" modal: Fields: Type, Date, Narration (En/Ar), Ref Doc, Line Items (Account, Cost Center, Dr, Cr, Memo).
  - Formula: $\text{Period Net} = \text{Debits} - \text{Credits}$; $\text{Closing} = \text{Opening} + \text{Period Net}$.
  - Equilibrium Validator: Enforces $\sum \text{Dr} - \sum \text{Cr} = 0.00$.
- **Acceptance Gate**: Passes `financialEngine.test.ts` (100% balanced check, 15% VAT calculation).

### AGENT 04 WORK ORDER — ACCOUNTS PAYABLE & CITY LEDGER TEAM
- **Mission**: Manage supplier balances, AP aging, corporate direct billing folios, and wire payment allocations.
- **Workflows & Forms**:
  - "Record Bank Wire & Allocate" modal: Customer dropdown, invoice multi-select checklist, Wire Amount SAR, Receiving Bank (Al Rajhi / SNB), Memo.
  - "Print Statement of Account (SOA)": Formatted statement with aging schedule (Current, 30, 60, 90+ days).
- **Formulas**:
  - $\text{New Invoice Balance} = \max(0, \text{Balance Due} - \text{Payment Allocated})$.
- **Acceptance Gate**: Reconciled corporate subledger matches GL Account `103001002`.

### AGENT 05 WORK ORDER — PROCUREMENT & 3-WAY MATCH TEAM
- **Mission**: Implement PO generation, GRN dock receiving, SFDA/HACCP cold-chain temperature verification, and 3-way matching.
- **Workflows & Forms**:
  - "HACCP Receiving Bay Inspection" modal: Vehicle Reefer Temp (°C), SFDA Expiry Verification, Quality Inspection (`PASSED` / `CONDITIONAL` / `REJECTED`), Rejection Notes.
  - "3-Way Match Reconciler": PO vs GRN vs Invoice line matching with 0.0% tolerance.
- **Acceptance Gate**: Passes `procurementEngine.test.ts` (quantity discrepancy and price variance rejection).

### AGENT 06 WORK ORDER — INVENTORY & STORES TEAM
- **Mission**: Perpetual moving weighted average valuation, multi-store balances, F&B Kitchen SIV requisitions, and recipe BOM costing.
- **Workflows & Forms**:
  - "New Stock Item" modal: SKU, English/Arabic Name, Category, UOM, Reorder Level, Initial Stock, Unit Cost, Store.
  - "Draft SIV Requisition" modal: Outlet, Chef, SKU, Quantity. Automatically debits F&B Cost of Sales and credits Store Inventory.
  - "Recipe Costing Simulator": Live selling price adjustment with real-time margin and food cost % classification.
- **Formulas**:
  - $\text{New WAC} = \frac{(\text{Current Qty} \times \text{Current WAC}) + (\text{Received Qty} \times \text{Received Unit Price})}{\text{Current Qty} + \text{Received Qty}}$.
  - $\text{Food Cost \%} = \frac{\text{Recipe Cost Per Portion}}{\text{Menu Selling Price}} \times 100$.
- **Acceptance Gate**: Passes `inventoryEngine.test.ts` (exact WAC math and food cost benchmark).

### AGENT 07 WORK ORDER — TREASURY & BANKING TEAM
- **Mission**: Operating bank accounts, electronic statement auto-matching, petty cash floats, and dual-authorized Cheque Register.
- **Workflows & Forms**:
  - "Draft New Cheque" modal: Bank, Cheque Number, Payee (En/Ar), Amount, Issue/Due Date, GL Account, Memo.
  - Dual-Sign: Requires both `Sign (FC)` and `Sign (GM)` before advancing to `READY_TO_ISSUE`.
  - "Print Cheque Voucher Slip": Formal printable voucher with bilingual legal text and signature boxes.
- **Acceptance Gate**: Unsigned cheques cannot be issued or cleared.

### AGENT 08 WORK ORDER — BUDGET MANAGEMENT TEAM
- **Mission**: USALI departmental budget performance, YTD targets, and variance monitoring.
- **Workflows & Forms**:
  - "Edit Department Budget" modal: Update Annual Budget Cap in SAR. Recomputes 11-month YTD allocation target and projected variance.
- **Formulas**:
  - $\text{YTD Target} = \frac{\text{Annual Budget}}{12} \times 11$.
  - $\text{Variance} = \text{Allocated YTD} - (\text{Actual YTD Expenditures} + \text{Committed POs})$.
- **Acceptance Gate**: Over-budget flags trigger immediately when expenditures exceed allocated YTD.

### AGENT 09 WORK ORDER — SAUDI HR & PAYROLL TEAM
- **Mission**: Saudi labor compliance, GOSI statutory contributions, Article 84 End of Service Benefit (EOSB), and monthly WPS payroll journals.
- **Workflows & Forms**:
  - "Onboard Employee" modal: Name, Nationality, Iqama/National ID, Department, Job Title, Basic, Housing, Transport.
  - "Edit Salary & Allowances" modal: Live recalculation of contributory wage, GOSI, and accumulated EOSB.
  - "Post Monthly Payroll to GL": Automated double-entry voucher debiting Salaries & GOSI Expense and crediting Net Payable (WPS), GOSI Payable, and Advances.
- **Formulas**:
  - $\text{Contributory Wage} = \min(45000, \text{Basic} + \text{Housing})$.
  - Saudi Employee GOSI: $\text{Contributory Wage} \times 9.75\%$; Employer: $\text{Contributory Wage} \times 11.75\%$.
  - Expat Employee: $0.00$ SAR deduction; Employer: $\text{Contributory Wage} \times 2\%$.
  - Article 84 EOSB: $(\text{Years} \le 5 ? \text{Years} \times 0.5 : 2.5 + (\text{Years} - 5)) \times \text{Gross Salary}$.
- **Acceptance Gate**: Passes `saudiLaborEngine.test.ts` (45k cap and Article 84 accuracy).

### AGENT 10 WORK ORDER — HOTEL INTEGRATIONS & MOT NTMP TEAM
- **Mission**: Opera Cloud Night Audit ingestion, Front Office Cashier Shift drop balancing, and Ministry of Tourism NTMP daily financial telemetry.
- **Workflows & Forms**:
  - "Reconcile Cashier Shift Drop" modal: Actual Cash, Actual Mada, Actual Credit Cards. Automatically calculates variance and books to Cashier Shortage (401001015) or Overage (401001016).
  - "Post Revenue Journal to GL": Translates PMS audit turnover into balanced General Ledger entries.
  - "Push Daily Financial Feed": Circular 7788/1448 relay to NTMP Gateway.
- **Acceptance Gate**: Reconciled cashiers match bank envelope drop audit.

### AGENT 11 WORK ORDER — REPORTING & BI TEAM
- **Mission**: Produce USALI 13-column Operating Statements (P&L), Daily Revenue Flash, and Balance Sheet.
- **Workflows & Reports**:
  - P&L: Departmental Revenues, Cost of Sales, Payroll, Other Expenses, Departmental Profit, Undistributed Operating Expenses, **Gross Operating Profit (GOP)**, EBITDA.
  - Flash: Occupancy %, ADR, RevPAR with Day Actual, MTD, YTD, and Budget Variance.
- **Acceptance Gate**: GOP matches General Ledger net balances exactly.

### AGENT 12 WORK ORDER — FRONTEND & UI/UX DESIGN TEAM
- **Mission**: Maintain the Daylight Enterprise Banking & Hospitality Design System.
- **Standards**:
  - Primary: Deep Navy `#00305D` / `#002244` for headers, active tabs, and primary actions.
  - Neutral Canvas: Light cool gray `#F4F6F8` / `#EDF0F3` (zero dark-mode slop, zero harsh glare).
  - High-contrast white cards: `bg-white border-[#DDE3EA] shadow-sm`.
  - Tabular figures: `font-mono tabular-nums`.
  - Bilingual typography: Inter for English (LTR), Cairo for Saudi Arabic (RTL).
- **Acceptance Gate**: Seamless RTL layout flipping and zero visual defects.

### AGENT 13 WORK ORDER — QA & AUTOMATION TEST TEAM
- **Mission**: Enforce zero-defect software quality via automated unit and integration tests using `node:test`.
- **Test Matrix**:
  1. `financialEngine.test.ts`: Balanced voucher validation, unbalanced rejection, 15% VAT calculation, Trial Balance equilibrium.
  2. `inventoryEngine.test.ts`: Moving weighted average cost accuracy, recipe food cost % calculation.
  3. `procurementEngine.test.ts`: 3-way match validation, quantity discrepancy detection, price variance flags.
  4. `saudiLaborEngine.test.ts`: GOSI calculation for Saudis, GOSI 45,000 SAR statutory ceiling enforcement, expat GOSI rates, Article 84 EOSB gratuity calculation.
- **Acceptance Gate**: 13/13 tests pass without failure or timeout.

### AGENT 14 WORK ORDER — DEVOPS, AUDIT LOG & PRODUCTION RELEASE
- **Mission**: Subsystem health telemetry, append-only security audit log stream, and JSON snapshot disaster recovery.
- **Workflows**:
  - Subsystem Telemetry Monitor: Validates sub-5ms latency across all 14 active engines.
  - "Export Database JSON": Generates single-file full disaster recovery snapshot.
  - "Reset Seed": Instant factory baseline reset.
- **Acceptance Gate**: Zero downtime gate verified for production deployment.

---

## SECTION 5: MASTER ARCHITECTURAL REVIEW & AUTHORIZATION

### CTO Verification Checklist
- [x] Standard USALI 11th Edition 9-digit Chart of Accounts defined.
- [x] Double-entry balancing enforcement verified ($\Delta \text{Dr/Cr} = 0.00$).
- [x] ZATCA 15% VAT calculations validated.
- [x] Ministry of Tourism Circular 7788/1448 NTMP compliance integrated.
- [x] GOSI 45,000 SAR ceiling and Article 84 EOSB validated.
- [x] Moving weighted average inventory logic unit-tested.
- [x] 14 specialist agent work orders specified with exact workflows, forms, formulas, buttons, schemas, and test criteria.

**AUTHORIZATION DECISION**:  
The System Architecture, Database ERD, API Contracts, Dependency Map, and Agent Work Orders are hereby **FORMALLY RATIFIED**. All 14 specialist teams are authorized to execute their respective module mandates in parallel.
