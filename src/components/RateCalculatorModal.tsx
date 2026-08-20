import React, { useState } from 'react';
import { X, Calculator, IndianRupee, Truck, Fuel, ArrowRight, Copy, Check, Send } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface RateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToNewBhada: (calcResult: {
    ratePerUnit: number;
    weightTons: number;
    totalBhadaAmount: number;
    advanceAmount: number;
    tollTax: number;
    kantaCharges: number;
  }) => void;
}

export const RateCalculatorModal: React.FC<RateCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyToNewBhada,
}) => {
  const [ratePerTon, setRatePerTon] = useState<number>(850);
  const [weightTons, setWeightTons] = useState<number>(25);
  const [dieselPriceChange, setDieselPriceChange] = useState<number>(0);
  const [dieselImpactPerTon, setDieselImpactPerTon] = useState<number>(20); // e.g. ₹20 per ton per ₹1 diesel change
  const [tollAmount, setTollAmount] = useState<number>(1200);
  const [kantaAmount, setKantaAmount] = useState<number>(150);
  const [commissionAmount, setCommissionAmount] = useState<number>(1000);
  const [advancePercent, setAdvancePercent] = useState<number>(70);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const adjustedRatePerTon = Math.max(0, ratePerTon + (dieselPriceChange * dieselImpactPerTon));
  const baseFreight = Math.round(adjustedRatePerTon * weightTons);
  const totalGrossFreight = baseFreight; // Freight amount
  const suggestedAdvance = Math.round((totalGrossFreight * advancePercent) / 100);
  const driverCashInHand = Math.max(0, suggestedAdvance - tollAmount - kantaAmount);
  const estimatedBalance = Math.max(0, totalGrossFreight - suggestedAdvance);

  const handleApply = () => {
    onApplyToNewBhada({
      ratePerUnit: adjustedRatePerTon,
      weightTons,
      totalBhadaAmount: totalGrossFreight,
      advanceAmount: suggestedAdvance,
      tollTax: tollAmount,
      kantaCharges: kantaAmount,
    });
    onClose();
  };

  const handleCopyCalc = () => {
    const text = `📊 *ROUTE BHADA FREIGHT ESTIMATE*
------------------------------------
⚖️ Weight: ${weightTons} MT
💰 Rate: ${formatINR(adjustedRatePerTon, false)} / Ton
💵 Total Freight: ${formatINR(totalGrossFreight)}
💳 Recommended Advance (${advancePercent}%): ${formatINR(suggestedAdvance)}
🛣️ Toll + Kanta: ${formatINR(tollAmount + kantaAmount)}
🧾 Balance Due at Unloading: ${formatINR(estimatedBalance)}
------------------------------------
_Calculated via Transport & Freight Management_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Quick Bhada & Diesel Hike Calculator
              </h2>
              <p className="text-xs text-slate-300">
                Instant freight estimator with advance, toll & balance calculation
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base Rate / Ton (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={ratePerTon}
                  onChange={(e) => setRatePerTon(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weight in MT / Tons
              </label>
              <input
                type="number"
                step="0.1"
                value={weightTons}
                onChange={(e) => setWeightTons(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Diesel escalation row */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
              <Fuel className="w-4 h-4 text-amber-600" />
              <span>Diesel Price Escalation Adjustment</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Diesel Hike (₹/Litre)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={dieselPriceChange}
                  onChange={(e) => setDieselPriceChange(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Per Ton Impact (₹/₹1 hike)</label>
                <input
                  type="number"
                  value={dieselImpactPerTon}
                  onChange={(e) => setDieselImpactPerTon(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-slate-800"
                />
              </div>
            </div>
            {dieselPriceChange !== 0 && (
              <div className="mt-2 text-[11px] text-amber-800 font-semibold">
                Adjusted Rate: <span className="font-bold text-slate-900">{formatINR(adjustedRatePerTon, false)}/Ton</span> (Δ {dieselPriceChange > 0 ? '+' : ''}{formatINR(dieselPriceChange * dieselImpactPerTon, false)})
              </div>
            )}
          </div>

          {/* Toll, Kanta & Advance Split */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Est. Toll (₹)</label>
              <input
                type="number"
                value={tollAmount}
                onChange={(e) => setTollAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Kanta / Scale (₹)</label>
              <input
                type="number"
                value={kantaAmount}
                onChange={(e) => setKantaAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Advance %</label>
              <select
                value={advancePercent}
                onChange={(e) => setAdvancePercent(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
              >
                <option value={50}>50% Advance</option>
                <option value={60}>60% Advance</option>
                <option value={70}>70% Advance</option>
                <option value={80}>80% Advance</option>
                <option value={90}>90% Advance</option>
                <option value={100}>100% Full</option>
              </select>
            </div>
          </div>

          {/* Calculated Output Breakdown Card */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <span className="text-xs font-bold text-emerald-900 uppercase">Total Freight / Bhada:</span>
              <span className="text-xl font-black text-emerald-800">{formatINR(totalGrossFreight)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex justify-between text-slate-700">
                <span>Advance ({advancePercent}%):</span>
                <span className="font-bold">{formatINR(suggestedAdvance)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Balance Due at Unload:</span>
                <span className="font-bold text-amber-800">{formatINR(estimatedBalance)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Toll & Kanta:</span>
                <span className="font-semibold">{formatINR(tollAmount + kantaAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Driver Cash in Hand:</span>
                <span className="font-semibold text-emerald-700">{formatINR(driverCashInHand)}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleCopyCalc}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Estimate Copied!' : 'Copy Summary'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 rotate-45" />
                <span>Fill in Save Rate Form</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
