import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, User, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { MedicalRecord } from '../types/claim';
import { CLAIM_CATEGORIES } from '../utils/sampleData';

interface ClaimEditModalProps {
  record: MedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: MedicalRecord) => void;
}

export const ClaimEditModal: React.FC<ClaimEditModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const [employeeName, setEmployeeName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [subTotal, setSubTotal] = useState('');
  const [gst, setGst] = useState('');
  const [grandTotal, setGrandTotal] = useState('');
  const [illnessSummary, setIllnessSummary] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setEmployeeName(record.employeeName);
      setClinicName(record.clinicName);
      setSubTotal(String(record.subTotal));
      setGst(String(record.gst));
      setGrandTotal(String(record.grandTotal));
      setIllnessSummary(record.illnessSummary);
      setDate(record.date);
      setCategory(record.category || 'General Practitioner (GP)');
      setReceiptNo(record.receiptNo || '');
      setRemarks(record.remarks || '');
      setErrorMsg(null);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const subNum = parseFloat(subTotal) || 0;
  const gstNum = parseFloat(gst) || 0;
  const grandNum = parseFloat(grandTotal) || 0;
  const expectedGrand = Math.round((subNum + gstNum) * 100) / 100;
  const isTotalCorrect = Math.abs(expectedGrand - grandNum) <= 0.01;

  const handleSubTotalChange = (val: string) => {
    setSubTotal(val);
    setErrorMsg(null);
    const sub = parseFloat(val);
    if (!isNaN(sub)) {
      const calculatedGST = Math.round(sub * 0.09 * 100) / 100;
      setGst(calculatedGST.toFixed(2));
      setGrandTotal((sub + calculatedGST).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sNum = parseFloat(subTotal) || 0;
    const gNum = parseFloat(gst) || 0;
    const grNum = parseFloat(grandTotal) || (sNum + gNum);
    const exp = Math.round((sNum + gNum) * 100) / 100;

    if (Math.abs(exp - grNum) > 0.01) {
      setErrorMsg(`Total calculation is incorrect! Sub-Total ($${sNum.toFixed(2)}) + GST ($${gNum.toFixed(2)}) = $${exp.toFixed(2)}, but Grand Total is $${grNum.toFixed(2)}.`);
      return;
    }

    onSave({
      ...record,
      employeeName: employeeName.trim(),
      clinicName: clinicName.trim(),
      subTotal: Number(sNum.toFixed(2)),
      gst: Number(gNum.toFixed(2)),
      grandTotal: Number(grNum.toFixed(2)),
      illnessSummary: illnessSummary.trim(),
      date,
      category,
      receiptNo: receiptNo.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Edit Medical Claim Record</h3>
            <p className="text-xs text-slate-400">Update medical expense and diagnosis details</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Employee Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                1. Name of Employee *
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 outline-none"
              />
            </div>

            {/* 2. Clinic Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                2. Clinic Name *
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Claim Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 outline-none bg-white"
              >
                {CLAIM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Sub-Total */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">3. Sub-Total ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={subTotal}
                onChange={(e) => handleSubTotalChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            {/* 4. GST */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">4. GST ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={gst}
                onChange={(e) => {
                  setGst(e.target.value);
                  const s = parseFloat(subTotal) || 0;
                  const g = parseFloat(e.target.value) || 0;
                  setGrandTotal((s + g).toFixed(2));
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono text-blue-700 focus:border-blue-500 outline-none"
              />
            </div>

            {/* 5. Grand Total */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>5. Grand Total ($) *</span>
                {isTotalCorrect ? (
                  <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    ✓ Total Correct
                  </span>
                ) : (
                  <span className="text-[11px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    ⚠️ Mismatch (Expected ${expectedGrand.toFixed(2)})
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={grandTotal}
                onChange={(e) => {
                  setGrandTotal(e.target.value);
                  setErrorMsg(null);
                }}
                className={`w-full px-3 py-2 rounded-xl border-2 text-sm font-mono font-bold outline-none ${
                  isTotalCorrect
                    ? 'border-emerald-500 bg-emerald-50/40 text-slate-900 focus:border-emerald-600'
                    : 'border-rose-500 bg-rose-50/50 text-rose-900 focus:border-rose-600'
                }`}
              />
              {!isTotalCorrect && (
                <div className="mt-1 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <span>Sub (${subNum.toFixed(2)}) + GST (${gstNum.toFixed(2)}) = <strong>${expectedGrand.toFixed(2)}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setGrandTotal(expectedGrand.toFixed(2));
                      setErrorMsg(null);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                  >
                    Fix Total
                  </button>
                </div>
              )}
            </div>

            {/* 6. Summary of Illness */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                6. Summary of Illness *
              </label>
              <textarea
                rows={2}
                required
                value={illnessSummary}
                onChange={(e) => setIllnessSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Receipt No */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Receipt / Ref #</label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
              />
            </div>

            {/* Remarks */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Remarks / Prescription</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
