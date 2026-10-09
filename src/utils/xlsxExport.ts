import * as XLSX from 'xlsx';
import { MedicalRecord } from '../types/claim';

export interface ExportOptions {
  fileName?: string;
  companyName?: string;
  currencySymbol?: string;
}

export function exportClaimsToXLSX(records: MedicalRecord[], options: ExportOptions = {}) {
  const {
    fileName = `Medical_Cost_Claims_${new Date().toISOString().slice(0, 10)}`,
    companyName = 'Corporate Medical Reimbursement',
    currencySymbol = '$',
  } = options;

  // Calculate totals
  const totalSubTotal = records.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const totalGST = records.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const totalGrandTotal = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  // Build 2D array for the Excel Sheet
  const rows: (string | number)[][] = [];

  // Header Title & Meta
  rows.push([`${companyName.toUpperCase()} - MEDICAL COST SUBMISSION REPORT`]);
  rows.push([`Generated on: ${new Date().toLocaleDateString('en-SG', { dateStyle: 'full' })} at ${new Date().toLocaleTimeString('en-SG')}`]);
  rows.push([`Total Claims Count: ${records.length}`, '', `Total Reimbursable: ${currencySymbol}${totalGrandTotal.toFixed(2)}`]);
  rows.push([]); // blank row

  // Table Columns Header
  const headers = [
    'No.',
    'Claim Date',
    'Receipt / Ref #',
    'Employee Name',
    'Clinic Name',
    'Summary of Illness',
    'Category',
    `Sub-Total (${currencySymbol})`,
    `GST (${currencySymbol})`,
    `Grand Total (${currencySymbol})`,
    'Remarks / Notes',
  ];
  rows.push(headers);

  // Table Data
  records.forEach((record, index) => {
    rows.push([
      index + 1,
      record.date || '-',
      record.receiptNo || `MC-${String(index + 1).padStart(4, '0')}`,
      record.employeeName || '-',
      record.clinicName || '-',
      record.illnessSummary || '-',
      record.category || 'General Consultation',
      Number(Number(record.subTotal).toFixed(2)),
      Number(Number(record.gst).toFixed(2)),
      Number(Number(record.grandTotal).toFixed(2)),
      record.remarks || '',
    ]);
  });

  // Summary Totals Row
  rows.push([
    '',
    '',
    '',
    '',
    '',
    '',
    'TOTALS:',
    Number(totalSubTotal.toFixed(2)),
    Number(totalGST.toFixed(2)),
    Number(totalGrandTotal.toFixed(2)),
    '',
  ]);

  // Create sheet
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No.
    { wch: 14 }, // Date
    { wch: 16 }, // Ref
    { wch: 22 }, // Employee Name
    { wch: 24 }, // Clinic Name
    { wch: 32 }, // Illness Summary
    { wch: 18 }, // Category
    { wch: 16 }, // Sub-Total
    { wch: 14 }, // GST
    { wch: 18 }, // Grand Total
    { wch: 25 }, // Remarks
  ];

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medical Claims');

  // Trigger browser download
  const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, cleanFileName);
}
