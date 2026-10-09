export interface MedicalRecord {
  id: string;
  date: string;
  employeeName: string;
  clinicName: string;
  subTotal: number;
  gst: number;
  grandTotal: number;
  illnessSummary: string;
  category?: string;
  receiptNo?: string;
  remarks?: string;
  createdAt: number;
}

export type MedicalRecordInput = Omit<MedicalRecord, 'id' | 'createdAt'>;

export interface ClaimStats {
  totalRecords: number;
  totalSubTotal: number;
  totalGST: number;
  totalGrandTotal: number;
  uniqueEmployees: number;
  uniqueClinics: number;
  averageClaim: number;
}

export type SortField = 'date' | 'employeeName' | 'clinicName' | 'subTotal' | 'gst' | 'grandTotal' | 'illnessSummary';
export type SortOrder = 'asc' | 'desc';
