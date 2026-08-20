import React, { useState, useMemo } from 'react';
import { 
  X, Download, Printer, Copy, Check, FileSpreadsheet, Filter, 
  Calendar, MapPin, Truck, Search, RotateCcw, DollarSign, 
  ChevronDown, ArrowRight, Shield, Layers, UserCheck
} from 'lucide-react';
import { BhadaRate } from '../types';
import { exportToCSV, formatINR, formatDate } from '../utils/formatters';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bhadaRates: BhadaRate[];
}

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom';
type PaymentFilter = 'all' | 'has_balance' | 'zero_balance' | 'has_advance';

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  bhadaRates,
}) => {
  const [copied, setCopied] = useState(false);

  // Filters State
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('all');
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [textSearch, setTextSearch] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState('all');

  // Extract unique origins and destinations
  const uniqueOrigins = useMemo(() => {
    const set = new Set<string>();
    bhadaRates.forEach(b => {
      if (b.originCity) set.add(b.originCity.toUpperCase().trim());
    });
    return Array.from(set).sort();
  }, [bhadaRates]);

  const uniqueDestinations = useMemo(() => {
    const set = new Set<string>();
    bhadaRates.forEach(b => {
      if (b.destinationCity) set.add(b.destinationCity.toUpperCase().trim());
    });
    return Array.from(set).sort();
  }, [bhadaRates]);

  // Set date preset ranges
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'this_week') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(lastDay.toISOString().slice(0, 10));
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSelectedOrigin('all');
    setSelectedDestination('all');
    setPaymentFilter('all');
    setTextSearch('');
    setSelectedVisibility('all');
  };

  // Apply all filters to bhadaRates
  const filteredRates = useMemo(() => {
    return bhadaRates.filter(item => {
      // 1. Date filter
      if (startDate && item.loadingDate) {
        if (item.loadingDate < startDate) return false;
      }
      if (endDate && item.loadingDate) {
        if (item.loadingDate > endDate) return false;
      }

      // 2. Origin filter
      if (selectedOrigin !== 'all') {
        if (item.originCity?.toUpperCase().trim() !== selectedOrigin) return false;
      }

      // 3. Destination filter
      if (selectedDestination !== 'all') {
        if (item.destinationCity?.toUpperCase().trim() !== selectedDestination) return false;
      }

      // 4. Payment filter
      if (paymentFilter === 'has_balance') {
        if (!item.balanceAmount || item.balanceAmount <= 0) return false;
      } else if (paymentFilter === 'zero_balance') {
        if (item.balanceAmount && item.balanceAmount > 0) return false;
      } else if (paymentFilter === 'has_advance') {
        if (!item.advanceAmount || item.advanceAmount <= 0) return false;
      }

      // 5. Visibility filter
      if (selectedVisibility !== 'all') {
        if (selectedVisibility === 'admin_only' && item.visibility !== 'admin_only') return false;
        if (selectedVisibility === 'all_users' && item.visibility !== 'all_users') return false;
        if (selectedVisibility === 'specific_users' && item.visibility !== 'specific_users' && item.visibility !== 'saved_group') return false;
      }

      // 6. Text search filter
      if (textSearch.trim()) {
        const query = textSearch.toLowerCase().trim();
        const matchRoute = `${item.originCity} ${item.destinationCity}`.toLowerCase().includes(query);
        const matchTruck = item.truckNumber?.toLowerCase().includes(query);
        const matchParty = item.partyName?.toLowerCase().includes(query);
        const matchLR = item.lrNumber?.toLowerCase().includes(query);
        const matchDriver = item.driverName?.toLowerCase().includes(query) || item.driverPhone?.includes(query);
        const matchMaterial = item.materialType?.toLowerCase().includes(query);

        if (!matchRoute && !matchTruck && !matchParty && !matchLR && !matchDriver && !matchMaterial) {
          return false;
        }
      }

      return true;
    });
  }, [
    bhadaRates, 
    startDate, 
    endDate, 
    selectedOrigin, 
    selectedDestination, 
    paymentFilter, 
    selectedVisibility, 
    textSearch
  ]);

  if (!isOpen) return null;

  // Compute filtered statistics
  const totalFreight = filteredRates.reduce((sum, b) => sum + (b.totalBhadaAmount || 0), 0);
  const totalWeight = filteredRates.reduce((sum, b) => sum + (b.weightTons || 0), 0);
  const totalAdvance = filteredRates.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
  const totalBalance = filteredRates.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);
  const isFiltered = filteredRates.length !== bhadaRates.length;

  const handleCopySummary = () => {
    const lines = [
      `🚚 *ROUTE BHADA FREIGHT REGISTER EXPORT*`,
      isFiltered ? `_Filter Applied: ${filteredRates.length} of ${bhadaRates.length} records_` : '',
      startDate || endDate ? `Date Range: ${startDate || 'Start'} to ${endDate || 'Latest'}` : '',
      `Total Trips / Entries: ${filteredRates.length}`,
      `Total Tonnage: ${totalWeight.toFixed(2)} MT`,
      `Total Freight Amount: ${formatINR(totalFreight)}`,
      `Total Advance Collected: ${formatINR(totalAdvance)}`,
      `Total Balance Due: ${formatINR(totalBalance)}`,
      `----------------------------------------`,
      ...filteredRates.map(
        (b, i) =>
          `${i + 1}. ${b.originCity} ➔ ${b.destinationCity} | Rate: ${formatINR(b.ratePerUnit, false)}/${b.rateUnit} | Truck: ${b.truckNumber || 'N/A'} | Bhada: ${formatINR(b.totalBhadaAmount)} | Bal: ${formatINR(b.balanceAmount || 0)}`
      ),
      `----------------------------------------`,
      `_Exported via Transport & Freight Management_`
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Export Route Bhada Rates & Register
              </h2>
              <p className="text-xs text-slate-300">
                Filter freight records by Date, Route, Truck, Payment & Export to Excel CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* FILTER CONTROLS PANEL */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Filter Parameters</span>
                {isFiltered && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Filtered ({filteredRates.length}/{bhadaRates.length})
                  </span>
                )}
              </div>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Quick Date Presets Row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date:
              </span>
              {(['all', 'today', 'this_week', 'this_month', 'last_month', 'custom'] as DatePreset[]).map(preset => {
                const labels: Record<DatePreset, string> = {
                  all: 'All Time',
                  today: 'Today',
                  this_week: 'This Week',
                  this_month: 'This Month',
                  last_month: 'Last Month',
                  custom: 'Custom Range',
                };
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleDatePresetChange(preset)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      datePreset === preset
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {labels[preset]}
                  </button>
                );
              })}
            </div>

            {/* Main Filter Grid: Dates, Origin, Destination, Payment, Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {/* Date Inputs (When Custom or preset selected) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Origin Hub Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Origin / Loading Hub
                </label>
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">📍 All Origins ({uniqueOrigins.length})</option>
                  {uniqueOrigins.map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
              </div>

              {/* Destination Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Destination / Unloading
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">🎯 All Destinations ({uniqueDestinations.length})</option>
                  {uniqueDestinations.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>

              {/* Payment & Balance Status */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Payment & Balance
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">💳 All Payments</option>
                  <option value="has_balance">⚠️ Pending Balance Due (&gt; ₹0)</option>
                  <option value="zero_balance">✅ Fully Settled (₹0 Balance)</option>
                  <option value="has_advance">💵 Advance Collected</option>
                </select>
              </div>

              {/* Visibility / Access Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Access & Visibility
                </label>
                <select
                  value={selectedVisibility}
                  onChange={(e) => setSelectedVisibility(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">🌐 All Records</option>
                  <option value="admin_only">🔒 Admin Only</option>
                  <option value="all_users">👥 Visible to All Staff</option>
                  <option value="specific_users">⭐ Specific / Saved Users</option>
                </select>
              </div>

              {/* Text Search Across Truck / Party / LR */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Search Truck, Party, LR, Driver
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search truck no, party name, LR no..."
                    value={textSearch}
                    onChange={(e) => setTextSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {textSearch && (
                    <button
                      type="button"
                      onClick={() => setTextSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC FILTERED STATS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Filtered Trips
              </span>
              <p className="text-lg font-black text-slate-900">
                {filteredRates.length}{' '}
                <span className="text-xs font-normal text-slate-500">
                  / {bhadaRates.length}
                </span>
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-emerald-800">
                Total Freight Amount
              </span>
              <p className="text-lg font-black text-emerald-700">{formatINR(totalFreight)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-blue-800">
                Total Weight (MT)
              </span>
              <p className="text-lg font-black text-blue-700">{totalWeight.toFixed(2)} MT</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-amber-800">
                Total Balance Due
              </span>
              <p className="text-lg font-black text-amber-700">{formatINR(totalBalance)}</p>
            </div>
          </div>

          {/* TABLE PREVIEW */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Route</th>
                    <th className="p-2.5">Rate</th>
                    <th className="p-2.5">Weight</th>
                    <th className="p-2.5">Total Bhada</th>
                    <th className="p-2.5">Advance</th>
                    <th className="p-2.5">Balance Due</th>
                    <th className="p-2.5">Truck / Party</th>
                    <th className="p-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRates.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-xs text-slate-500 font-medium">
                        No freight records match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRates.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {b.originCity} ➔ {b.destinationCity}
                        </td>
                        <td className="p-2.5 font-semibold text-emerald-700">
                          {formatINR(b.ratePerUnit, false)}/{b.rateUnit}
                        </td>
                        <td className="p-2.5 text-slate-700 font-medium">
                          {b.weightTons ? `${b.weightTons} MT` : '-'}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {formatINR(b.totalBhadaAmount)}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {b.advanceAmount ? formatINR(b.advanceAmount) : '-'}
                        </td>
                        <td className="p-2.5 font-bold text-amber-700">
                          {b.balanceAmount ? formatINR(b.balanceAmount) : '₹0'}
                        </td>
                        <td className="p-2.5 text-slate-700">
                          <div className="font-bold uppercase">{b.truckNumber || '-'}</div>
                          {b.partyName && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                              {b.partyName}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500 whitespace-nowrap">
                          {formatDate(b.loadingDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTION FOOTER */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
            <button
              onClick={handleCopySummary}
              disabled={filteredRates.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Summary Copied!' : 'Copy WhatsApp Report'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={filteredRates.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Register ({filteredRates.length})</span>
              </button>

              <button
                onClick={() => exportToCSV(filteredRates)}
                disabled={filteredRates.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel CSV ({filteredRates.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
