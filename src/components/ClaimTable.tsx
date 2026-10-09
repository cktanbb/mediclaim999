import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Trash2, 
  Edit3, 
  Copy, 
  FileText,
  FileSpreadsheet, 
  Filter, 
  CheckSquare, 
  Square,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  ChevronUp,
  ChevronDown,
  Building2,
  Calendar,
  Wrench
} from 'lucide-react';
import { MedicalRecord, SortField, SortOrder } from '../types/claim';
import { CLAIM_CATEGORIES } from '../utils/sampleData';

interface ClaimTableProps {
  records: MedicalRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: MedicalRecord) => void;
  onDuplicateRecord: (record: MedicalRecord) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onFixRecordTotal?: (id: string, correctedGrandTotal: number) => void;
  onFixAllRecordTotals?: () => void;
  onExportPDF: () => void;
  onExportXLSX?: () => void;
  onLoadSampleData: () => void;
}

export const ClaimTable: React.FC<ClaimTableProps> = ({
  records,
  onDeleteRecord,
  onEditRecord,
  onDuplicateRecord,
  onDeleteMultiple,
  onFixRecordTotal,
  onFixAllRecordTotals,
  onExportPDF,
  onExportXLSX,
  onLoadSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showOnlyDiscrepancies, setShowOnlyDiscrepancies] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Count total calculation discrepancies (subTotal + gst !== grandTotal)
  const discrepancyRecords = useMemo(() => {
    return records.filter((r) => {
      const exp = Math.round(((Number(r.subTotal) || 0) + (Number(r.gst) || 0)) * 100) / 100;
      return Math.abs(exp - (Number(r.grandTotal) || 0)) > 0.01;
    });
  }, [records]);

  // Filtered and Sorted records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Discrepancy only filter
      if (showOnlyDiscrepancies) {
        const exp = Math.round(((Number(r.subTotal) || 0) + (Number(r.gst) || 0)) * 100) / 100;
        if (Math.abs(exp - (Number(r.grandTotal) || 0)) <= 0.01) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) {
        return false;
      }

      // Search term filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.employeeName.toLowerCase().includes(term) ||
        r.clinicName.toLowerCase().includes(term) ||
        r.illnessSummary.toLowerCase().includes(term) ||
        (r.receiptNo && r.receiptNo.toLowerCase().includes(term)) ||
        (r.remarks && r.remarks.toLowerCase().includes(term))
      );
    });
  }, [records, searchTerm, categoryFilter, showOnlyDiscrepancies]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = (a.date || '').localeCompare(b.date || '');
          break;
        case 'employeeName':
          comparison = a.employeeName.localeCompare(b.employeeName);
          break;
        case 'clinicName':
          comparison = a.clinicName.localeCompare(b.clinicName);
          break;
        case 'subTotal':
          comparison = a.subTotal - b.subTotal;
          break;
        case 'gst':
          comparison = a.gst - b.gst;
          break;
        case 'grandTotal':
          comparison = a.grandTotal - b.grandTotal;
          break;
        case 'illnessSummary':
          comparison = a.illnessSummary.localeCompare(b.illnessSummary);
          break;
        default:
          comparison = b.createdAt - a.createdAt;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Totals for visible records
  const totalSubTotal = sortedRecords.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const totalGST = sortedRecords.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const totalGrandTotal = sortedRecords.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  // Sorting helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
    );
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === sortedRecords.length && sortedRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRecords.map((r) => r.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected record(s)?`)) {
      onDeleteMultiple(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee, clinic, illness..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm bg-white outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs bg-white text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({records.length})</option>
              {CLAIM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions (Bulk Delete + PDF Download + XLSX fallback) */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}

          <div className="text-xs text-slate-500 hidden sm:block">
            Showing <strong className="text-slate-800">{sortedRecords.length}</strong> of{' '}
            <strong className="text-slate-800">{records.length}</strong> claims
          </div>

          {/* PRIMARY ACTION: Download PDF Format */}
          <button
            onClick={onExportPDF}
            disabled={records.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm ${
              records.length > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Download all records into a PDF file"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Download PDF</span>
          </button>

          {/* Optional Excel export button */}
          {onExportXLSX && (
            <button
              onClick={onExportXLSX}
              disabled={records.length === 0}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1 cursor-pointer"
              title="Download Excel (.xlsx) file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">.xlsx</span>
            </button>
          )}
        </div>

      </div>

      {/* Feature 2: Audit Check Banner for Sub-Total + GST Verification */}
      {discrepancyRecords.length > 0 ? (
        <div className="mx-4 sm:mx-5 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-800">Calculation Check Alert: </span>
              <span>
                Found <strong>{discrepancyRecords.length}</strong> record{discrepancyRecords.length > 1 ? 's' : ''} where Grand Total does not match Sub-Total + GST!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowOnlyDiscrepancies(!showOnlyDiscrepancies)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                showOnlyDiscrepancies
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-100'
              }`}
            >
              {showOnlyDiscrepancies ? 'Show All Claims' : `Show ${discrepancyRecords.length} Discrepanc${discrepancyRecords.length > 1 ? 'ies' : 'y'}`}
            </button>
            {onFixAllRecordTotals && (
              <button
                type="button"
                onClick={onFixAllRecordTotals}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Automatically update Grand Total to match Sub-Total + GST on all records"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Auto-Fix All ({discrepancyRecords.length})</span>
              </button>
            )}
          </div>
        </div>
      ) : records.length > 0 ? (
        <div className="mx-4 sm:mx-5 mt-3 px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Calculation Check Passed: All {records.length} claim Grand Totals match Sub-Total + GST exactly.</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ✓ 100% Verified
          </span>
        </div>
      ) : null}

      {/* Table Container */}
      <div className="overflow-x-auto relative mt-2">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-semibold text-[11px] uppercase tracking-wider select-none">
              
              {/* Checkbox */}
              <th className="py-3 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-slate-700 transition"
                  title="Select all"
                >
                  {selectedIds.size > 0 && selectedIds.size === sortedRecords.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              {/* S/N */}
              <th className="py-3 px-2 w-12 text-center text-slate-400">#</th>

              {/* Date */}
              <th 
                onClick={() => handleSort('date')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/50 transition group"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>

              {/* 1. Name of Employee */}
              <th 
                onClick={() => handleSort('employeeName')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition group"
              >
                <div className="flex items-center gap-1">
                  <span>1. Employee Name</span>
                  {getSortIcon('employeeName')}
                </div>
              </th>

              {/* 2. Clinic Name */}
              <th 
                onClick={() => handleSort('clinicName')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition group"
              >
                <div className="flex items-center gap-1">
                  <span>2. Clinic Name</span>
                  {getSortIcon('clinicName')}
                </div>
              </th>

              {/* 6. Summary of Illness */}
              <th 
                onClick={() => handleSort('illnessSummary')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition group"
              >
                <div className="flex items-center gap-1">
                  <span>6. Summary of Illness</span>
                  {getSortIcon('illnessSummary')}
                </div>
              </th>

              {/* 3. Sub-Total */}
              <th 
                onClick={() => handleSort('subTotal')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/50 transition group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>3. Sub-Total</span>
                  {getSortIcon('subTotal')}
                </div>
              </th>

              {/* 4. GST */}
              <th 
                onClick={() => handleSort('gst')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/50 transition group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>4. GST</span>
                  {getSortIcon('gst')}
                </div>
              </th>

              {/* 5. Grand Total (Sub+GST Check) */}
              <th 
                onClick={() => handleSort('grandTotal')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/50 transition group"
              >
                <div className="flex items-center justify-end gap-1 text-slate-900 font-bold">
                  <span>5. Grand Total</span>
                  {getSortIcon('grandTotal')}
                </div>
              </th>

              {/* Actions */}
              <th className="py-3 px-4 text-center w-28">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-800">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    {records.length === 0 ? (
                      <>
                        <h4 className="text-base font-semibold text-slate-800">No medical claims submitted yet</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">
                          Key in the medical cost details using the form above or load sample claims to test.
                        </p>
                        <button
                          onClick={onLoadSampleData}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                        >
                          Load 5 Sample Medical Claims
                        </button>
                      </>
                    ) : (
                      <>
                        <h4 className="text-base font-semibold text-slate-800">No claims match your filters</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-3">
                          Try adjusting your search query or reset the filter.
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setCategoryFilter('ALL');
                            setShowOnlyDiscrepancies(false);
                          }}
                          className="text-xs font-medium text-emerald-600 hover:underline"
                        >
                          Reset all filters
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedRecords.map((record, index) => {
                const isSelected = selectedIds.has(record.id);

                // Feature 2 Check: Verify Sub-Total + GST === Grand Total
                const subVal = Number(record.subTotal) || 0;
                const gstVal = Number(record.gst) || 0;
                const grandVal = Number(record.grandTotal) || 0;
                const expectedGrand = Math.round((subVal + gstVal) * 100) / 100;
                const isTotalCorrect = Math.abs(expectedGrand - grandVal) <= 0.01;
                const diff = Math.round((grandVal - expectedGrand) * 100) / 100;

                return (
                  <tr
                    key={record.id}
                    className={`hover:bg-slate-50/80 transition group ${
                      !isTotalCorrect ? 'bg-rose-50/30' : isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(record.id)}
                        className="text-slate-400 hover:text-slate-700 transition"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* S/N */}
                    <td className="py-3 px-2 text-center text-xs font-mono text-slate-400">
                      {index + 1}
                    </td>

                    {/* Date & Ref */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-700">{record.date || '—'}</span>
                        {record.receiptNo && (
                          <span className="text-[10px] text-slate-400 font-mono">#{record.receiptNo}</span>
                        )}
                      </div>
                    </td>

                    {/* 1. Name of Employee */}
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-700 uppercase">
                          {record.employeeName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{record.employeeName}</div>
                          {record.category && (
                            <div className="text-[10px] text-slate-400">{record.category}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Clinic Name */}
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">{record.clinicName}</span>
                      </div>
                    </td>

                    {/* 6. Summary of Illness */}
                    <td className="py-3 px-4 min-w-[200px] max-w-[340px]">
                      <div>
                        <span className="inline-block text-xs font-medium text-slate-800 leading-snug">
                          {record.illnessSummary}
                        </span>
                        {record.remarks && (
                          <div className="text-[11px] text-slate-400 italic truncate mt-0.5">
                            Note: {record.remarks}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 3. Sub-Total */}
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-700 whitespace-nowrap">
                      ${subVal.toFixed(2)}
                    </td>

                    {/* 4. GST */}
                    <td className="py-3 px-3 text-right font-mono text-xs text-blue-700 whitespace-nowrap">
                      ${gstVal.toFixed(2)}
                    </td>

                    {/* 5. Grand Total (with check verification) */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${
                          isTotalCorrect
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          ${grandVal.toFixed(2)}
                        </span>

                        {/* Feature 2: Verification Indicator on Row */}
                        {isTotalCorrect ? (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            ✓ Sub+GST
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span 
                              className="text-[10px] text-rose-600 font-bold" 
                              title={`Sub ($${subVal.toFixed(2)}) + GST ($${gstVal.toFixed(2)}) = $${expectedGrand.toFixed(2)}`}
                            >
                              Diff: {diff > 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}
                            </span>
                            {onFixRecordTotal && (
                              <button
                                type="button"
                                onClick={() => onFixRecordTotal(record.id, expectedGrand)}
                                className="text-[10px] px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition shadow-xs cursor-pointer"
                                title={`Auto-fix Grand Total to expected $${expectedGrand.toFixed(2)}`}
                              >
                                Fix
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditRecord(record)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Edit record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateRecord(record)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Duplicate record"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete claim for ${record.employeeName}?`)) {
                              onDeleteRecord(record.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer Totals Row */}
          {sortedRecords.length > 0 && (
            <tfoot>
              <tr className="bg-slate-900 text-white font-semibold text-xs border-t-2 border-slate-700">
                <td colSpan={6} className="py-3.5 px-4 text-right tracking-wider uppercase text-[11px] text-slate-300 font-bold">
                  Totals ({sortedRecords.length} claim{sortedRecords.length > 1 ? 's' : ''}):
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                  ${totalSubTotal.toFixed(2)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-blue-300">
                  ${totalGST.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold text-sm">
                  ${totalGrandTotal.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
