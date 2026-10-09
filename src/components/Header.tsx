import React from 'react';
import { FileText, FileSpreadsheet, PlusCircle, RefreshCw, Trash2, HeartPulse } from 'lucide-react';
import { MedicalRecord } from '../types/claim';

interface HeaderProps {
  records: MedicalRecord[];
  onDownloadPDF: () => void;
  onOpenExportModal?: () => void;
  onLoadSampleData: () => void;
  onClearAll: () => void;
  onScrollToForm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  records,
  onDownloadPDF,
  onOpenExportModal,
  onLoadSampleData,
  onClearAll,
  onScrollToForm,
}) => {
  const totalAmount = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3.5 sm:h-20 gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <HeartPulse className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">MedClaim</h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  Reimbursement
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Employee Medical Cost Submission &amp; PDF Export Portal
              </p>
            </div>
          </div>

          {/* Quick Stats & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {records.length > 0 && (
              <div className="hidden lg:flex items-center px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <span className="text-slate-400 mr-1.5">Submitted:</span>
                <span className="font-semibold text-white mr-3">{records.length} claim{records.length > 1 ? 's' : ''}</span>
                <span className="text-slate-500 mr-2">|</span>
                <span className="text-slate-400 mr-1.5">Total:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <button
              onClick={onScrollToForm}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Add New Claim"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>New Claim</span>
            </button>

            {records.length === 0 ? (
              <button
                onClick={onLoadSampleData}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            ) : (
              <button
                onClick={onClearAll}
                className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-900/60 transition flex items-center gap-1 cursor-pointer"
                title="Clear all records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear All</span>
              </button>
            )}

            {/* Feature 1: Download PDF Format (Primary Action) */}
            <button
              onClick={onDownloadPDF}
              disabled={records.length === 0}
              className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition cursor-pointer ${
                records.length > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
              }`}
              title="Download all records into a PDF file"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Download PDF</span>
              {records.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-black/20 text-white text-[10px]">
                  {records.length}
                </span>
              )}
            </button>

            {/* Secondary Option: Excel / Export Settings */}
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                disabled={records.length === 0}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                title="Export options & formats"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Options</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
