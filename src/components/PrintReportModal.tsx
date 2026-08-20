import React, { useState, useMemo } from 'react';
import { 
  X, Printer, Download, FileText, Filter, Calendar, 
  MapPin, Check, Share2, Layers, Shield, Eye
} from 'lucide-react';
import { BhadaRate, UserAccount } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bhadaRates: BhadaRate[];
  currentUser?: UserAccount | null;
  initialSearchQuery?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  bhadaRates,
  currentUser,
  initialSearchQuery = '',
}) => {
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeDriverDetails, setIncludeDriverDetails] = useState(true);
  const [includeRemarks, setIncludeRemarks] = useState(false);
  const [reportTitle, setReportTitle] = useState('Route Freight Rates & Trip Register Report');

  // Filtered rates derived from bhadaRates passed from current view
  const rates = bhadaRates;

  // Calculate aggregate metrics
  const totalWeight = useMemo(() => {
    return rates.reduce((sum, r) => sum + (r.weightTons || 0), 0);
  }, [rates]);

  const totalFreight = useMemo(() => {
    return rates.reduce((sum, r) => sum + (r.totalBhadaAmount || 0), 0);
  }, [rates]);

  const totalAdvance = useMemo(() => {
    return rates.reduce((sum, r) => sum + (r.advanceAmount || 0), 0);
  }, [rates]);

  const totalBalance = useMemo(() => {
    return rates.reduce((sum, r) => sum + (r.balanceAmount || 0), 0);
  }, [rates]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        {/* Top Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Print Freight Rates & PDF Report
              </h2>
              <p className="text-xs text-slate-300">
                Generate and print / save as PDF with real-time filtered routes & totals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Options Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-700">Display Columns:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
              <input
                type="checkbox"
                checked={includeFinancials}
                onChange={(e) => setIncludeFinancials(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Advance & Balance Details</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
              <input
                type="checkbox"
                checked={includeDriverDetails}
                onChange={(e) => setIncludeDriverDetails(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Driver Contact & LR No.</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
              <input
                type="checkbox"
                checked={includeRemarks}
                onChange={(e) => setIncludeRemarks(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Remarks / Instructions</span>
            </label>
          </div>

          <div className="text-slate-500 font-medium">
            Showing <strong className="text-blue-700 font-bold">{rates.length}</strong> routes
          </div>
        </div>

        {/* Live Printable Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-slate-200 text-slate-900 max-w-4xl mx-auto">
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  TRANSPORT & FREIGHT MANAGEMENT
                </h1>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  {reportTitle}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Generated On: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • User: {currentUser?.name || 'Administrator'}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  Official Freight Statement
                </span>
                {initialSearchQuery && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Filter: "{initialSearchQuery}"
                  </p>
                )}
              </div>
            </div>

            {/* Document KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Trips</span>
                <span className="text-sm font-extrabold text-slate-800">{rates.length}</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Weight</span>
                <span className="text-sm font-extrabold text-slate-800">{totalWeight.toFixed(2)} MT</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Freight</span>
                <span className="text-sm font-extrabold text-blue-700">{formatINR(totalFreight)}</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Advance</span>
                <span className="text-sm font-extrabold text-emerald-700">{formatINR(totalAdvance)}</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Balance Due</span>
                <span className="text-sm font-extrabold text-rose-700">{formatINR(totalBalance)}</span>
              </div>
            </div>

            {/* Rates Table */}
            {rates.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-bold">No routes match the current filter</p>
                <p className="text-xs mt-1">Try clearing your search query or selecting All Items</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Route (Origin ➔ Destination)</th>
                      <th className="py-2.5 px-2">Truck No & Type</th>
                      <th className="py-2.5 px-2">Party / Customer</th>
                      {includeDriverDetails && <th className="py-2.5 px-2">Driver / LR</th>}
                      <th className="py-2.5 px-2 text-right">Weight</th>
                      <th className="py-2.5 px-2 text-right">Rate</th>
                      <th className="py-2.5 px-2 text-right">Total Bhada</th>
                      {includeFinancials && (
                        <>
                          <th className="py-2.5 px-2 text-right">Advance</th>
                          <th className="py-2.5 px-2 text-right">Balance</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rates.map((b, idx) => (
                      <tr 
                        key={b.id || idx} 
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                      >
                        <td className="py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 whitespace-nowrap text-slate-700 font-medium">
                          {b.loadingDate ? formatDate(b.loadingDate) : 'N/A'}
                        </td>
                        <td className="py-2 px-2">
                          <span className="font-bold text-slate-900">{b.originCity}</span>
                          <span className="text-slate-400 mx-1">➔</span>
                          <span className="font-bold text-blue-700">{b.destinationCity}</span>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{b.truckNumber || 'N/A'}</div>
                          {b.truckType && <div className="text-[10px] text-slate-500">{b.truckType}</div>}
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-semibold text-slate-800">{b.partyName || '—'}</div>
                          {b.materialType && <div className="text-[10px] text-slate-500">{b.materialType}</div>}
                        </td>
                        {includeDriverDetails && (
                          <td className="py-2 px-2 whitespace-nowrap">
                            <div className="text-slate-700">{b.driverName || '—'}</div>
                            <div className="text-[10px] text-slate-500">
                              {b.driverPhone ? `📞 ${b.driverPhone}` : ''} 
                              {b.lrNumber ? ` • LR: ${b.lrNumber}` : ''}
                            </div>
                          </td>
                        )}
                        <td className="py-2 px-2 text-right font-medium whitespace-nowrap">
                          {b.weightTons ? `${b.weightTons} MT` : '—'}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold text-slate-700 whitespace-nowrap">
                          {formatINR(b.ratePerUnit, false)} / {b.rateUnit}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatINR(b.totalBhadaAmount)}
                        </td>
                        {includeFinancials && (
                          <>
                            <td className="py-2 px-2 text-right text-emerald-700 font-semibold whitespace-nowrap">
                              {b.advanceAmount ? formatINR(b.advanceAmount) : '₹0'}
                            </td>
                            <td className="py-2 px-2 text-right font-bold whitespace-nowrap">
                              <span className={(b.balanceAmount || 0) > 0 ? 'text-rose-600' : 'text-slate-500'}>
                                {formatINR(b.balanceAmount || 0)}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals Footer Row */}
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                      <td colSpan={includeDriverDetails ? 6 : 5} className="py-2.5 px-3 text-right uppercase text-[11px]">
                        Total Summary ({rates.length} Trips):
                      </td>
                      <td className="py-2.5 px-2 text-right whitespace-nowrap">
                        {totalWeight.toFixed(2)} MT
                      </td>
                      <td className="py-2.5 px-2 text-right">—</td>
                      <td className="py-2.5 px-2 text-right text-blue-800 whitespace-nowrap">
                        {formatINR(totalFreight)}
                      </td>
                      {includeFinancials && (
                        <>
                          <td className="py-2.5 px-2 text-right text-emerald-700 whitespace-nowrap">
                            {formatINR(totalAdvance)}
                          </td>
                          <td className="py-2.5 px-2 text-right text-rose-700 whitespace-nowrap">
                            {formatINR(totalBalance)}
                          </td>
                        </>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <span>Transport & Freight Management</span>
              <span className="font-bold text-slate-700">Design By Azazmadkiya</span>
              <span>Confidential & Authorized Use Only</span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
