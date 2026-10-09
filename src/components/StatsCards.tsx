import React from 'react';
import { DollarSign, ReceiptText, Users, Percent, Stethoscope } from 'lucide-react';
import { MedicalRecord } from '../types/claim';

interface StatsCardsProps {
  records: MedicalRecord[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ records }) => {
  const totalSubTotal = records.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const totalGST = records.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const totalGrandTotal = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);
  const uniqueEmployees = new Set(records.map(r => r.employeeName.trim().toLowerCase())).size;
  const uniqueClinics = new Set(records.map(r => r.clinicName.trim().toLowerCase())).size;
  const averageClaim = records.length > 0 ? totalGrandTotal / records.length : 0;

  const calculationDiscrepancies = records.filter((r) => {
    const exp = Math.round(((Number(r.subTotal) || 0) + (Number(r.gst) || 0)) * 100) / 100;
    return Math.abs(exp - (Number(r.grandTotal) || 0)) > 0.01;
  }).length;

  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Grand Total Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims Value</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight text-emerald-600">
              {formatCurrency(totalGrandTotal)}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Sub-Total: <strong className="text-slate-700 font-mono">{formatCurrency(totalSubTotal)}</strong></span>
          {calculationDiscrepancies === 0 ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              ✓ Sub+GST Verified
            </span>
          ) : (
            <span className="text-rose-600 font-bold flex items-center gap-1 animate-pulse">
              ⚠️ {calculationDiscrepancies} Discrepanc{calculationDiscrepancies > 1 ? 'ies' : 'y'}
            </span>
          )}
        </div>
      </div>

      {/* Total GST Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total GST Incurred</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight text-blue-600">
              {formatCurrency(totalGST)}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Avg GST/Claim: <strong className="text-slate-700 font-mono">{formatCurrency(records.length ? totalGST / records.length : 0)}</strong></span>
          <span className="text-blue-700 font-medium">Tax Tracked</span>
        </div>
      </div>

      {/* Total Claims Count */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims Count</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight">
              {records.length} <span className="text-sm font-normal text-slate-500">entries</span>
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Avg per claim: <strong className="text-slate-700 font-mono">{formatCurrency(averageClaim)}</strong></span>
          <span className="text-indigo-700 font-medium">Active list</span>
        </div>
      </div>

      {/* Employees & Healthcare Providers */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff & Clinics</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">{uniqueEmployees}</span>
              <span className="text-xs text-slate-500">employees</span>
              <span className="text-slate-300">/</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">{uniqueClinics}</span>
              <span className="text-xs text-slate-500">clinics</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Multi-clinic visits</span>
          </span>
          <span className="text-teal-700 font-medium">Verified</span>
        </div>
      </div>
    </div>
  );
};
