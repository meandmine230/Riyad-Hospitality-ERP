import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ModalDrawer } from '../components/ui/ModalDrawer';
import { calculateRecipeCost } from '../../shared/utilities/inventoryEngine';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import { RecipeItem } from '../../shared/types';
import {
  Boxes,
  UtensilsCrossed,
  ChefHat,
  TrendingDown,
  Warehouse,
  Search,
  Scale,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export const InventoryStoreView: React.FC = () => {
  const { language, stockItems, recipes, storeIssueVouchers, issueStoreRequisition, addStockItem } = useERP();
  const t = DICTIONARY[language];

  const [activeSubTab, setActiveSubTab] = useState<'items' | 'recipes' | 'siv'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem>(recipes[0]);
  const [simulatedSellingPrice, setSimulatedSellingPrice] = useState<number>(recipes[0]?.sellingPriceSAR || 135);

  // New SIV Modal State
  const [isDraftSivOpen, setIsDraftSivOpen] = useState(false);
  const [sivOutlet, setSivOutlet] = useState<'Main Restaurant (Al Liwan)' | 'In-Room Dining' | 'Lobby Lounge' | 'Pool Terrace' | 'Banquet Hall'>('Main Restaurant (Al Liwan)');
  const [sivChef, setSivChef] = useState('Samir Al-Bishi (Executive Chef)');
  const [sivSku, setSivSku] = useState(stockItems[0]?.sku || 'SKU-BEEF-WAGYU');
  const [sivQuantity, setSivQuantity] = useState(10);
  const [sivNotice, setSivNotice] = useState<string | null>(null);

  // New Stock Item Modal State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemNameAr, setNewItemNameAr] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'F_AND_B' | 'HOUSEKEEPING' | 'GUEST_SUPPLIES' | 'MAINTENANCE'>('F_AND_B');
  const [newItemUom, setNewItemUom] = useState('kg');
  const [newItemReorder, setNewItemReorder] = useState(50);
  const [newItemQty, setNewItemQty] = useState(100);
  const [newItemCost, setNewItemCost] = useState(45);
  const [newItemStore, setNewItemStore] = useState<'Main Store' | 'F&B Kitchen Store' | 'Housekeeping Floor Store' | 'Engineering Store'>('Main Store');

  const totalInventoryValuation = stockItems.reduce((sum, item) => sum + item.totalValuationSAR, 0);
  const totalSkuCount = stockItems.length;

  const simulatedCosting = calculateRecipeCost(
    selectedRecipe ? selectedRecipe.ingredients : [],
    simulatedSellingPrice
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              Agent 06: Inventory & F&B Costing Team
            </span>
            <span className="text-xs text-slate-500 font-mono">Moving Weighted Average Valuation</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'المستودعات وتكلفة الأغذية والمشروبات (F&B Costing)' : 'Inventory, Stores & Recipe Costing'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'تقييم المخزون بالمتوسط المرجح المتحرك، مستودعات الأغذية وخدمة الغرف، وهندسة تكاليف قوائم الطعام الفندقية'
              : 'Perpetual moving weighted average valuation, multi-store stock visibility, and F&B recipe food cost analytics.'}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'إجمالي تقييم المخزون' : 'Total Inventory Valuation'}
          value={formatCurrency(totalInventoryValuation, language)}
          subtitle={language === 'ar' ? 'المتوسط المرجح المتحرك' : 'Moving Weighted Average Base'}
          icon={Boxes}
          accentColor="amber"
        />
        <MetricCard
          title={language === 'ar' ? 'عدد الأصناف المسجلة' : 'Active Stock SKUs'}
          value={`${totalSkuCount} SKUs`}
          subtitle={language === 'ar' ? 'أغذية، بياضات، ومستلزمات نزلاء' : 'F&B, Housekeeping & Supplies'}
          icon={Warehouse}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'متوسط تكلفة الأغذية (F&B)' : 'Avg F&B Food Cost %'}
          value="32.4%"
          subtitle={language === 'ar' ? 'ضمن النطاق القياسي الفندقي' : 'Luxury Benchmark: <= 35%'}
          icon={UtensilsCrossed}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'وصفات الطعام النشطة' : 'Standard Recipes'}
          value={`${recipes.length} Dishes`}
          subtitle={language === 'ar' ? 'محتسبة التكلفة بالجرام' : 'Ingredient BOM Costed'}
          icon={ChefHat}
          accentColor="indigo"
        />
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'items'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل الأصناف والمستودعات' : 'Item Master & Store Balances'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('recipes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'recipes'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>{language === 'ar' ? 'هندسة تكلفة الوصفات (Recipe BOM)' : 'Recipe Costing & Menu Engineering'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('siv')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'siv'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{language === 'ar' ? 'سندات صرف المستودع وتكلفة الأغذية (SIV)' : 'Store Issues & Flash Food Cost %'}</span>
        </button>
      </div>

      {/* Tab: Item Master */}
      {activeSubTab === 'items' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#00305D]" />
              <span>{language === 'ar' ? 'الأصناف والمخزون المتاح' : 'Stock Items & Weighted Average Valuation'}</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#F4F6F8] border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00305D] w-48"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewItemSku(`SKU-${Date.now().toString().slice(-4)}`);
                  setIsAddingItem(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'صنف جديد' : 'New Stock Item'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">UOM</th>
                  <th className="py-3 px-3 text-right">Total On Hand</th>
                  <th className="py-3 px-3 text-right">Weighted Avg Cost (SAR)</th>
                  <th className="py-3 px-3 text-right">Total Valuation (SAR)</th>
                  <th className="py-3 px-3">Store Locations Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {stockItems
                  .filter(
                    (i) =>
                      i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.nameAr.includes(searchTerm)
                  )
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#00305D]">{item.sku}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{language === 'ar' ? item.nameAr : item.nameEn}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{item.uom}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{item.totalOnHand}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold">
                        {formatCurrency(item.weightedAvgCostSAR, language)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#00305D]">
                        {formatCurrency(item.totalValuationSAR, language)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {item.stores.map((st, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                              {st.storeName}: {st.quantityOnHand}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Recipe Costing Simulator */}
      {activeSubTab === 'recipes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dish selector */}
            <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-3">
              <span className="text-xs font-bold text-[#00305D] uppercase tracking-wider">Select Hotel Menu Dish</span>
              <div className="space-y-2">
                {recipes.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => {
                      setSelectedRecipe(rec);
                      setSimulatedSellingPrice(rec.sellingPriceSAR);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition cursor-pointer ${
                      selectedRecipe.id === rec.id
                        ? 'bg-blue-50/70 border-[#00305D] text-[#00305D] font-bold ring-1 ring-[#00305D]'
                        : 'bg-[#F4F6F8] border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{language === 'ar' ? rec.menuNameAr : rec.menuNameEn}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Selling Price: {formatCurrency(rec.sellingPriceSAR, language)} • {rec.outlet}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Costing Analysis */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#00305D]">{selectedRecipe.menuNameEn}</h3>
                  <p className="text-xs text-slate-500 font-arabic">{selectedRecipe.menuNameAr}</p>
                </div>
                <StatusBadge status={simulatedCosting.status} />
              </div>

              {/* Price Simulation Slider / Input */}
              <div className="p-4 rounded-xl bg-[#F4F6F8] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label htmlFor="selling-price-input" className="text-xs font-semibold text-slate-800 block">
                    Simulate Menu Selling Price (SAR):
                  </label>
                  <p className="text-[11px] text-slate-500">Adjust price to calculate dynamic food cost % and gross margin</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="selling-price-input"
                    type="number"
                    min="1"
                    value={simulatedSellingPrice}
                    onChange={(e) => setSimulatedSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-28 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-right font-mono font-bold text-[#00305D] text-sm focus:outline-none focus:border-[#00305D]"
                    aria-label="Simulate Menu Selling Price in SAR"
                  />
                  <span className="text-xs text-slate-500 font-mono">SAR</span>
                </div>
              </div>

              {/* Recipe Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-600">Portion Cost (BOM)</div>
                  <div className="text-base font-bold text-rose-700 font-mono mt-1">
                    {formatCurrency(simulatedCosting.totalCostPerPortionSAR, language)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-600">Gross Margin</div>
                  <div className="text-base font-bold text-emerald-700 font-mono mt-1">
                    {formatCurrency(simulatedCosting.grossMarginSAR, language)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-600">Food Cost %</div>
                  <div
                    className={`text-base font-bold font-mono mt-1 ${
                      simulatedCosting.foodCostPercentage > 38
                        ? 'text-rose-700'
                        : simulatedCosting.foodCostPercentage > 32
                        ? 'text-amber-800'
                        : 'text-emerald-700'
                    }`}
                  >
                    {simulatedCosting.foodCostPercentage}%
                  </div>
                </div>
              </div>

              {/* Ingredients Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#00305D] uppercase tracking-wider">Ingredient Breakdown (BOM)</span>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-2 px-3">Ingredient</th>
                        <th className="py-2 px-3 text-right">Portion Qty</th>
                        <th className="py-2 px-3 text-right">Unit Cost</th>
                        <th className="py-2 px-3 text-right">Line Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{ing.itemName}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {ing.portionQty} {ing.uom}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {formatCurrency(ing.unitCostSAR, language)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#00305D]">
                            {formatCurrency(ing.lineCostSAR, language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Store Issue Vouchers (SIV) & Daily Food Costing */}
      {activeSubTab === 'siv' && (
        <div className="space-y-6">
          {sivNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{sivNotice}</span>
            </div>
          )}

          {/* Daily Food Costing KPI Banner */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#00305D] text-[10px] font-bold font-mono uppercase border border-blue-200">
                    Daily Flash Cost Control
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Date: 2026-11-08</span>
                </div>
                <h3 className="text-lg font-bold text-[#00305D] mt-1">Live Daily Flash Food Cost & Kitchen Issues</h3>
                <p className="text-xs text-slate-600">
                  Real-time ratio between daily raw provisions issued to kitchens and yesterday's F&B sales revenue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDraftSivOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إنشاء سند صرف للمطبخ (SIV)' : 'Issue Store Requisition to Kitchen'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">F&B Daily Food Revenue</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{formatCurrency(64200, language)}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Opera Cloud PMS Night Audit</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Provisions Issued Today</div>
                <div className="text-sm font-bold text-[#00305D] mt-1">
                  {formatCurrency(storeIssueVouchers.reduce((s, v) => s + v.totalCostSAR, 0) + 15495, language)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Weighted Avg Cost Basis</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Flash Food Cost %</div>
                <div className="text-base font-bold text-emerald-700 mt-1">31.8%</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">On Target (&lt;= 33.0%) ✓</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Budget Target Margin</div>
                <div className="text-sm font-bold text-slate-900 mt-1">68.2% GOP</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Luxury 5-Star Benchmark</div>
              </div>
            </div>
          </div>

          {/* SIV Registry Table */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#00305D]" />
                <span>Store Issue Vouchers (SIV) Registry</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Issued to Outlets: {storeIssueVouchers.length}</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-3 px-3">SIV #</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Requesting Kitchen Outlet</th>
                    <th className="py-3 px-3">Issued By</th>
                    <th className="py-3 px-3">Received By Chef</th>
                    <th className="py-3 px-3 text-right">Total Cost (SAR)</th>
                    <th className="py-3 px-3">GL Linked Journal</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono">
                  {storeIssueVouchers.map((siv) => (
                    <tr key={siv.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-bold text-[#00305D]">{siv.sivNumber}</td>
                      <td className="py-3 px-3 text-slate-500">{siv.date}</td>
                      <td className="py-3 px-3 font-sans font-medium text-slate-800">{siv.requestingOutlet}</td>
                      <td className="py-3 px-3 font-sans text-slate-700">{siv.issuedBy.split(' ')[0]}</td>
                      <td className="py-3 px-3 font-sans text-slate-700">{siv.receivedByChef.split(' ')[0]}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {formatCurrency(siv.totalCostSAR, language)}
                      </td>
                      <td className="py-3 px-3 text-[#00305D] font-bold">{siv.postedVoucherNumber || 'Pending GL'}</td>
                      <td className="py-3 px-3 font-sans">
                        <StatusBadge
                          status={siv.status}
                          variant={siv.status === 'POSTED_TO_GL' ? 'success' : 'warning'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Draft SIV Modal */}
          {isDraftSivOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-white border border-[#DDE3EA] rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#00305D] flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#00305D]" />
                      <span>Issue Store Requisition to Kitchen (SIV)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Deducts stock from Main Store at Weighted Average Cost & creates Cost of Sales journal
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDraftSivOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold font-sans">Destination Kitchen Outlet</label>
                      <select
                        value={sivOutlet}
                        onChange={(e) => setSivOutlet(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 outline-none focus:border-[#00305D] font-sans"
                      >
                        <option value="Main Restaurant (Al Liwan)">Main Restaurant (Al Liwan)</option>
                        <option value="In-Room Dining">In-Room Dining (24/7)</option>
                        <option value="Lobby Lounge">Lobby Lounge</option>
                        <option value="Pool Terrace">Pool Terrace</option>
                        <option value="Banquet Hall">Banquet & Events Hall</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold font-sans">Receiving Executive / Sous Chef</label>
                      <input
                        type="text"
                        value={sivChef}
                        onChange={(e) => setSivChef(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 outline-none focus:border-[#00305D] font-sans"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-[#00305D] uppercase font-sans">Select Provision SKU to Issue</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1 font-sans">Item SKU</label>
                        <select
                          value={sivSku}
                          onChange={(e) => setSivSku(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-sans"
                        >
                          {stockItems.map((item) => (
                            <option key={item.id} value={item.sku}>
                              {item.nameEn} ({item.totalOnHand} {item.uom} on hand)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1 font-sans">Quantity to Issue</label>
                        <input
                          type="number"
                          value={sivQuantity}
                          onChange={(e) => setSivQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[#00305D] font-bold"
                        />
                      </div>
                    </div>

                    {(() => {
                      const selectedItem = stockItems.find((i) => i.sku === sivSku);
                      const unitCost = selectedItem?.weightedAvgCostSAR || 0;
                      const lineTotal = Math.round(unitCost * sivQuantity * 100) / 100;
                      return (
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                          <span className="text-slate-600">
                            Unit Cost: <strong>{formatCurrency(unitCost, language)}</strong> / {selectedItem?.uom}
                          </span>
                          <span className="text-emerald-700 font-bold text-sm">
                            Total Valuation: {formatCurrency(lineTotal, language)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-3 rounded-xl bg-[#EDF0F3] border border-slate-200 text-xs text-slate-700 flex justify-between">
                    <span className="font-semibold">Double-Entry GL Posting:</span>
                    <span className="text-[#00305D] font-bold">
                      Dr 403001001 (F&B Cost of Sales) / Cr 104001001 (Main Store Inventory)
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsDraftSivOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const selectedItem = stockItems.find((i) => i.sku === sivSku);
                      if (!selectedItem) return;
                      const unitCost = selectedItem.weightedAvgCostSAR;
                      const lineTotal = Math.round(unitCost * sivQuantity * 100) / 100;

                      const res = issueStoreRequisition({
                        propertyId: 'PROP-RUH-01',
                        date: new Date().toISOString().slice(0, 10),
                        requestingOutlet: sivOutlet,
                        costCenterCode: '403001001',
                        issuedBy: 'Mubarak Al-Husseini (Storekeeper)',
                        receivedByChef: sivChef,
                        totalCostSAR: lineTotal,
                        items: [
                          {
                            sku: selectedItem.sku,
                            name: selectedItem.nameEn,
                            quantity: sivQuantity,
                            uom: selectedItem.uom,
                            unitCostSAR: unitCost,
                            totalCostSAR: lineTotal,
                          },
                        ],
                      });

                      if (res.success) {
                        setSivNotice(
                          `SIV ${res.sivNumber} issued! ${sivQuantity} ${selectedItem.uom} of ${selectedItem.nameEn} deducted from Main Store. Journal posted as ${res.voucherNumber}.`
                        );
                        setIsDraftSivOpen(false);
                        setTimeout(() => setSivNotice(null), 5000);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Issue to Kitchen (Post to GL)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Stock Item Modal */}
      <ModalDrawer
        isOpen={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        title={language === 'ar' ? 'إضافة صنف مخزني جديد' : 'Register New Stock SKU'}
        subtitle={language === 'ar' ? 'تسجيل صنف في دليل المستودعات وتحديد تكلفة الوحدة والمستودع الأولي' : 'Add item to inventory master with initial weighted average cost'}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">SKU / Item Code *</label>
              <input
                type="text"
                placeholder="e.g. SKU-COFFEE-ARABICA"
                value={newItemSku}
                onChange={(e) => setNewItemSku(e.target.value)}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Item Category *</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as 'F_AND_B' | 'HOUSEKEEPING' | 'GUEST_SUPPLIES' | 'MAINTENANCE')}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              >
                <option value="F_AND_B">Food & Beverage (المأكولات والمشروبات)</option>
                <option value="HOUSEKEEPING">Housekeeping (المغسلة والنظافة)</option>
                <option value="GUEST_SUPPLIES">Guest Amenities & Supplies (مستلزمات النزلاء)</option>
                <option value="MAINTENANCE">Property Operations & Maintenance (الصيانة)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Item Name (English) *</label>
              <input
                type="text"
                placeholder="e.g. Single Origin Ethiopian Arabica Beans"
                value={newItemNameEn}
                onChange={(e) => setNewItemNameEn(e.target.value)}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Item Name (Arabic)</label>
              <input
                type="text"
                placeholder="مثال: حبوب قهوة إثيوبية عربية مختصة"
                value={newItemNameAr}
                onChange={(e) => setNewItemNameAr(e.target.value)}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Unit of Measure (UOM) *</label>
              <select
                value={newItemUom}
                onChange={(e) => setNewItemUom(e.target.value)}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="piece">Piece (قطعة)</option>
                <option value="bottle">Bottle (زجاجة)</option>
                <option value="pack">Pack / Box (علبة / كرتون)</option>
                <option value="liter">Liter (لتر)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Reorder Par Level</label>
              <input
                type="number"
                value={newItemReorder}
                onChange={(e) => setNewItemReorder(Number(e.target.value) || 0)}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <span className="font-bold text-[#00305D] text-xs">Initial Inventory Stock & Unit Valuation</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 block mb-1">Initial Quantity *</label>
                <input
                  type="number"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 block mb-1">Unit Cost (SAR) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 block mb-1">Storage Location</label>
                <select
                  value={newItemStore}
                  onChange={(e) => setNewItemStore(e.target.value as 'Main Store' | 'F&B Kitchen Store' | 'Housekeeping Floor Store' | 'Engineering Store')}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                >
                  <option value="Main Store">Main Store</option>
                  <option value="F&B Kitchen Store">F&B Kitchen Store</option>
                  <option value="Housekeeping Floor Store">Housekeeping Floor Store</option>
                  <option value="Engineering Store">Engineering Store</option>
                </select>
              </div>
            </div>
            <div className="text-[11px] text-[#00305D] font-mono font-medium pt-1">
              Initial Total Valuation: {formatCurrency(newItemQty * newItemCost, language)}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newItemSku.trim() || !newItemNameEn.trim()) {
                  alert('Please enter SKU and Item Name');
                  return;
                }
                addStockItem({
                  sku: newItemSku.toUpperCase().trim(),
                  nameEn: newItemNameEn.trim(),
                  nameAr: newItemNameAr.trim() || newItemNameEn.trim(),
                  category: newItemCategory,
                  uom: newItemUom,
                  reorderLevel: newItemReorder,
                  stores: [{ storeName: newItemStore, quantityOnHand: newItemQty }],
                  totalOnHand: newItemQty,
                  weightedAvgCostSAR: newItemCost,
                  lastPurchasePriceSAR: newItemCost,
                });
                setIsAddingItem(false);
                setNewItemSku('');
                setNewItemNameEn('');
                setNewItemNameAr('');
                setNewItemQty(100);
                setNewItemCost(45);
              }}
              className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              Save Stock Item
            </button>
          </div>
        </div>
      </ModalDrawer>
    </div>
  );
};
