export interface GosiCalculationResult {
  nationality: 'SAUDI' | 'NON_SAUDI';
  contributoryWageSAR: number; // Basic + Housing capped at 45,000 SAR
  employeeRate: number;
  employerRate: number;
  employeeDeductionSAR: number;
  employerContributionSAR: number;
  totalGosiSAR: number;
}

export interface EosbCalculationResult {
  yearsOfService: number;
  monthlyWageSAR: number;
  firstFiveYearsAmountSAR: number;
  subsequentYearsAmountSAR: number;
  totalEosbSAR: number;
}

/**
 * Calculates GOSI contributions under General Organization for Social Insurance (KSA) rules.
 * Wage ceiling for GOSI calculation is 45,000 SAR.
 */
export function calculateGosi(params: {
  nationality: 'SAUDI' | 'NON_SAUDI';
  basicSalarySAR: number;
  housingAllowanceSAR: number;
}): GosiCalculationResult {
  const uncappedWage = (params.basicSalarySAR || 0) + (params.housingAllowanceSAR || 0);
  const contributoryWageSAR = Math.min(45000, Math.max(0, uncappedWage));

  let employeeRate = 0;
  let employerRate = 0.02; // 2% Occupational Hazard for all

  if (params.nationality === 'SAUDI') {
    // Saudi citizen: 9% pension + 0.75% SANED = 9.75% employee deduction
    // Employer: 9% pension + 2% hazard + 0.75% SANED = 11.75%
    employeeRate = 0.0975;
    employerRate = 0.1175;
  }

  const employeeDeductionSAR = Math.round(contributoryWageSAR * employeeRate * 100) / 100;
  const employerContributionSAR = Math.round(contributoryWageSAR * employerRate * 100) / 100;
  const totalGosiSAR = Math.round((employeeDeductionSAR + employerContributionSAR) * 100) / 100;

  return {
    nationality: params.nationality,
    contributoryWageSAR,
    employeeRate,
    employerRate,
    employeeDeductionSAR,
    employerContributionSAR,
    totalGosiSAR,
  };
}

/**
 * Calculates End of Service Benefits (EOSB) under Saudi Labor Law Article 84.
 * Rule:
 * - Half a month's wage for each of the first 5 years of service.
 * - One full month's wage for each subsequent year.
 */
export function calculateSaudiEosb(params: {
  monthlyWageSAR: number;
  yearsOfService: number;
}): EosbCalculationResult {
  const wage = Math.max(0, params.monthlyWageSAR);
  const years = Math.max(0, params.yearsOfService);

  const firstTierYears = Math.min(5, years);
  const secondTierYears = Math.max(0, years - 5);

  const firstFiveYearsAmountSAR = Math.round(firstTierYears * 0.5 * wage * 100) / 100;
  const subsequentYearsAmountSAR = Math.round(secondTierYears * 1.0 * wage * 100) / 100;
  const totalEosbSAR = Math.round((firstFiveYearsAmountSAR + subsequentYearsAmountSAR) * 100) / 100;

  return {
    yearsOfService: Math.round(years * 100) / 100,
    monthlyWageSAR: wage,
    firstFiveYearsAmountSAR,
    subsequentYearsAmountSAR,
    totalEosbSAR,
  };
}
