import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MedicalRecord } from '../types/claim';

export interface PDFExportOptions {
  fileName?: string;
  companyName?: string;
  currencySymbol?: string;
  reportSubtitle?: string;
}

export function exportClaimsToPDF(records: MedicalRecord[], options: PDFExportOptions = {}) {
  const {
    fileName = `Medical_Claims_Report_${new Date().toISOString().slice(0, 10)}`,
    companyName = 'Corporate Medical Reimbursement',
    currencySymbol = '$',
    reportSubtitle = 'Employee Medical Cost Claim Submissions & Verification Statement',
  } = options;

  // Create PDF document in Landscape orientation (A4)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Calculate totals
  const totalSubTotal = records.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const totalGST = records.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const totalGrandTotal = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  // Verification check: any mismatch between SubTotal + GST and GrandTotal
  let mismatchCount = 0;
  records.forEach((r) => {
    const expected = Math.round(((Number(r.subTotal) || 0) + (Number(r.gst) || 0)) * 100) / 100;
    const actual = Math.round((Number(r.grandTotal) || 0) * 100) / 100;
    if (Math.abs(expected - actual) > 0.01) {
      mismatchCount++;
    }
  });

  // Top header banner background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Emerald accent bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 75, pageWidth, 4, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(companyName.toUpperCase(), 36, 32);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(reportSubtitle, 36, 50);

  // Metadata badge right-aligned
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240); // slate-200
  const dateStr = `Exported: ${new Date().toLocaleDateString('en-SG', { dateStyle: 'medium' })} ${new Date().toLocaleTimeString('en-SG', { timeStyle: 'short' })}`;
  doc.text(dateStr, pageWidth - 36, 32, { align: 'right' });
  
  const statusStr = mismatchCount === 0 
    ? '✓ All Total Calculations Verified' 
    : `⚠️ ${mismatchCount} Calculation Discrepanc${mismatchCount > 1 ? 'ies' : 'y'}`;
  doc.setTextColor(mismatchCount === 0 ? 52 : 248, mismatchCount === 0 ? 211 : 113, mismatchCount === 0 ? 153 : 113);
  doc.text(statusStr, pageWidth - 36, 50, { align: 'right' });

  // Summary KPI row below banner
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(36, 90, pageWidth - 72, 34, 4, 4, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Claims: `, 48, 111);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${records.length}`, 110, 111);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Sub-Total: `, 200, 111);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${currencySymbol}${totalSubTotal.toFixed(2)}`, 255, 111);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total GST: `, 360, 111);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`${currencySymbol}${totalGST.toFixed(2)}`, 415, 111);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Grand Total: `, 520, 111);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(`${currencySymbol}${totalGrandTotal.toFixed(2)}`, 585, 111);

  // Prepare table data
  const tableHeaders = [
    '#',
    'Date',
    'Name of Employee',
    'Clinic Name',
    'Summary of Illness',
    `Sub-Total (${currencySymbol})`,
    `GST (${currencySymbol})`,
    `Grand Total (${currencySymbol})`,
    'Status (Sub+GST)',
  ];

  const tableBody = records.map((record, index) => {
    const sub = Number(record.subTotal) || 0;
    const gst = Number(record.gst) || 0;
    const grand = Number(record.grandTotal) || 0;
    const expected = Math.round((sub + gst) * 100) / 100;
    const isCorrect = Math.abs(expected - grand) <= 0.01;

    return [
      String(index + 1),
      record.date || '-',
      record.employeeName || '-',
      record.clinicName || '-',
      record.illnessSummary || '-',
      sub.toFixed(2),
      gst.toFixed(2),
      grand.toFixed(2),
      isCorrect ? 'Correct' : `Mismatch (${currencySymbol}${expected.toFixed(2)})`,
    ];
  });

  // Summary Row
  const summaryRow = [
    '',
    '',
    'TOTALS',
    '',
    `${records.length} claim(s)`,
    totalSubTotal.toFixed(2),
    totalGST.toFixed(2),
    totalGrandTotal.toFixed(2),
    mismatchCount === 0 ? 'All Correct' : `${mismatchCount} Discrepancy`,
  ];

  // Draw AutoTable
  autoTable(doc, {
    startY: 135,
    margin: { left: 36, right: 36, bottom: 40 },
    head: [tableHeaders],
    body: tableBody,
    foot: [summaryRow],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9,
      lineColor: [203, 213, 225],
      lineWidth: 0.75,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' },      // #
      1: { cellWidth: 64, halign: 'center' },      // Date
      2: { cellWidth: 125, fontStyle: 'bold' },    // Employee
      3: { cellWidth: 125 },                       // Clinic
      4: { cellWidth: 'auto' },                    // Illness
      5: { cellWidth: 70, halign: 'right' },       // Sub-total
      6: { cellWidth: 55, halign: 'right' },       // GST
      7: { cellWidth: 75, halign: 'right', fontStyle: 'bold' }, // Grand Total
      8: { cellWidth: 80, halign: 'center' },      // Status
    },
    didDrawCell: (data) => {
      // Color-code the status column in body
      if (data.section === 'body' && data.column.index === 8) {
        const text = String(data.cell.raw);
        if (text.startsWith('Mismatch')) {
          doc.setTextColor(225, 29, 72); // rose-600
        } else if (text === 'Correct') {
          doc.setTextColor(16, 185, 129); // emerald-500
        }
      }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'MedClaim Submission Portal - System Generated Official Audit Document',
        36,
        pageHeight - 18
      );
      doc.text(str, pageWidth - 36, pageHeight - 18, { align: 'right' });
    },
  });

  // Save / trigger download
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  doc.save(cleanFileName);
}
