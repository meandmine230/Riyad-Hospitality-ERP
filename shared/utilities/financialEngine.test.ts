import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVoucherEntries, computeTrialBalance, calculateVat } from './financialEngine';
import { Voucher, VoucherEntry } from '../types';

test('Financial Engine: validates balanced double-entry voucher', () => {
  const balancedEntries: VoucherEntry[] = [
    {
      id: '1',
      accountCode: '1120',
      accountNameEn: 'Bank Current Account - Al Rajhi',
      accountNameAr: 'مصرف الراجحي',
      debit: 15000,
      credit: 0,
      costCenter: 'FIN',
      memo: 'Receipt from guest',
    },
    {
      id: '2',
      accountCode: '4100',
      accountNameEn: 'Rooms Revenue',
      accountNameAr: 'إيرادات الغرف',
      debit: 0,
      credit: 15000,
      costCenter: 'ROOMS',
      memo: 'Rooms revenue booking',
    },
  ];

  const result = validateVoucherEntries(balancedEntries);
  assert.equal(result.isValid, true);
  assert.equal(result.totalDebit, 15000);
  assert.equal(result.totalCredit, 15000);
  assert.equal(result.difference, 0);
  assert.equal(result.errors.length, 0);
});

test('Financial Engine: rejects unbalanced voucher entries', () => {
  const unbalancedEntries: VoucherEntry[] = [
    {
      id: '1',
      accountCode: '1120',
      accountNameEn: 'Bank',
      accountNameAr: 'البنك',
      debit: 10000,
      credit: 0,
      costCenter: 'FIN',
      memo: 'Bank deposit',
    },
    {
      id: '2',
      accountCode: '4100',
      accountNameEn: 'Rooms Revenue',
      accountNameAr: 'إيراد الغرف',
      debit: 0,
      credit: 9500,
      costCenter: 'ROOMS',
      memo: 'Discrepant amount',
    },
  ];

  const result = validateVoucherEntries(unbalancedEntries);
  assert.equal(result.isValid, false);
  assert.equal(result.difference, 500);
  assert.match(result.errors[0], /out of balance by 500.00 SAR/);
});

test('Financial Engine: calculates Saudi 15% VAT correctly', () => {
  const result = calculateVat(1000, 0.15);
  assert.equal(result.net, 1000);
  assert.equal(result.vat, 150);
  assert.equal(result.gross, 1150);
});

test('Financial Engine: generates balanced trial balance from posted vouchers', () => {
  const accounts = [
    { code: '1120', nameEn: 'Bank', nameAr: 'البنك', category: 'ASSET' },
    { code: '4100', nameEn: 'Revenue', nameAr: 'الإيراد', category: 'REVENUE' },
    { code: '6100', nameEn: 'Expense', nameAr: 'المصروف', category: 'EXPENSE' },
  ];

  const vouchers: Voucher[] = [
    {
      id: 'v1',
      voucherNumber: 'JV-001',
      propertyId: 'PROP-RUH-01',
      type: 'JOURNAL',
      date: '2026-11-01',
      fiscalPeriod: '2026-11',
      narration: 'Revenue posting',
      narrationAr: 'قيد إيراد',
      status: 'POSTED',
      isBalanced: true,
      totalDebit: 50000,
      totalCredit: 50000,
      entries: [
        { id: 'e1', accountCode: '1120', accountNameEn: 'Bank', accountNameAr: 'البنك', debit: 50000, credit: 0, costCenter: 'GEN', memo: '' },
        { id: 'e2', accountCode: '4100', accountNameEn: 'Revenue', accountNameAr: 'الإيراد', debit: 0, credit: 50000, costCenter: 'GEN', memo: '' },
      ],
    },
    {
      id: 'v2',
      voucherNumber: 'JV-002',
      propertyId: 'PROP-RUH-01',
      type: 'JOURNAL',
      date: '2026-11-02',
      fiscalPeriod: '2026-11',
      narration: 'Expense payment',
      narrationAr: 'سداد مصروف',
      status: 'POSTED',
      isBalanced: true,
      totalDebit: 10000,
      totalCredit: 10000,
      entries: [
        { id: 'e3', accountCode: '6100', accountNameEn: 'Expense', accountNameAr: 'المصروف', debit: 10000, credit: 0, costCenter: 'GEN', memo: '' },
        { id: 'e4', accountCode: '1120', accountNameEn: 'Bank', accountNameAr: 'البنك', debit: 0, credit: 10000, costCenter: 'GEN', memo: '' },
      ],
    },
  ];

  const tb = computeTrialBalance(vouchers, accounts);
  assert.equal(tb.isBalanced, true);
  assert.equal(tb.totalDebits, 50000);
  assert.equal(tb.totalCredits, 50000);
});
