import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGosi, calculateSaudiEosb } from './saudiLaborEngine';

test('Saudi Labor Engine: computes GOSI for Saudi citizen with capped salary', () => {
  // Saudi employee: Basic 10,000 + Housing 2,500 = 12,500 SAR
  // Employee: 9.75% of 12,500 = 1,218.75 SAR
  // Employer: 11.75% of 12,500 = 1,468.75 SAR
  const result = calculateGosi({
    nationality: 'SAUDI',
    basicSalarySAR: 10000,
    housingAllowanceSAR: 2500,
  });

  assert.equal(result.contributoryWageSAR, 12500);
  assert.equal(result.employeeDeductionSAR, 1218.75);
  assert.equal(result.employerContributionSAR, 1468.75);
  assert.equal(result.totalGosiSAR, 2687.50);
});

test('Saudi Labor Engine: applies GOSI cap at 45,000 SAR for executive wages', () => {
  // General Manager: Basic 40,000 + Housing 15,000 = 55,000 SAR -> capped at 45,000 SAR
  const result = calculateGosi({
    nationality: 'SAUDI',
    basicSalarySAR: 40000,
    housingAllowanceSAR: 15000,
  });

  assert.equal(result.contributoryWageSAR, 45000);
  assert.equal(result.employeeDeductionSAR, 4387.50); // 45000 * 0.0975
});

test('Saudi Labor Engine: computes GOSI for non-Saudi expat employee', () => {
  // Expat employee: 0% employee deduction, 2% employer hazard contribution
  const result = calculateGosi({
    nationality: 'NON_SAUDI',
    basicSalarySAR: 6000,
    housingAllowanceSAR: 1500,
  });

  assert.equal(result.employeeDeductionSAR, 0);
  assert.equal(result.employerContributionSAR, 150); // 7500 * 0.02
});

test('Saudi Labor Engine: computes End of Service Benefit (Article 84) accurately', () => {
  // Example 1: 3 years of service @ 10,000 SAR/month
  // 3 * 0.5 * 10,000 = 15,000 SAR
  const result3Years = calculateSaudiEosb({
    monthlyWageSAR: 10000,
    yearsOfService: 3,
  });
  assert.equal(result3Years.totalEosbSAR, 15000);

  // Example 2: 8 years of service @ 10,000 SAR/month
  // First 5 years: 5 * 0.5 * 10,000 = 25,000 SAR
  // Next 3 years: 3 * 1.0 * 10,000 = 30,000 SAR
  // Total = 55,000 SAR
  const result8Years = calculateSaudiEosb({
    monthlyWageSAR: 10000,
    yearsOfService: 8,
  });
  assert.equal(result8Years.firstFiveYearsAmountSAR, 25000);
  assert.equal(result8Years.subsequentYearsAmountSAR, 30000);
  assert.equal(result8Years.totalEosbSAR, 55000);
});
