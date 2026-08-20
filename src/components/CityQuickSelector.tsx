import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X, Search, Sparkles, RotateCcw, ListPlus, ArrowRight } from 'lucide-react';
import { COMMON_CITIES } from '../utils/formatters';

interface CityQuickSelectorProps {
  label: string;
  type: 'origin' | 'destination';
  value: string;
  onChange: (city: string) => void;
  required?: boolean;
  placeholder?: string;
}

const DEFAULT_ORIGIN_CITIES = [
  'PADANA', 'DAHEJ', 'NIRMALA - MORBI', 'NIRMALA - PIPALIYA', 'SADBHAVNA - MORBI',
  'MORBI', 'BHACHAU', 'HALVAD', 'GANDHIDHAM', 'MUNDRA', 'KANDLA', 
  'SURAT', 'HAZIRA', 'AHMEDABAD', 'VADODARA', 'ANKLESHWAR', 'VAPI', 
  'RAJKOT', 'JAMNAGAR', 'BHAVNAGAR'
];

const DEFAULT_DEST_CITIES = [
  'BHACHAU', 'BEED', 'KALAMB', 'HALVAD', 'MUMBAI', 'PUNE',
  'NAGPUR', 'NASHIK', 'AURANGABAD', 'THANE', 'JAIPUR', 'KISHANGARH',
  'JODHPUR', 'UDAIPUR', 'INDORE', 'BHOPAL', 'DELHI', 'GURUGRAM',
  'PANIPAT', 'LUDHIANA', 'HYDERABAD', 'BENGALURU', 'CHENNAI', 'KOLKATA'
];

