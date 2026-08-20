import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Check, X, Search, Sparkles, RotateCcw, Boxes, CheckCircle2 } from 'lucide-react';
import { MATERIAL_TYPES } from '../utils/formatters';
import { subscribeToMetadata, saveMetadataToFirestore } from '../firebase';

interface MaterialQuickSelectorProps {
  label?: string;
  value: string;
  onChange: (material: string) => void;
  required?: boolean;
  placeholder?: string;
}

const DEFAULT_MATERIALS = [
  'Bentonite Powder',
  'Industrial Refined Salt',
  'Plastic Granules / Polymers',
  'Soda Ash in Bags',
  'Vitrified Wall & Floor Tiles',
  'Sanitaryware & Ceramics',
  'Steel Plates / Coils / TMT Bars',
  'Edible Refined Oil (Tins/Drums)',
  'Cement & Clinker',
  'Chemical Liquid / Solid in Drums',
  'Cotton Bales / Yarns',
  'Agricultural Grains & Wheat',
  'Coal & Petcoke',
  'Fertilizers / Urea in Bags',
  'Heavy Machinery & Equipment',
  'Paper Rolls / Corrugated Boxes',
  'Scrap Metal / Iron Scrap',
  'Timber / Plywood',
  'FMCG Packaged Goods'
];

