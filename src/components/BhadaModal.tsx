import React, { useState, useEffect } from 'react';
import { 
  X, Send, MapPin, Truck, IndianRupee, FileText, Calendar, 
  User, Phone
} from 'lucide-react';
import { BhadaRate, RateUnit, AccessVisibility, UserAccessRight, UserAccount } from '../types';
import { COMMON_CITIES, TRUCK_TYPES, MATERIAL_TYPES } from '../utils/formatters';
import { AccessRightsSelector } from './AccessRightsSelector';
import { CityQuickSelector } from './CityQuickSelector';
import { MaterialQuickSelector } from './MaterialQuickSelector';

interface BhadaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bhada: Partial<BhadaRate>) => void;
  initialData?: BhadaRate | null;
  currentUser: UserAccount | null;
  users: UserAccount[];
}

export const BhadaModal: React.FC<BhadaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
  users,
}) => {
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState<number | ''>(500);
  const [rateUnit, setRateUnit] = useState<RateUnit>('Ton');
  const [weightTons, setWeightTons] = useState<number | ''>(30);
  const [totalBhadaAmount, setTotalBhadaAmount] = useState<number | ''>(15000);
  const [isManualTotal, setIsManualTotal] = useState(false);

  const [truckNumber, setTruckNumber] = useState('');
  const [truckType, setTruckType] = useState('14 Wheeler Multi-axle (28-31 MT)');
  const [partyName, setPartyName] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [loadingDate, setLoadingDate] = useState(new Date().toISOString().slice(0, 10));
  const [materialType, setMaterialType] = useState('Bentonite Powder');
  
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [remarks, setRemarks] = useState('');

  // Access rights & visibility state
  const [visibility, setVisibility] = useState<AccessVisibility>('all_users');
  const [userAccessRights, setUserAccessRights] = useState<UserAccessRight[]>([]);

  useEffect(() => {
    if (initialData) {
      setOriginCity(initialData.originCity || '');
      setDestinationCity(initialData.destinationCity || '');
      setRatePerUnit(initialData.ratePerUnit ?? '');
      setRateUnit(initialData.rateUnit || 'Ton');
      setWeightTons(initialData.weightTons ?? '');
      setTotalBhadaAmount(initialData.totalBhadaAmount ?? '');
      setIsManualTotal(false);
      setTruckNumber(initialData.truckNumber || '');
      setTruckType(initialData.truckType || '');
      setPartyName(initialData.partyName || '');
      setLrNumber(initialData.lrNumber || '');
      setLoadingDate(initialData.loadingDate || new Date().toISOString().slice(0, 10));
      setMaterialType(initialData.materialType || '');
      setDriverName(initialData.driverName || '');
      setDriverPhone(initialData.driverPhone || '');
      setRemarks(initialData.remarks || '');
      setVisibility(initialData.visibility || (currentUser?.role === 'ADMIN' ? 'all_users' : 'all_users'));
      setUserAccessRights(initialData.userAccessRights || []);
    } else {
      setOriginCity('PADANA');
      setDestinationCity('BHACHAU');
      setRatePerUnit(500);
      setRateUnit('Ton');
      setWeightTons(30);
      setTotalBhadaAmount(15000);
      setIsManualTotal(false);
      setTruckNumber('');
      setTruckType('14 Wheeler Multi-axle (28-31 MT)');
      setPartyName('');
      setLrNumber('');
      setLoadingDate(new Date().toISOString().slice(0, 10));
      setMaterialType('Bentonite Powder');
      setDriverName('');
      setDriverPhone('');
      setRemarks('');
      setVisibility(currentUser?.role === 'ADMIN' ? 'admin_only' : 'all_users');
      setUserAccessRights([]);
    }
  }, [initialData, isOpen, currentUser]);

  // Auto-calculate Total Bhada when rate or weight changes if not manually overridden
  useEffect(() => {
    if (!isManualTotal && ratePerUnit !== '') {
      const rate = Number(ratePerUnit);
      if (rateUnit === 'Ton' || rateUnit === 'MT') {
        const weight = weightTons !== '' ? Number(weightTons) : 1;
        setTotalBhadaAmount(Math.round(rate * weight));
      } else if (rateUnit === 'Trip' || rateUnit === 'Lumpsum') {
        setTotalBhadaAmount(rate);
      } else if (rateUnit === 'Quintal') {
        const weight = weightTons !== '' ? Number(weightTons) : 1;
        setTotalBhadaAmount(Math.round(rate * weight * 10));
      }
    }
  }, [ratePerUnit, weightTons, rateUnit, isManualTotal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCity.trim() || !destinationCity.trim() || ratePerUnit === '') {
      return;
    }

    const allowedUserIds = visibility === 'specific_users' 
      ? userAccessRights.map(r => r.userId) 
      : undefined;

    const payload: Partial<BhadaRate> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      type: 'bhada',
      originCity: originCity.trim().toUpperCase(),
      destinationCity: destinationCity.trim().toUpperCase(),
      ratePerUnit: Number(ratePerUnit),
      rateUnit,
      weightTons: weightTons !== '' ? Number(weightTons) : undefined,
      totalBhadaAmount: Number(totalBhadaAmount) || 0,
      truckNumber: truckNumber.trim().toUpperCase(),
      truckType,
      partyName: partyName.trim(),
      lrNumber: lrNumber.trim(),
      loadingDate,
      materialType: materialType.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      remarks: remarks.trim(),
      // Access Control
      createdByUserId: initialData?.createdByUserId || currentUser?.id,
      createdByName: initialData?.createdByName || currentUser?.name,
      createdByRole: initialData?.createdByRole || currentUser?.role,
      visibility: currentUser?.role === 'ADMIN' ? visibility : 'all_users',
      allowedUserIds: currentUser?.role === 'ADMIN' ? allowedUserIds : undefined,
      userAccessRights: currentUser?.role === 'ADMIN' ? userAccessRights : undefined,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0f172a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Send className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {initialData ? 'Edit Route Bhada Rate' : 'Save City-to-City Bhada Rate'}
              </h2>
              <p className="text-xs text-slate-300">
                Record freight rate, route, vehicle, and set who can view this entry
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* User Access & Rights Selector (Visible especially for Admin) */}
          <AccessRightsSelector
            currentUser={currentUser}
            users={users}
            visibility={visibility}
            onChangeVisibility={setVisibility}
            userAccessRights={userAccessRights}
            onChangeUserAccessRights={setUserAccessRights}
          />

          {/* 1. Origin & Destination Row with Quick List Add, Modify, Delete */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Origin City / Loading Hub with Quick List */}
              <CityQuickSelector
                label="Origin City / Loading Hub *"
                type="origin"
                value={originCity}
                onChange={setOriginCity}
                placeholder="e.g. PADANA, DAHEJ, MORBI"
              />

              {/* Destination City / Unloading Point with Quick List */}
              <CityQuickSelector
                label="Destination City / Unloading Point *"
                type="destination"
                value={destinationCity}
                onChange={setDestinationCity}
                placeholder="e.g. BHACHAU, BEED, HALVAD"
              />
            </div>
          </div>

          {/* 2. Freight & Rate Calculation */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <label className="block text-xs font-black uppercase text-emerald-900 tracking-wider mb-2 flex items-center justify-between">
              <span>Freight / Bhada Amount Calculation *</span>
              <span className="text-[10px] text-emerald-700 font-medium">Auto calculates based on Rate × Weight</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                  Rate Per Unit (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="500"
                    value={ratePerUnit}
                    onChange={(e) => {
                      setRatePerUnit(e.target.value === '' ? '' : Number(e.target.value));
                      setIsManualTotal(false);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                  Unit
                </label>
                <select
                  value={rateUnit}
                  onChange={(e) => {
                    setRateUnit(e.target.value as RateUnit);
                    setIsManualTotal(false);
                  }}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Ton">Per Ton / MT</option>
                  <option value="Trip">Per Trip (Fixed)</option>
                  <option value="Lumpsum">Lumpsum Freight</option>
                  <option value="Quintal">Per Quintal</option>
                  <option value="Bag">Per Bag</option>
                  <option value="Kg">Per Kg</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                  Weight (in Tons/MT)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="30.62"
                  value={weightTons}
                  onChange={(e) => {
                    setWeightTons(e.target.value === '' ? '' : Number(e.target.value));
                    setIsManualTotal(false);
                  }}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-emerald-900 mb-1 flex items-center justify-between">
                  <span>Total Bhada (₹) *</span>
                  {isManualTotal && <span className="text-[9px] text-amber-700 bg-amber-100 px-1 rounded">Manual</span>}
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-800 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="15310"
                    value={totalBhadaAmount}
                    onChange={(e) => {
                      setTotalBhadaAmount(e.target.value === '' ? '' : Number(e.target.value));
                      setIsManualTotal(true);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border-2 border-emerald-500 rounded-lg text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Truck & Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Truck Number (e.g. GJ-07TU-9190)
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="GJ-07TU-9190"
                  value={truckNumber}
                  onChange={(e) => setTruckNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Truck Type / Capacity
              </label>
              <input
                type="text"
                list="truck-types"
                placeholder="14 Wheeler Trailer"
                value={truckType}
                onChange={(e) => setTruckType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="truck-types">
                {TRUCK_TYPES.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Loading / Trip Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={loadingDate}
                  onChange={(e) => setLoadingDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Party & LR Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Party / Consignor / Shipper
              </label>
              <input
                type="text"
                placeholder="e.g. Jay Ambe Minerals, Adani"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                LR / Bilty / Challan No.
              </label>
              <input
                type="text"
                placeholder="e.g. RR/AUG/4, CBT/AUG/6"
                value={lrNumber}
                onChange={(e) => setLrNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold uppercase text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Material / Commodity Quick Selector (Add, Modify, Delete) */}
          <MaterialQuickSelector
            label="Material / Commodity"
            value={materialType}
            onChange={setMaterialType}
            placeholder="e.g. Bentonite Powder, Vitrified Tiles, Soda Ash..."
          />

          {/* 6. Driver Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Driver Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Driver Mobile No.
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="9825109921"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 6. Remarks / Special Instructions */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Transport Remarks / Unloading Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Goods for ceramic plant unloading before 6 PM. Tarpaulin required."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 rotate-45" />
              <span>{initialData ? 'Update Bhada Rate' : 'Save Bhada Rate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
