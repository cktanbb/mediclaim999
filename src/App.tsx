/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { ClaimForm } from './components/ClaimForm';
import { ClaimTable } from './components/ClaimTable';
import { ClaimEditModal } from './components/ClaimEditModal';
import { ExportModal } from './components/ExportModal';
import { MedicalRecord, MedicalRecordInput } from './types/claim';
import { INITIAL_SAMPLE_RECORDS } from './utils/sampleData';
import { exportClaimsToPDF } from './utils/pdfExport';
import { exportClaimsToXLSX } from './utils/xlsxExport';

const STORAGE_KEY = 'medclaim_submissions_v1';

export default function App() {
  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load records from localStorage', e);
    }
    return INITIAL_SAMPLE_RECORDS;
  });

  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalFormat, setExportModalFormat] = useState<'pdf' | 'xlsx'>('pdf');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  // Add new record
  const handleAddRecord = (input: MedicalRecordInput) => {
    const newRecord: MedicalRecord = {
      ...input,
      id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  // Delete single record
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Delete multiple records
  const handleDeleteMultiple = (ids: string[]) => {
    const idSet = new Set(ids);
    setRecords((prev) => prev.filter((r) => !idSet.has(r.id)));
  };

  // Feature 2: Fix single record total calculation
  const handleFixRecordTotal = (id: string, correctedGrandTotal: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, grandTotal: correctedGrandTotal } : r))
    );
  };

  // Feature 2: Fix all records total calculation
  const handleFixAllRecordTotals = () => {
    setRecords((prev) =>
      prev.map((r) => {
        const sub = Number(r.subTotal) || 0;
        const gst = Number(r.gst) || 0;
        const correct = Math.round((sub + gst) * 100) / 100;
        return { ...r, grandTotal: correct };
      })
    );
  };

  // Edit record
  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
  };

  const handleSaveEditedRecord = (updated: MedicalRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRecord(null);
  };

  // Duplicate record
  const handleDuplicateRecord = (record: MedicalRecord) => {
    const duplicated: MedicalRecord = {
      ...record,
      id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
      receiptNo: record.receiptNo ? `${record.receiptNo}-COPY` : undefined,
    };
    setRecords((prev) => [duplicated, ...prev]);
  };

  // Load sample data
  const handleLoadSampleData = () => {
    setRecords(INITIAL_SAMPLE_RECORDS);
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all medical claim records? This cannot be undone.')) {
      setRecords([]);
    }
  };

  // Scroll to form
  const handleScrollToForm = () => {
    const el = document.getElementById('claim-submission-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Feature 1: Download records in PDF format
  const handleDownloadPDF = () => {
    if (records.length === 0) return;
    exportClaimsToPDF(records);
  };

  // Open export modal with PDF as default
  const handleOpenExportModal = (format: 'pdf' | 'xlsx' = 'pdf') => {
    setExportModalFormat(format);
    setIsExportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        records={records}
        onDownloadPDF={handleDownloadPDF}
        onOpenExportModal={() => handleOpenExportModal('pdf')}
        onLoadSampleData={handleLoadSampleData}
        onClearAll={handleClearAll}
        onScrollToForm={handleScrollToForm}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* KPI Summary Cards */}
        <StatsCards records={records} />

        {/* 1. Key In Details Form */}
        <section aria-labelledby="form-heading">
          <ClaimForm 
            onAddRecord={handleAddRecord} 
            existingRecords={records} 
          />
        </section>

        {/* 2. Medical Claims Table */}
        <section aria-labelledby="table-heading" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 id="table-heading" className="text-lg font-bold text-slate-900">
                Medical Claims Registry
              </h2>
              <p className="text-xs text-slate-500">
                All submitted claims are logged here with real-time Sub-Total + GST audit checks and instant PDF export.
              </p>
            </div>
          </div>

          <ClaimTable
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onEditRecord={handleEditRecord}
            onDuplicateRecord={handleDuplicateRecord}
            onDeleteMultiple={handleDeleteMultiple}
            onFixRecordTotal={handleFixRecordTotal}
            onFixAllRecordTotals={handleFixAllRecordTotals}
            onExportPDF={handleDownloadPDF}
            onExportXLSX={() => handleOpenExportModal('xlsx')}
            onLoadSampleData={handleLoadSampleData}
          />
        </section>

      </main>

      {/* Edit Modal */}
      <ClaimEditModal
        record={editingRecord}
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEditedRecord}
      />

      {/* Export Options Modal */}
      <ExportModal
        records={records}
        isOpen={isExportModalOpen}
        defaultFormat={exportModalFormat}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* App Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MedClaim &bull; Automated Sub-Total + GST math verification &amp; PDF download ready</span>
          </div>
          <div className="text-slate-400">
            Complies with standard corporate reimbursement audit requirements
          </div>
        </div>
      </footer>
    </div>
  );
}
