export interface DrugItem {
  id: string;
  brandName: string;
  genericName: string;
  saltName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  isBrand: boolean;
  priceUSD: number;
  priceINR: number;
  originalPriceUSD?: number;
  originalPriceINR?: number;
  ndcCode?: string;
  equivalenceCode: string; // 'AB', 'AA', etc.
  certification: string; // 'WHO-GMP', 'FDA Approved'
  lotNumber?: string;
  expiryDate?: string;
  savingsPercentage: number;
  inStock: boolean;
}

export interface PharmacyKYC {
  id: string;
  name: string;
  code: string;
  licenseNumber: string;
  staffCount: string;
  cluster: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'inspection_pending';
  submittedTime: string;
  gstinVerified: boolean;
  documents: {
    name: string;
    verified: boolean;
    statusText?: string;
  }[];
}

export interface InventoryRecord {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  cluster: string;
  drugName: string;
  genericName: string;
  lotNumber: string;
  quantity: number;
  reorderPoint: number;
  unit: string;
  expiryDate: string;
  status: 'healthy' | 'low' | 'out_of_stock' | 'expiring';
}

export interface AuditLedgerEntry {
  id: string;
  type: 'APPROVED' | 'BLOCKED' | 'AUDIT' | 'DISPATCH';
  title: string;
  timestamp: string;
  description: string;
  details: {
    label: string;
    value: string;
    isHighlight?: boolean;
    isWarning?: boolean;
  }[];
  signature?: string;
}

export interface OrangeBookEntry {
  id: string;
  brandName: string;
  saltName: string;
  dosageForm: string;
  equivalenceCode: string;
  ceilingPriceUSD: string;
  ceilingPriceINR: string;
  genericMedianUSD: string;
  genericMedianINR: string;
  savingsPercent: string;
  savingsUSD: string;
  savingsINR: string;
}

export interface PharmacistCase {
  id: string;
  caseNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  mrn: string;
  bp: string;
  hba1c: string;
  condition: string;
  allergies: string;
  prescriberName: string;
  prescriberDegree: string;
  clinicName: string;
  clinicAddress: string;
  clinicLicense: string;
  prescriberReg: string;
  slaRemainingSeconds: number;
  status: 'Ready for Match' | 'OCR Processing' | 'Pre-Screened' | 'Queued' | 'Active';
  lineItems: {
    id: string;
    brandedName: string;
    brandedManufacturer: string;
    brandedPriceUSD: number;
    brandedPriceINR: number;
    genericName: string;
    genericManufacturer: string;
    genericPriceUSD: number;
    genericPriceINR: number;
    dosageInstructions: string;
    quantity: string;
    equivalenceCode: string;
    lotNumber: string;
    expiryDate: string;
    verified: boolean;
  }[];
  molecules: {
    id: string;
    name: string;
    confidence: number;
    drugClass: string;
    status: string;
  }[];
}

export interface OrderTrackingState {
  orderId: string;
  patientName: string;
  etaMinutes: number;
  courierName: string;
  courierSpeedKmh: number;
  courierDistanceMeters: number;
  temperatureCelsius: number;
  currentMilestoneIndex: number;
  milestones: {
    step: string;
    time: string;
    detail: string;
    completed: boolean;
    current?: boolean;
  }[];
  dispensaryName: string;
  dispensaryAddress: string;
  pharmacistInCharge: string;
  totalSavedUSD: number;
  totalPaidUSD: number;
  totalSavedINR: number;
  totalPaidINR: number;
  handoverOtp: string;
}

export type ActiveScreen = 
  | 'admin-console'
  | 'pharmacist-workstation'
  | 'customer-search'
  | 'customer-prescription'
  | 'customer-tracking'
  | 'customer-account'
  | 'architecture-blueprint';

export type Currency = 'USD' | 'INR';

export type Theme = 'dark' | 'light';
export type Language = 'en' | 'hi';
