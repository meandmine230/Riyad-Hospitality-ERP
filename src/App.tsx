/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ERPProvider, useERP } from './state/erpState';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CTOOrchestrationView } from './modules/CTOOrchestrationView';
import { GeneralLedgerView } from './modules/GeneralLedgerView';
import { AccountsPayableReceivableView } from './modules/AccountsPayableReceivableView';
import { ProcurementView } from './modules/ProcurementView';
import { InventoryStoreView } from './modules/InventoryStoreView';
import { TreasuryBankingView } from './modules/TreasuryBankingView';
import { BudgetManagementView } from './modules/BudgetManagementView';
import { HRPayrollView } from './modules/HRPayrollView';
import { HotelIntegrationView } from './modules/HotelIntegrationView';
import { FinancialReportingView } from './modules/FinancialReportingView';
import { DevOpsSystemView } from './modules/DevOpsSystemView';

const MainLayout: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const { language } = useERP();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
      case 'cto':
        return <CTOOrchestrationView onNavigate={setActiveModule} />;
      case 'generalLedger':
        return <GeneralLedgerView />;
      case 'apAr':
      case 'cityLedger':
        return <AccountsPayableReceivableView />;
      case 'procurement':
        return <ProcurementView />;
      case 'inventory':
        return <InventoryStoreView />;
      case 'treasury':
        return <TreasuryBankingView />;
      case 'budget':
        return <BudgetManagementView />;
      case 'hrPayroll':
        return <HRPayrollView />;
      case 'hotelIntegration':
        return <HotelIntegrationView />;
      case 'financialReports':
        return <FinancialReportingView />;
      case 'devops':
        return <DevOpsSystemView />;
      default:
        return <CTOOrchestrationView onNavigate={setActiveModule} />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F4F6F8] text-slate-800 flex flex-col antialiased ${
        language === 'ar' ? 'font-arabic' : 'font-sans'
      }`}
    >
      <Header
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isMobileNavOpen={isMobileNavOpen}
          setIsMobileNavOpen={setIsMobileNavOpen}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 bg-[#F4F6F8]">
          <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <MainLayout />
    </ERPProvider>
  );
}