export const CityQuickSelector: React.FC<CityQuickSelectorProps> = ({
  label,
  type,
  value,
  onChange,
  required = true,
  placeholder = 'e.g. PADANA or BHACHAU',
}) => {
  const storageKey = type === 'origin' ? 'routebhada_quick_origin_cities' : 'routebhada_quick_dest_cities';
  const defaultList = type === 'origin' ? DEFAULT_ORIGIN_CITIES : DEFAULT_DEST_CITIES;

  // City list state
  const [cities, setCities] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultList;
  });

  // Save to localStorage whenever cities list changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cities));
    } catch (e) {
      console.error(e);
    }
  }, [cities, storageKey]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Add new city
  const handleAddCity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCityName.trim().toUpperCase();
    if (!trimmed) return;

    if (cities.some(c => c.toUpperCase() === trimmed)) {
      showStatus(`⚠️ "${trimmed}" already exists in the list!`);
      return;
    }

    const updated = [trimmed, ...cities];
    setCities(updated);
    setNewCityName('');
    showStatus(`✅ Added "${trimmed}" to Quick List!`);
  };

  // Start editing a city
  const handleStartEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditingValue(currentName);
  };

  // Save edited city
  const handleSaveEdit = (index: number) => {
    const trimmed = editingValue.trim().toUpperCase();
    if (!trimmed) {
      setEditingIndex(null);
      return;
    }

    // Check duplicate with another item
    const duplicate = cities.some((c, i) => i !== index && c.toUpperCase() === trimmed);
    if (duplicate) {
      showStatus(`⚠️ "${trimmed}" already exists in the list!`);
      return;
    }

    const oldName = cities[index];
    const updated = [...cities];
    updated[index] = trimmed;
    setCities(updated);
    setEditingIndex(null);
    setEditingValue('');

    // If currently selected value matches old name, update it too
    if (value.toUpperCase() === oldName.toUpperCase()) {
      onChange(trimmed);
    }

    showStatus(`✅ Modified "${oldName}" ➔ "${trimmed}"`);
  };

  // Delete a city
  const handleDeleteCity = (index: number) => {
    const cityName = cities[index];
    const updated = cities.filter((_, i) => i !== index);
    setCities(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    showStatus(`🗑️ Removed "${cityName}" from Quick List`);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm(`Reset ${type === 'origin' ? 'Origin' : 'Destination'} Quick List to default transport hubs?`)) {
      setCities(defaultList);
      showStatus(`🔄 Reset to default cities`);
    }
  };

  // Quick Select & Close
  const handleSelectCity = (city: string) => {
    onChange(city);
    setIsModalOpen(false);
  };

  // Filtered cities in modal
  const filteredCities = cities.filter(c => 
    c.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  // Top 5 quick chips for direct 1-click select on form
  const topQuickChips = cities.slice(0, 5);

  const isOrigin = type === 'origin';
  const themeColor = isOrigin ? 'amber' : 'emerald';

  return (
    <div className="space-y-1.5">
      {/* Label and Quick List button */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setSearchFilter('');
            setNewCityName('');
            setEditingIndex(null);
          }}
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
            isOrigin 
              ? 'text-amber-800 bg-amber-100 hover:bg-amber-200' 
              : 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200'
          }`}
          title="Open Quick List to Add, Modify or Delete cities"
        >
          <Sparkles className="w-3 h-3" />
          <span>⚡ Quick List ({cities.length})</span>
        </button>
      </div>

      {/* Input Box with MapPin icon and datalist */}
      <div className="relative">
        <MapPin 
          className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
            isOrigin ? 'text-amber-500' : 'text-emerald-500'
          }`} 
        />
        <input
          type="text"
          required={required}
          list={`${type}-quick-cities-list`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
        <datalist id={`${type}-quick-cities-list`}>
          {cities.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      {/* Instant 1-Click Select Quick Chips below input */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] text-slate-400 font-semibold uppercase">Fast:</span>
        {topQuickChips.map(c => {
          const isSelected = value.toUpperCase() === c.toUpperCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                isSelected
                  ? isOrigin
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              {c}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer pl-1"
        >
          + More / Manage...
        </button>
      </div>

      {/* QUICK LIST MANAGE MODAL (Add, Modify, Delete) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className={`px-5 py-3.5 text-white flex items-center justify-between ${
              isOrigin ? 'bg-amber-800' : 'bg-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    {isOrigin ? 'Origin Cities / Loading Hubs' : 'Destination Cities / Unloading Points'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Quick List: Add, Modify (Edit) & Delete Locations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Alert Toast inside modal */}
            {statusMessage && (
              <div className="bg-slate-900 text-white text-xs font-bold py-2 px-4 text-center transition-all animate-in slide-in-from-top-2">
                {statusMessage}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* 1. Add New City Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  + Add New City to {isOrigin ? 'Origin' : 'Destination'} List
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. MORBI CERAMIC ZONE or DAHEJ GIDC"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCity();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCity()}
                    disabled={!newCityName.trim()}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-white transition-all cursor-pointer disabled:opacity-50 ${
                      isOrigin ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* 2. Search Box & Stats */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search among ${cities.length} cities...`}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Reset to default city list"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>

              {/* 3. Cities List with Edit & Delete options */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredCities.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No cities matching "{searchFilter}". Type above to add it!
                  </div>
                ) : (
                  filteredCities.map((cityName) => {
                    const originalIndex = cities.findIndex(c => c === cityName);
                    const isEditing = editingIndex === originalIndex;
                    const isCurrentlySelected = value.toUpperCase() === cityName.toUpperCase();

                    return (
                      <div
                        key={cityName}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                          isCurrentlySelected
                            ? isOrigin
                              ? 'bg-amber-50 border-amber-300'
                              : 'bg-emerald-50 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value.toUpperCase())}
                              autoFocus
                              className="flex-1 px-2.5 py-1 text-xs font-bold uppercase bg-white border border-blue-400 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(originalIndex)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                              title="Save modification"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div
                            onClick={() => handleSelectCity(cityName)}
                            className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                          >
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${
                              isCurrentlySelected
                                ? isOrigin ? 'text-amber-600' : 'text-emerald-600'
                                : 'text-slate-400'
                            }`} />
                            <span className="text-xs font-bold text-slate-800 uppercase truncate">
                              {cityName}
                            </span>
                            {isCurrentlySelected && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                isOrigin ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                              }`}>
                                Current
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons: Select, Modify, Delete */}
                        {!isEditing && (
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {/* 1. Quick Select Button */}
                            <button
                              type="button"
                              onClick={() => handleSelectCity(cityName)}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                                isCurrentlySelected
                                  ? isOrigin
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                              }`}
                              title="Select this city"
                            >
                              Select
                            </button>

                            {/* 2. Modify Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(originalIndex, cityName)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                              title="Modify / Rename city"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCity(originalIndex)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete city from Quick List"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>{cities.length} cities available in quick list</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
