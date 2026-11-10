# Mobile & Tablet Responsiveness Architecture

A high-performance responsive engineering overhaul for Riyada Hospitality ERP, providing seamless mobile navigation (375px–768px), adaptive tablet layouts (768px–1024px), and pristine desktop ergonomics (1024px+).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during the interactive planning interview:
> - **Mobile Navigation**: Collapsible slide-over drawer with dark backdrop overlay and thumb-friendly touch targets ($\ge 44\text{px}$).
> - **Data & Ledger Tables**: Smooth horizontal swipe with sticky row headers, tabular figures (`tabular-nums`), and non-wrapping currency cells.
> - **Target Devices**: Standard smartphones (iOS/Android 375px–430px) and hotel operations tablets (iPad/Android 768px–1024px).

---

## 1. Overview & Core Concept

### What It Does
Adapts the full suite of Riyada Hotel Back-Office modules—including the USALI General Ledger, Opera Night Audit Bridge, Accounts Payable 3-Way Match, Food Costing Inventory, and Payroll—into a responsive, touch-friendly operational application. On mobile viewports, the fixed desktop sidebar collapses into a slide-over drawer accessed via a tactile hamburger trigger in the top bar. Complex financial tables maintain strict column alignment with horizontal swipe tracks and fixed identifier columns.

### Target Audience & Persona
- **General Managers & Financial Controllers**: Reviewing GOP flash reports, approving journal entries, and inspecting bank reconciliations on tablets or smartphones during floor walkthroughs.
- **F&B Directors & Storekeepers**: Entering receiving records, tracking Wagyu/linen stock levels, and verifying reorder thresholds on mobile devices directly in cold rooms and dry stores.
- **Night Auditors & Duty Managers**: Checking Opera Cloud daily room revenues and guest ledger balances from handheld tablets.

### Key Value
Eliminates layout clipping, horizontal page stretching, and unreachable UI controls on handheld screens, enabling hotel management to execute mission-critical ERP approvals and data lookups anywhere on property.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Mobile Drawer Navigation Flow**:
   - The user opens the ERP on a smartphone or tablet portrait screen.
   - The top header renders a 48px hamburger button on the left, next to the hotel crest and property selector.
   - Tapping the hamburger slides out the full Deep Navy navigation drawer from the leading edge (left for English, right for Arabic RTL) with a smooth easing curve and a semi-transparent backdrop overlay.
   - Selecting any module updates the view and automatically dismisses the drawer with zero latency.

2. **Horizontal Swipe Table Experience**:
   - When viewing wide data tables (USALI Income Statement, 8-column Stock Inventory, Trial Balance), the outer card remains firmly bounded within the viewport.
   - A subtle swipe indicator or gradient fade signals scrollable content.
   - The user swipes horizontally to inspect all debit/credit columns and variance percentages, while the Account Code or Item Name remains stickily pinned on the leading edge for immediate context.

3. **Responsive KPI & Metric Grids**:
   - High-level executive statistics (GOP Margin, RevPAR, Cash Position, Active Headcount) automatically stack into 1 column on small screens, 2 columns on tablets, and 4 columns on large monitors (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).

### Visual Identity & Theme
- **Primary Navy**: `#00305D` for headers, active tab highlights, and slide-over navigation.
- **Dark Navy Structural**: `#002244` for sidebar backgrounds, modal headers, and drawer chrome.
- **Neutral Canvas**: `#F4F6F8` light cool gray background preventing eye strain in hotel office environments.
- **Typography**: Clean sans-serif with monospace tabular numerals (`tabular-nums font-mono`) for all financial amounts, VAT breakdowns, and stock quantities.
- **Touch Ergonomics**: All interactive buttons, tabs, select inputs, and row triggers meet WCAG touch target standards ($\ge 44\text{px} \times 44\text{px}$).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Collapsible Slide-Over Drawer vs Bottom Navigation Bar
- **Chosen Approach**: Slide-over drawer with backdrop overlay triggered from the header.
- **Why**: Riyada ERP contains 11 dedicated modules organized into 3 functional divisions (Finance, Operations, Human Capital). A bottom tab bar is strictly limited to 4–5 items and would require burying core hotel workflows behind nested "More" menus. The slide-over drawer accommodates the complete departmental structure while preserving quick thumb access.
- **Trade-Off**: Requires one tap to reveal menu options on mobile, offset by the top bar's "Quick Shortcuts" menu for instant 1-tap jump to frequent actions.

### Decision 2: Horizontal Table Swipe with Sticky Columns vs Card Transformation
- **Chosen Approach**: Horizontal swipe with sticky row headers.
- **Why**: Hotel accountants and auditors expect standard tabular double-entry layouts (Account Code, Description, Opening, Debit, Credit, Net). Converting a 7-column trial balance into stacked cards destroys vertical column scannability and prevents fast row-by-row comparisons.
- **Trade-Off**: Users scroll horizontally on narrow viewports, which is made effortless through sticky row headers and clean scrollbars.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Top Header Bar                        │
│  [☰ Drawer Trigger]  [Hotel Crest]  [Property]  [Language]  │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 ┌──────────────────────┐             ┌──────────────────────┐
 │  Desktop Sidebar     │             │ Mobile Drawer        │
 │  (Hidden < lg)       │             │ (Slide-over + Blur)  │
 │  • Sticky left rail  │             │ • Pinned overlay     │
 │  • Full 11 modules   │             │ • Auto-close on nav  │
 └──────────┬───────────┘             └──────────┬───────────┘
            │                                    │
            └──────────────────┬─────────────────┘
                               ▼
 ┌────────────────────────────────────────────────────────────┐
 │                   Main Content Viewport                    │
 │                                                            │
 │  ┌──────────────────────────────────────────────────────┐  │
 │  │ Responsive Metric Cards                              │  │
 │  │ grid-cols-1 sm:grid-cols-2 lg:grid-cols-4            │  │
 │  └──────────────────────────────────────────────────────┘  │
 │                                                            │
 │  ┌──────────────────────────────────────────────────────┐  │
 │  │ Horizontal Swipe Table Container                     │  │
 │  │ • overflow-x-auto                                    │  │
 │  │ • min-w-[720px]                                      │  │
 │  │ • sticky left-0 leading column                       │  │
 │  └──────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────┘
```

### Component State & Props Contract
- **`App.tsx`**: Owns `isMobileNavOpen: boolean` state. Passes `isMobileNavOpen` and `setIsMobileNavOpen` to `Header` and `Sidebar`.
- **`Header.tsx`**: Renders mobile hamburger toggle (`md:hidden`), wraps property selector with flexible truncation, and condenses user profile pills on narrow viewports.
- **`Sidebar.tsx`**: Renders as persistent desktop sidebar on `lg:flex` and fixed slide-over drawer on smaller screens (`fixed inset-y-0 z-50 transform transition-transform`). Renders accessible dismiss button and backdrop overlay (`bg-black/50 backdrop-blur-sm`).
- **Module Views**: Wraps all data tables with `overflow-x-auto` wrappers and ensures KPI card grids use adaptive column spans.
