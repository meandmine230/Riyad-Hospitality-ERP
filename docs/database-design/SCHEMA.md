# Database Design & Financial Data Dictionary
**Author:** Agent 02 (Database Architect)  
**Standard:** Uniform Hospitality System of Accounts (USALI 11th Edition adapted for Saudi GAAP/IFRS)

---

## 1. Core Schema Entities

### Properties (Hotels)
- `id`: Property identifier (e.g. `PROP-RUH-01`)
- `nameEn`: English property name
- `nameAr`: Arabic property name
- `city`: City (Riyadh, Makkah, Jeddah)
- `keys`: Total room count (e.g. 320, 850, 210)
- `taxRegistrationNumber`: ZATCA TRN (15-digit)
- `crNumber`: Commercial Registration number

### Chart of Accounts (COA)
- `code`: 4-to-6 digit account code (e.g. `1110-01` Cash in Bank - Al Rajhi)
- `nameEn`: English account title
- `nameAr`: Arabic account title
- `category`: `ASSET` | `LIABILITY` | `EQUITY` | `REVENUE` | `EXPENSE`
- `subCategory`: Current Assets, Fixed Assets, Current Liabilities, Long Term, F&B Revenue, Rooms Revenue, Administrative Expenses, etc.
- `normalBalance`: `DEBIT` | `CREDIT`
- `isActive`: Boolean

### General Ledger & Journal Vouchers (JV)
- `voucherNumber`: Unique sequence (e.g. `JV-2026-0042`, `CPV-2026-0012`, `BPV-2026-0089`)
- `propertyId`: Target hotel
- `type`: `JOURNAL` | `CASH_PAYMENT` | `CASH_RECEIPT` | `BANK_PAYMENT` | `BANK_RECEIPT` | `NIGHT_AUDIT` | `PAYROLL`
- `date`: Posting date
- `fiscalPeriod`: e.g. `2026-11`
- `narration`: Purpose of transaction
- `entries`: Array of lines `{ accountCode, accountName, debit, credit, costCenter, memo }`
- `status`: `DRAFT` | `PENDING_APPROVAL` | `POSTED` | `REVERSED`
- `postedBy`, `postedAt`: Audit stamps

### Procurement & 3-Way Match
- `purchaseRequisition`: Item request, department, estimated budget, status
- `purchaseOrder`: Approved vendor, agreed unit prices, line quantities, payment terms
- `goodsReceiptNote`: Delivered quantities inspected at receiving bay, temperature/expiry checks for F&B
- `vendorInvoice`: Billed amounts from supplier, VAT details (15%), matched status (`MATCHED` | `DISCREPANCY` | `BLOCKED`)

### Inventory & F&B Recipe Costing
- `itemMaster`: SKU, Arabic/English name, category (`F_AND_B`, `HOUSEKEEPING`, `MAINTENANCE`, `OPERATING_SUPPLIES`), UOM (kg, case, liter, pack)
- `stockBalance`: Property + Store (Central Store, Kitchen Cold Room, Housekeeping Floor Store) + On Hand Qty + Moving Weighted Average Cost
- `recipeBOM`: Menu dish (e.g. Luxury Wagyu Burger, Mezze Platter), ingredients, portion size, unit cost, selling price, food cost %

### Saudi Labor & Payroll
- `employee`: Civil ID / Iqama, nationality (`SAUDI` | `NON_SAUDI`), department, basic salary, housing allowance, transport allowance
- `gosiRecord`: Employee deduction (Saudi: 9.75%, Expat: 0%), Employer contribution (Saudi: 11.75%, Expat: 2% hazard)
- `eosbRecord`: End of Service Benefit entitlement under Saudi Labor Law Article 84
