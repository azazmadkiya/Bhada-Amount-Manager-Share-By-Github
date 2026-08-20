import React, { useState } from 'react';
import { X, History, MapPin, TrendingUp, TrendingDown, ArrowRight, Truck, Calendar } from 'lucide-react';
import { BhadaRate } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface RouteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bhadaRates: BhadaRate[];
  onSelectRouteForQuote: (origin: string, dest: string, rate: number) => void;
}

export const RouteHistoryModal: React.FC<RouteHistoryModalProps> = ({
  isOpen,
  onClose,
  bhadaRates,
  onSelectRouteForQuote,
}) => {
  // Get unique routes
  const routesMap = new Map<string, BhadaRate[]>();
  bhadaRates.forEach((b) => {
    const key = `${b.originCity} ➔ ${b.destinationCity}`;
    if (!routesMap.has(key)) {
      routesMap.set(key, []);
    }
    routesMap.get(key)!.push(b);
  });

  const routesList = Array.from(routesMap.entries()).map(([key, items]) => {
    const rates = items.map((i) => i.ratePerUnit);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const avgRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    const latestItem = items[0];
    return {
      key,
      origin: latestItem.originCity,
      destination: latestItem.destinationCity,
      count: items.length,
      minRate,
      maxRate,
      avgRate,
      items,
      unit: latestItem.rateUnit,
    };
  });

  const [selectedRouteKey, setSelectedRouteKey] = useState<string>(
    routesList.length > 0 ? routesList[0].key : ''
  );

  if (!isOpen) return null;

  const currentRoute = routesList.find((r) => r.key === selectedRouteKey) || routesList[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-[#0f172a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 rounded-lg text-white">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Route Bhada Rate History & Trends
              </h2>
              <p className="text-xs text-slate-300">
                Compare city-to-city historical freight rates and quotes
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {routesList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No saved route rates yet. Save a bhada rate to see historical trends.
            </div>
          ) : (
            <>
              {/* Route Selector pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Active Freight Corridor:
                </label>
                <div className="flex flex-wrap gap-2">
                  {routesList.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setSelectedRouteKey(r.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedRouteKey === r.key
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {r.key} <span className="opacity-80 font-normal">({r.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {currentRoute && (
                <div className="space-y-4">
                  {/* Route Summary Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Average Rate</div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {formatINR(currentRoute.avgRate, false)} <span className="text-xs font-normal">/{currentRoute.unit}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-emerald-800">Lowest Rate</div>
                      <div className="text-base font-black text-emerald-700 mt-0.5">
                        {formatINR(currentRoute.minRate, false)}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-amber-800">Highest Rate</div>
                      <div className="text-base font-black text-amber-700 mt-0.5">
                        {formatINR(currentRoute.maxRate, false)}
                      </div>
                    </div>
                  </div>

                  {/* Trip list for this route */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Historical Trips on this Route:
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {currentRoute.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between hover:border-blue-300 transition-colors text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.truckNumber || 'Truck Unassigned'}</span>
                              {item.lrNumber && <span className="text-slate-500">LR: {item.lrNumber}</span>}
                              {item.weightTons && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700">{item.weightTons} MT</span>}
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-2">
                              <span>{formatDate(item.loadingDate)}</span>
                              {item.partyName && <span>• {item.partyName}</span>}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-black text-slate-900 text-sm">
                              {formatINR(item.ratePerUnit, false)} / {item.rateUnit}
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-700">
                              Total: {formatINR(item.totalBhadaAmount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