export const MaterialQuickSelector: React.FC<MaterialQuickSelectorProps> = ({
  label = 'Material / Commodity',
  value,
  onChange,
  required = false,
  placeholder = 'e.g. Bentonite Powder, Tiles, Salt...',
}) => {
  const storageKey = 'routebhada_quick_materials_list';

  // Materials list state backed by localStorage and Firestore
  const [materials, setMaterials] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading materials quick list', e);
    }
    return DEFAULT_MATERIALS;
  });

  // Subscribe to real-time custom commodities in Firestore
  useEffect(() => {
    const unsub = subscribeToMetadata((meta) => {
      if (meta.customMaterials && Array.isArray(meta.customMaterials) && meta.customMaterials.length > 0) {
        setMaterials(meta.customMaterials);
      }
    });
    return () => unsub();
  }, []);

  // Save to localStorage & Firestore whenever materials list changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(materials));
      saveMetadataToFirestore({ customMaterials: materials }).catch(console.error);
    } catch (e) {
      console.error('Error saving materials list to storage', e);
    }
  }, [materials]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Add new material
  const handleAddMaterial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newMaterialName.trim();
    if (!trimmed) return;

    if (materials.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      showStatus(`⚠️ "${trimmed}" already exists in the list!`);
      return;
    }

    const updated = [trimmed, ...materials];
    setMaterials(updated);
    setNewMaterialName('');
    showStatus(`✅ Added "${trimmed}" to Materials Quick List!`);
  };

  // Start editing a material
  const handleStartEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditingValue(currentName);
  };

  // Save edited material
  const handleSaveEdit = (index: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setEditingIndex(null);
      return;
    }

    // Check duplicate with another item
    const duplicate = materials.some((m, i) => i !== index && m.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      showStatus(`⚠️ "${trimmed}" already exists in the list!`);
      return;
    }

    const oldName = materials[index];
    const updated = [...materials];
    updated[index] = trimmed;
    setMaterials(updated);
    setEditingIndex(null);
    setEditingValue('');

    // If currently selected value matches old name, update it too
    if (value.toLowerCase() === oldName.toLowerCase()) {
      onChange(trimmed);
    }

    showStatus(`✅ Modified "${oldName}" ➔ "${trimmed}"`);
  };

  // Delete a material
  const handleDeleteMaterial = (index: number) => {
    const matName = materials[index];
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    showStatus(`🗑️ Removed "${matName}" from Quick List`);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Reset Material / Commodity Quick List to default industry items?')) {
      setMaterials(DEFAULT_MATERIALS);
      showStatus(`🔄 Reset to default commodities`);
    }
  };

  // Quick Select & Close
  const handleSelectMaterial = (mat: string) => {
    onChange(mat);
    setIsModalOpen(false);
  };

  // Filtered materials in modal
  const filteredMaterials = materials.filter(m => 
    m.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  // Top 5 quick chips for direct 1-click select on form
  const topQuickChips = materials.slice(0, 5);

  return (
    <div className="space-y-1.5">
      {/* Label and Quick List button */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setSearchFilter('');
            setNewMaterialName('');
            setEditingIndex(null);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors text-indigo-800 bg-indigo-100 hover:bg-indigo-200"
          title="Open Quick List to Add, Modify or Delete materials/commodities"
        >
          <Sparkles className="w-3 h-3" />
          <span>⚡ Quick List ({materials.length})</span>
        </button>
      </div>

      {/* Input Box with Package icon and datalist */}
      <div className="relative">
        <Package className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
        <input
          type="text"
          required={required}
          list="materials-quick-list"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        />
        <datalist id="materials-quick-list">
          {materials.map(m => <option key={m} value={m} />)}
        </datalist>
      </div>

      {/* Instant 1-Click Select Quick Chips below input */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] text-slate-400 font-semibold uppercase">Fast:</span>
        {topQuickChips.map(m => {
          const isSelected = value.toLowerCase() === m.toLowerCase();
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer truncate max-w-[140px] ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
              title={m}
            >
              {m}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer pl-1"
        >
          + More / Manage...
        </button>
      </div>

      {/* QUICK LIST MANAGE MODAL (Add, Modify, Delete) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 text-white flex items-center justify-between bg-indigo-900">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Boxes className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    Material / Commodity Quick List
                  </h3>
                  <p className="text-[11px] text-indigo-200">
                    Add new materials, modify names, or delete obsolete goods
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
              {/* 1. Add New Material Section */}
              <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Add New Material / Commodity
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Package className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Ceramic Tiles, Soda Ash, Cotton..."
                      value={newMaterialName}
                      onChange={(e) => setNewMaterialName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMaterial();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMaterial()}
                    disabled={!newMaterialName.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* 2. Search & Total count bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search saved materials..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:underline px-2 py-1 cursor-pointer shrink-0"
                  title="Reset to default commodity list"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* 3. Materials List (With 1-Click Select, Edit, and Delete) */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredMaterials.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No materials found matching "{searchFilter}".
                  </div>
                ) : (
                  filteredMaterials.map((mat, index) => {
                    const originalIndex = materials.indexOf(mat);
                    const isCurrentSelected = value.toLowerCase() === mat.toLowerCase();
                    const isEditing = editingIndex === originalIndex;

                    return (
                      <div
                        key={`${mat}-${index}`}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                          isCurrentSelected 
                            ? 'bg-indigo-50/80 border-indigo-300' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isEditing ? (
                          // Inline Edit Mode
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              autoFocus
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(originalIndex);
                                if (e.key === 'Escape') setEditingIndex(null);
                              }}
                              className="flex-1 px-2.5 py-1 text-xs font-semibold bg-white border-2 border-indigo-500 rounded text-slate-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(originalIndex)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                              title="Save Changes"
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
                          // Normal Display Mode
                          <>
                            <button
                              type="button"
                              onClick={() => handleSelectMaterial(mat)}
                              className="flex items-center gap-2 text-left flex-1 hover:text-indigo-700 cursor-pointer min-w-0 pr-2"
                            >
                              <Package className={`w-3.5 h-3.5 shrink-0 ${
                                isCurrentSelected ? 'text-indigo-600 font-bold' : 'text-slate-400'
                              }`} />
                              <span className={`text-xs truncate ${
                                isCurrentSelected ? 'font-black text-indigo-900' : 'font-semibold text-slate-800'
                              }`}>
                                {mat}
                              </span>
                              {isCurrentSelected && (
                                <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                                  Selected
                                </span>
                              )}
                            </button>

                            {/* Action Buttons: Select, Edit, Delete */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSelectMaterial(mat)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                  isCurrentSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800'
                                }`}
                              >
                                Select
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(originalIndex, mat)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Edit/Modify material name"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(originalIndex)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Delete from quick list"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Total: <strong className="text-slate-800">{materials.length}</strong> items
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
