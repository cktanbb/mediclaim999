import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  DollarSign, 
  FileText, 
  Plus, 
  Sparkles, 
  Calendar, 
  Tag, 
  Receipt,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { MedicalRecordInput, MedicalRecord } from '../types/claim';
import { 
  COMMON_ILLNESS_SUGGESTIONS, 
  COMMON_CLINIC_SUGGESTIONS, 
  CLAIM_CATEGORIES 
} from '../utils/sampleData';

interface ClaimFormProps {
  onAddRecord: (record: MedicalRecordInput) => void;
  existingRecords: MedicalRecord[];
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ onAddRecord, existingRecords }) => {
  // Form fields
  const [employeeName, setEmployeeName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [subTotalStr, setSubTotalStr] = useState('');
  const [gstStr, setGstStr] = useState('');
  const [grandTotalStr, setGrandTotalStr] = useState('');
  const [illnessSummary, setIllnessSummary] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('General Practitioner (GP)');
  const [receiptNo, setReceiptNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // GST mode: 'percent-9', 'percent-0', 'percent-8', or 'custom'
  const [gstMode, setGstMode] = useState<'percent-9' | 'percent-0' | 'percent-8' | 'custom'>('percent-9');
  const [justAdded, setJustAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derive known employee names for quick selection
  const knownEmployees = Array.from(new Set(existingRecords.map(r => r.employeeName.trim()))).filter(Boolean);

  // Recalculate GST & Grand Total when Sub-Total or gstMode changes
  useEffect(() => {
    if (gstMode === 'custom') return;

    const sub = parseFloat(subTotalStr);
    if (!isNaN(sub) && sub >= 0) {
      let rate = 0.09;
      if (gstMode === 'percent-0') rate = 0;
      if (gstMode === 'percent-8') rate = 0.08;

      const calculatedGST = Math.round(sub * rate * 100) / 100;
      const calculatedGrand = Math.round((sub + calculatedGST) * 100) / 100;

      setGstStr(calculatedGST.toFixed(2));
      setGrandTotalStr(calculatedGrand.toFixed(2));
    } else if (subTotalStr === '') {
      setGstStr('');
      setGrandTotalStr('');
    }
  }, [subTotalStr, gstMode]);

  // Handle manual Sub-Total change
  const handleSubTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSubTotalStr(val);
    setErrorMsg(null);
  };

  // Handle manual GST change
  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGstStr(val);
    setGstMode('custom');
    setErrorMsg(null);

    const sub = parseFloat(subTotalStr) || 0;
    const gst = parseFloat(val);
    if (!isNaN(gst)) {
      setGrandTotalStr((sub + gst).toFixed(2));
    }
  };

  // Handle manual Grand Total change
  const handleGrandTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGrandTotalStr(val);
    setGstMode('custom');
    setErrorMsg(null);

    const sub = parseFloat(subTotalStr) || 0;
    const grand = parseFloat(val);
    if (!isNaN(grand) && !isNaN(sub) && grand >= sub) {
      setGstStr((grand - sub).toFixed(2));
    }
  };

  // Apply GST preset
  const applyGstPreset = (mode: 'percent-9' | 'percent-0' | 'percent-8') => {
    setGstMode(mode);
    const sub = parseFloat(subTotalStr);
    if (!isNaN(sub) && sub >= 0) {
      let rate = 0.09;
      if (mode === 'percent-0') rate = 0;
      if (mode === 'percent-8') rate = 0.08;
      const calculatedGST = Math.round(sub * rate * 100) / 100;
      const calculatedGrand = Math.round((sub + calculatedGST) * 100) / 100;
      setGstStr(calculatedGST.toFixed(2));
      setGrandTotalStr(calculatedGrand.toFixed(2));
    }
  };

  // Reset form
  const handleReset = () => {
    setEmployeeName('');
    setClinicName('');
    setSubTotalStr('');
    setGstStr('');
    setGrandTotalStr('');
    setIllnessSummary('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategory('General Practitioner (GP)');
    setReceiptNo('');
    setRemarks('');
    setGstMode('percent-9');
    setErrorMsg(null);
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields validation
    if (!employeeName.trim()) {
      setErrorMsg('Please enter the Name of Employee.');
      return;
    }
    if (!clinicName.trim()) {
      setErrorMsg('Please enter the Clinic Name.');
      return;
    }
    const subNum = parseFloat(subTotalStr);
    if (isNaN(subNum) || subNum < 0) {
      setErrorMsg('Please enter a valid Sub-Total amount.');
      return;
    }
    const gstNum = parseFloat(gstStr) || 0;
    const grandTotalNum = parseFloat(grandTotalStr) || (subNum + gstNum);

    // Feature 2 Check: Verify if Total amount is correct (sub-total + gst)
    const expectedGrand = Math.round((subNum + gstNum) * 100) / 100;
    if (Math.abs(expectedGrand - grandTotalNum) > 0.01) {
      setErrorMsg(
        `Total amount is incorrect! Sub-Total ($${subNum.toFixed(2)}) + GST ($${gstNum.toFixed(2)}) = $${expectedGrand.toFixed(2)}, but Grand Total entered is $${grandTotalNum.toFixed(2)}. Please fix the total amount before submitting.`
      );
      return;
    }

    if (!illnessSummary.trim()) {
      setErrorMsg('Please key in the Summary of Illness.');
      return;
    }

    // Submit record
    onAddRecord({
      date,
      employeeName: employeeName.trim(),
      clinicName: clinicName.trim(),
      subTotal: Number(subNum.toFixed(2)),
      gst: Number(gstNum.toFixed(2)),
      grandTotal: Number(grandTotalNum.toFixed(2)),
      illnessSummary: illnessSummary.trim(),
      category,
      receiptNo: receiptNo.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });

    // Provide visual feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);

    // Keep employee name or clear form (clear totals and illness for next entry, or clear completely)
    setSubTotalStr('');
    setGstStr('');
    setGrandTotalStr('');
    setIllnessSummary('');
    setReceiptNo('');
    setRemarks('');
    setErrorMsg(null);
  };

  // Feature 2: Real-time verification of Sub-Total + GST === Grand Total
  const currentSubNum = parseFloat(subTotalStr) || 0;
  const currentGstNum = parseFloat(gstStr) || 0;
  const currentGrandNum = parseFloat(grandTotalStr) || 0;
  const hasEnteredAmounts = subTotalStr.trim() !== '' && grandTotalStr.trim() !== '';
  const currentExpectedGrand = Math.round((currentSubNum + currentGstNum) * 100) / 100;
  const isGrandTotalCorrect = !hasEnteredAmounts || Math.abs(currentExpectedGrand - currentGrandNum) <= 0.01;
  const discrepancy = Math.round((currentGrandNum - currentExpectedGrand) * 100) / 100;

  return (
    <div id="claim-submission-form" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Form Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-6 py-4 border-b border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Key In Medical Claim Details</h2>
            <p className="text-xs text-slate-300">
              Submit employee medical costs with real-time Sub-Total, GST, and Grand Total computation
            </p>
          </div>
        </div>

        {justAdded && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Record Added to Table!</span>
          </div>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6">
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
            <span>⚠️ {errorMsg}</span>
            <button 
              type="button" 
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-800 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. Name of Employee */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                1. Name of Employee <span className="text-rose-500">*</span>
              </span>
              {knownEmployees.length > 0 && (
                <span className="text-[11px] text-slate-400 font-normal">Recent names available</span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Sarah Tan Wei Ling"
                value={employeeName}
                onChange={(e) => {
                  setEmployeeName(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition outline-none"
              />
            </div>
            {knownEmployees.length > 0 && employeeName === '' && (
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-slate-400 self-center mr-1">Quick:</span>
                {knownEmployees.slice(0, 3).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setEmployeeName(name)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Clinic Name */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                2. Clinic Name <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Provider / Hospital</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raffles Medical, SingHealth Polyclinic"
              value={clinicName}
              onChange={(e) => {
                setClinicName(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition outline-none"
            />
            {clinicName === '' && (
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-slate-400 self-center mr-1">Common:</span>
                {COMMON_CLINIC_SUGGESTIONS.slice(0, 3).map((clinic) => (
                  <button
                    key={clinic}
                    type="button"
                    onClick={() => setClinicName(clinic)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition truncate max-w-[130px]"
                    title={clinic}
                  >
                    {clinic}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date of Consultation */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Consultation / Claim Date
              </span>
              <span className="text-[11px] text-slate-400 font-normal">YYYY-MM-DD</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 transition outline-none bg-white"
            />
          </div>

          {/* 3. Sub-Total ($) */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                3. Sub-Total ($) <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Before GST</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={subTotalStr}
                onChange={handleSubTotalChange}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 transition outline-none"
              />
            </div>
          </div>

          {/* 4. GST ($) with Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                4. GST ($) <span className="text-rose-500">*</span>
              </span>
              
              {/* GST Preset Toggles */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyGstPreset('percent-9')}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                    gstMode === 'percent-9'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title="9% Standard GST"
                >
                  9% Std
                </button>
                <button
                  type="button"
                  onClick={() => applyGstPreset('percent-0')}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                    gstMode === 'percent-0'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title="0% GST (Exempt/No Tax)"
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => applyGstPreset('percent-8')}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                    gstMode === 'percent-8'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title="8% Prior GST"
                >
                  8%
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={gstStr}
                onChange={handleGstChange}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 transition outline-none"
              />
            </div>
          </div>

          {/* 5. Grand Total ($) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isGrandTotalCorrect ? 'text-emerald-600' : 'text-rose-600'}`} />
                5. Grand Total ($) <span className="text-rose-500">*</span>
              </span>
              
              {/* Feature 2: Verification Indicator */}
              {hasEnteredAmounts && (
                isGrandTotalCorrect ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    ✓ Total Correct
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center gap-1 animate-pulse">
                    ⚠️ Total Mismatch
                  </span>
                )
              )}
            </div>

            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold ${isGrandTotalCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={grandTotalStr}
                onChange={handleGrandTotalChange}
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border-2 text-sm font-mono font-bold transition outline-none ${
                  isGrandTotalCorrect
                    ? 'border-emerald-500/60 bg-emerald-50/30 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900'
                    : 'border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 text-rose-900'
                }`}
              />
            </div>

            {/* Feature 2: Quick auto-fix banner if calculation does not match Sub-Total + GST */}
            {hasEnteredAmounts && !isGrandTotalCorrect && (
              <div className="mt-1 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between gap-1 shadow-xs animate-in fade-in duration-150">
                <div className="leading-tight">
                  <span className="font-semibold">Sub (${currentSubNum.toFixed(2)}) + GST (${currentGstNum.toFixed(2)})</span> = <span className="font-bold underline">${currentExpectedGrand.toFixed(2)}</span>
                  <div className="text-[10px] text-rose-600">Discrepancy: ${Math.abs(discrepancy).toFixed(2)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setGrandTotalStr(currentExpectedGrand.toFixed(2))}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold transition shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                  title="Auto-calculate and set to exact Sub-Total + GST"
                >
                  Auto-Fix Total
                </button>
              </div>
            )}
          </div>

          {/* 6. Summary of Illness */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                6. Summary of Illness <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Diagnosis / Medical condition</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acute upper respiratory tract infection, toothache, migraines..."
              value={illnessSummary}
              onChange={(e) => {
                setIllnessSummary(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition outline-none"
            />
            {/* Quick Illness Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
              </span>
              {COMMON_ILLNESS_SUGGESTIONS.slice(0, 4).map((illness) => (
                <button
                  key={illness}
                  type="button"
                  onClick={() => setIllnessSummary(illness)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 transition cursor-pointer"
                >
                  {illness.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Category / Treatment Type</span>
              <span className="text-[11px] text-slate-400 font-normal">HR Categorization</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 transition outline-none bg-white cursor-pointer"
            >
              {CLAIM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Optional: Receipt / Ref # */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Receipt / Claim Ref # (Optional)</span>
              <span className="text-[11px] text-slate-400 font-normal">For auditing</span>
            </label>
            <input
              type="text"
              placeholder="e.g. REC-99214 / MC-001"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition outline-none"
            />
          </div>

          {/* Optional: Remarks */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Remarks / Prescription Notes (Optional)</span>
              <span className="text-[11px] text-slate-400 font-normal">e.g. 2 days MC issued, referral letter</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Issued 2 days MC; specialist referral attached"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition outline-none"
            />
          </div>

        </div>

        {/* Live Calculation Banner & Action Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Quick Computed Breakdown Pill with verification status */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl w-full sm:w-auto">
            <span className="text-slate-500 font-medium">Summary:</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-700 font-medium">Sub: ${parseFloat(subTotalStr || '0').toFixed(2)}</span>
              <span className="text-slate-400">+</span>
              <span className="text-blue-600 font-medium">GST: ${parseFloat(gstStr || '0').toFixed(2)}</span>
              <span className="text-slate-400">=</span>
              <span className={`font-bold text-sm px-2 py-0.5 rounded-md ${
                isGrandTotalCorrect
                  ? 'text-emerald-700 bg-emerald-100/70'
                  : 'text-rose-700 bg-rose-100'
              }`}>
                Grand: ${parseFloat(grandTotalStr || '0').toFixed(2)}
              </span>
            </div>
            {hasEnteredAmounts && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isGrandTotalCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isGrandTotalCorrect ? '✓ Total Verified' : '⚠️ Discrepancy'}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Fields</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Add Record to Table</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};
