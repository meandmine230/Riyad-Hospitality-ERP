# Saudi Hotel Back Office ERP — Technical Architecture Specification
**Author:** Agent 01 (System Architect) & Agent 00 (CTO)  
**Version:** 1.0.0 — Production Enterprise Blueprint  
**Target Sector:** Kingdom of Saudi Arabia (KSA) Hospitality Industry

---

## 1. Executive Architecture Summary
The Saudi Hotel Back Office ERP is a multi-property, unified financial and operational platform designed specifically for luxury hotels, resorts, and pilgrim hospitality operations in Riyadh, Jeddah, Makkah, and Madinah.

Key Architectural Tenets:
1. **Immutable Double-Entry Financial Engine**: Strict enforcement of debit/credit equality. Zero unbalanced postings.
2. **Multi-Property Multi-Tenancy**: Centralized holding view with isolated property-level ledgers (e.g. Al Faisaliah Riyadh, Al Noor Makkah, Corniche Beach Resort Jeddah).
3. **Saudi Regulatory Compliance**:
   - ZATCA (Zakat, Tax and Customs Authority) Phase 2 E-Invoicing compliance (QR code structure, cryptographic stamps, 15% standard VAT).
   - Saudi Labor Law compliance (GOSI contributions, End of Service Benefits (EOSB) Article 84/85 calculations).
   - Ministry of Tourism (MoT) daily occupancy, ADR, and RevPAR reporting integration.
4. **Bilingual Arabic/English Design System**: First-class Right-to-Left (RTL) Cairo typography and Left-to-Right (LTR) Plus Jakarta Sans layout.
5. **Real-Time Subledger to General Ledger Synchronization**: Automated night audit journalizing from PMS (Opera/Cloudbeds) and POS (Simphony/Foodics).

---

## 2. Module Boundary & Dependency Graph
```
               [ AGENT 00: CTO Orchestrator & Task Board ]
                                    |
      +-----------------------------+-----------------------------+
      |                             |                             |
[ AGENT 01: Arch ]          [ AGENT 02: DB ]            [ AGENT 12: UI System ]
      |                             |                             |
      +-----------------------------+-----------------------------+
                                    |
                    [ AGENT 03: General Ledger Core ]
                    (CoA, Double-Entry Posting, Periods)
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
[ AGENT 04: AP / AR ]     [ AGENT 07: Treasury ]    [ AGENT 08: Budget ]
          |                         |                         |
[ AGENT 05: Procurement ]           |                         |
          |                         |                         |
[ AGENT 06: Inventory & F&B ]       |                         |
          |                         |                         |
          +-------------------------+-------------------------+
                                    |
                    [ AGENT 09: HR & Saudi Payroll ]
                    [ AGENT 10: PMS & POS Integrations ]
                                    |
                [ AGENT 11: Financial Reporting & BI ]
                (Flash Report, P&L, Balance Sheet, RevPAR)
                                    |
                    [ AGENT 13: QA Verification ]
                    [ AGENT 14: DevOps & Release ]
```

---

## 3. Financial Posting Rules
1. **Decimal Precision**: All currency calculations are computed at 4 decimal places and rendered at 2 decimal places in Saudi Riyals (SAR / ر.س).
2. **Voucher Immutability**: Posted vouchers cannot be edited; they must be reversed via an approved Reversal Voucher (RV).
3. **3-Way Matching Tolerances**:
   - Quantity tolerance: 0% (invoiced quantity cannot exceed GRN quantity).
   - Price tolerance: Maximum 2.5% variance or 250 SAR, requiring Controller approval.
