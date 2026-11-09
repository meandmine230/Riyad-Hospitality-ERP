import { Voucher, VoucherEntry } from '../types';

export interface ValidationResult {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  errors: string[];
}

export interface TrialBalanceRow {
  accountCode: string;
  accountNameEn: string;
  accountNameAr: string;
  debitTotal: number;
  creditTotal: number;
  netDebit: number;
  netCredit: number;
}

/**
 * Validates double-entry accounting integrity for a set of voucher lines.
 * Under standard accounting rules, total debits MUST equal total credits.
 */
export function validateVoucherEntries(entries: VoucherEntry[]): ValidationResult {
  const errors: string[] = [];

  if (!entries || entries.length < 2) {
    errors.push('A valid voucher must contain at least 2 entries (one debit and one credit).');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const debit = Number(entry.debit) || 0;
    const credit = Number(entry.credit) || 0;

    if (debit < 0 || credit < 0) {
      errors.push(`Entry #${i + 1}: Negative amounts are not permitted. Use reversal or opposite entry.`);
    }

    if (debit > 0 && credit > 0) {
      errors.push(`Entry #${i + 1}: An individual line cannot contain both debit and credit amounts.`);
    }

    if (debit === 0 && credit === 0) {
      errors.push(`Entry #${i + 1}: Line amount cannot be zero.`);
    }

    if (!entry.accountCode) {
      errors.push(`Entry #${i + 1}: Account code is mandatory.`);
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;
  const difference = Math.round(Math.abs(roundedDebit - roundedCredit) * 100) / 100;

  if (difference > 0.01) {
    errors.push(`Voucher is out of balance by ${difference.toFixed(2)} SAR (Debits: ${roundedDebit.toFixed(2)}, Credits: ${roundedCredit.toFixed(2)}).`);
  }

  return {
    isValid: errors.length === 0,
    totalDebit: roundedDebit,
    totalCredit: roundedCredit,
    difference,
    errors,
  };
}

/**
 * Computes the aggregate Trial Balance from posted vouchers.
 */
export function computeTrialBalance(
  vouchers: Voucher[],
  accounts: { code: string; nameEn: string; nameAr: string; category: string }[]
): { rows: TrialBalanceRow[]; totalDebits: number; totalCredits: number; isBalanced: boolean } {
  const accountMap = new Map<string, { nameEn: string; nameAr: string; debit: number; credit: number }>();

  // Initialize all accounts with zero
  accounts.forEach((acc) => {
    accountMap.set(acc.code, {
      nameEn: acc.nameEn,
      nameAr: acc.nameAr,
      debit: 0,
      credit: 0,
    });
  });

  // Aggregate posted vouchers only
  vouchers
    .filter((v) => v.status === 'POSTED')
    .forEach((v) => {
      v.entries.forEach((entry) => {
        const existing = accountMap.get(entry.accountCode) || {
          nameEn: entry.accountNameEn || entry.accountCode,
          nameAr: entry.accountNameAr || entry.accountCode,
          debit: 0,
          credit: 0,
        };

        existing.debit += Number(entry.debit) || 0;
        existing.credit += Number(entry.credit) || 0;
        accountMap.set(entry.accountCode, existing);
      });
    });

  let grandDebit = 0;
  let grandCredit = 0;
  const rows: TrialBalanceRow[] = [];

  accountMap.forEach((val, code) => {
    const d = Math.round(val.debit * 100) / 100;
    const c = Math.round(val.credit * 100) / 100;

    let netDebit = 0;
    let netCredit = 0;

    if (d > c) {
      netDebit = Math.round((d - c) * 100) / 100;
    } else {
      netCredit = Math.round((c - d) * 100) / 100;
    }

    grandDebit += netDebit;
    grandCredit += netCredit;

    rows.push({
      accountCode: code,
      accountNameEn: val.nameEn,
      accountNameAr: val.nameAr,
      debitTotal: d,
      creditTotal: c,
      netDebit,
      netCredit,
    });
  });

  // Sort by account code
  rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  const totalDebits = Math.round(grandDebit * 100) / 100;
  const totalCredits = Math.round(grandCredit * 100) / 100;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.05;

  return {
    rows,
    totalDebits,
    totalCredits,
    isBalanced,
  };
}

/**
 * Calculates standard Saudi VAT (15%) for goods and services.
 */
export function calculateVat(netAmount: number, rate: number = 0.15): { net: number; vat: number; gross: number } {
  const net = Math.round(netAmount * 100) / 100;
  const vat = Math.round(net * rate * 100) / 100;
  const gross = Math.round((net + vat) * 100) / 100;
  return { net, vat, gross };
}
