import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, Download, Check, Sparkles, Building2, Tag, ShieldCheck } from 'lucide-react';
import { MedicalRecord } from '../types/claim';
import { exportClaimsToPDF } from '../utils/pdfExport';
import { exportClaimsToXLSX } from '../utils/xlsxExport';

interface ExportModalProps {
  records: MedicalRecord[];
  isOpen: boolean;
  onClose: () => void;
  defaultFormat?: 'pdf' | 'xlsx';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  records,
  isOpen,
  onClose,
  defaultFormat = 'pdf',
}) => {
  const defaultDateStr = new Date().toISOString().slice(0, 10);
  const [format, setFormat] = useState<'pdf' | 'xlsx'>(defaultFormat);
  const [fileName, setFileName] = useState(`Medical_Cost_Claims_${defaultDateStr}`);
  const [companyName, setCompanyName] = useState('Corporate Medical Reimbursement');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const totalGrandTotal = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);
  const totalGST = records.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const totalSubTotal = records.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);

  // Check calculation discrepancies
  const discrepancies = records.filter((r) => {
    const exp = Math.round(((Number(r.subTotal) || 0) + (Number(r.gst) || 0)) * 100) / 100;
    return Math.abs(exp - (Number(r.grandTotal) || 0)) > 0.01;
  }).length;

  const handleDownload = () => {
    try {
      const baseName = fileName.trim() || `Medical_Claims_${defaultDateStr}`;

      if (format === 'pdf') {
        exportClaimsToPDF(records, {
          fileName: baseName,
          companyName: companyName.trim() || 'Medical Reimbursement Report',
          currencySymbol,
        });
      } else {
        exportClaimsToXLSX(records, {
          fileName: baseName,
          companyName: companyName.trim() || 'Medical Reimbursement Report',
          currencySymbol,
        });
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error generating file download:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              format === 'pdf' 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {format === 'pdf' ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Download Claims Report</h3>
              <p className="text-xs text-slate-400">Export verified records in PDF or spreadsheet format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Format Selector: PDF vs XLSX */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Choose Export File Format:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left cursor-pointer ${
                  format === 'pdf'
                    ? 'border-rose-600 bg-rose-50/60 text-slate-900 ring-2 ring-rose-500/20 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">PDF Format (.pdf)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Official audit document</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left cursor-pointer ${
                  format === 'xlsx'
                    ? 'border-emerald-600 bg-emerald-50/60 text-slate-900 ring-2 ring-emerald-500/20 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Excel Format (.xlsx)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Spreadsheet workbook</div>
                </div>
              </button>
            </div>
          </div>

          {/* Summary Preview Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Records to Export:</span>
              <strong className="text-slate-900 font-mono text-sm">{records.length} claims</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Sub-Total:</span>
              <span className="font-mono text-slate-800">${totalSubTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total GST:</span>
              <span className="font-mono text-blue-700">${totalGST.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800">Grand Total:</span>
              <span className="font-mono text-base text-emerald-600 font-bold">${totalGrandTotal.toFixed(2)}</span>
            </div>
            {/* Verification Status */}
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Sub-Total + GST Math Check:</span>
              {discrepancies === 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified
                </span>
              ) : (
                <span className="text-rose-600 font-bold">
                  ⚠️ {discrepancies} Discrepancy Found
                </span>
              )}
            </div>
          </div>

          {/* Configuration Options */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <span>File Name</span>
                <span className="text-[11px] text-slate-400 font-normal">(.{format} extension added automatically)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:border-emerald-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  .{format}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Report / Company Title</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp Medical Claims"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Currency Symbol</span>
              </label>
              <div className="flex gap-2">
                {['$', 'SGD $', 'USD $', 'RM'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setCurrencySymbol(sym)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      currencySymbol === sym
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 border border-slate-300 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={records.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : format === 'pdf'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download {format.toUpperCase()} File</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
