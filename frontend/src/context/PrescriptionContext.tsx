import React, { createContext, useContext, useState, useCallback } from 'react';
import { playVerificationChime } from '../utils/audioChime';

export type PrescriptionStatus = 'pending' | 'approved' | 'rejected' | 'verified' | 'expired';

export interface PrescriptionMedicine {
  id: string;
  brandedName: string;
  genericName: string;
  dosage: string;
  duration: string;
  genericSavingsUSD: number;
  genericSavingsINR: number;
}

export interface PharmacistSignoff {
  name: string;
  license: string;
  timestamp: string;
}

export interface PrescriptionRecord {
  id: string;
  rxNumber: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadTimestamp: string;
  source: 'camera' | 'file' | 'abha_sync';
  sourceLabel: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorReg: string;
  clinicName: string;
  clinicLocation: string;
  status: PrescriptionStatus;
  statusLabel: string;
  statusDescription: string;
  ocrConfidence: number;
  validUntil: string;
  daysRemaining: number | null;
  refillsAllowed: number;
  refillsRemaining: number;
  medicines: PrescriptionMedicine[];
  auditHash: string;
  pharmacistSignoff?: PharmacistSignoff;
  rejectionReason?: string;
}

export interface VerificationToast {
  id: string;
  rxId: string;
  rxNumber: string;
  doctorName: string;
  clinicName: string;
  type: 'approved' | 'rejected';
  title: string;
  message: string;
  reason?: string;
  medicinesSummary?: string;
  timestamp: string;
  createdAt: number;
  durationMs: number;
}

export const INITIAL_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: 'rx-hist-1',
    rxNumber: 'RX-2026-0905-01',
    fileName: 'rx_cardio_arvind_mehta.pdf',
    fileSize: '1.4 MB',
    uploadDate: '05 Sep 2026',
    uploadTimestamp: '10:24 AM IST',
    source: 'file',
    sourceLabel: 'Device Document (PDF)',
    doctorName: 'Dr. Arvind Mehta, MD, DM',
    doctorSpecialty: 'Interventional Cardiology',
    doctorReg: 'MED-LIC-88219 (NABH / MCI)',
    clinicName: 'Metro Heart & Diabetes Care Clinic',
    clinicLocation: 'Indiranagar, Bengaluru',
    status: 'approved',
    statusLabel: 'Verified & Active',
    statusDescription: 'AI OCR verified and digitally signed by licensed Chief Pharmacist. Active for auto-refill.',
    ocrConfidence: 99.4,
    validUntil: '05 Dec 2026',
    daysRemaining: 88,
    refillsAllowed: 3,
    refillsRemaining: 2,
    medicines: [
      {
        id: 'med-1',
        brandedName: 'Lipitor 10mg',
        genericName: 'Atorvastatin Calcium 10mg Tablet (Cipla)',
        dosage: '1 tablet at bedtime (hs)',
        duration: '30 days',
        genericSavingsUSD: 30.50,
        genericSavingsINR: 305.00,
      },
      {
        id: 'med-2',
        brandedName: 'Glucophage 500mg ER',
        genericName: 'Metformin HCl 500mg ER (Sun Pharma)',
        dosage: '1 tablet twice daily after meals (BD pc)',
        duration: '60 days',
        genericSavingsUSD: 20.80,
        genericSavingsINR: 208.00,
      },
    ],
    auditHash: '0x8f29c4e019b8417d...a92b',
    pharmacistSignoff: {
      name: 'Ashok Kumar, M.Pharm, RPh',
      license: 'KA-PHARM-44102 / CDSCO Registered',
      timestamp: '05 Sep 2026, 10:42 AM IST',
    },
  },
  {
    id: 'rx-hist-2',
    rxNumber: 'RX-2026-0902-04',
    fileName: 'rx_pulmo_rajeshwar_rao.png',
    fileSize: '1.9 MB',
    uploadDate: '02 Sep 2026',
    uploadTimestamp: '04:15 PM IST',
    source: 'camera',
    sourceLabel: '4K Camera Capture',
    doctorName: 'Dr. Rajeshwar Rao, MD',
    doctorSpecialty: 'Chest & Pulmonology Care',
    doctorReg: 'MCI-REG-77103',
    clinicName: 'Apex Pulmonary & Allergy Clinic',
    clinicLocation: 'Koramangala, Bengaluru',
    status: 'approved',
    statusLabel: 'Verified & Active',
    statusDescription: 'Optical angle perspective corrected, salts verified against FDA Orange Book standards.',
    ocrConfidence: 99.1,
    validUntil: '02 Nov 2026',
    daysRemaining: 55,
    refillsAllowed: 2,
    refillsRemaining: 1,
    medicines: [
      {
        id: 'med-3',
        brandedName: 'Singulair 10mg',
        genericName: 'Montelukast Sodium 10mg (Mankind)',
        dosage: '1 tablet daily at evening',
        duration: '30 days',
        genericSavingsUSD: 29.10,
        genericSavingsINR: 291.00,
      },
      {
        id: 'med-4',
        brandedName: 'Zyrtec 10mg',
        genericName: 'Cetirizine Hydrochloride 10mg (Dr. Reddy)',
        dosage: '1 tablet SOS for allergic rhinitis',
        duration: '15 days',
        genericSavingsUSD: 13.50,
        genericSavingsINR: 135.00,
      },
    ],
    auditHash: '0x3c71a93b22de1908...817c',
    pharmacistSignoff: {
      name: 'Pooja Nair, B.Pharm, RPh',
      license: 'KA-PHARM-51299 / CDSCO Registered',
      timestamp: '02 Sep 2026, 04:30 PM IST',
    },
  },
  {
    id: 'rx-hist-3',
    rxNumber: 'RX-2026-0828-09',
    fileName: 'rx_gastro_shalini_verma.jpg',
    fileSize: '2.8 MB',
    uploadDate: '28 Aug 2026',
    uploadTimestamp: '11:30 AM IST',
    source: 'file',
    sourceLabel: 'Device Document (JPG)',
    doctorName: 'Dr. Shalini Verma, MD',
    doctorSpecialty: 'Gastroenterology & Hepatology',
    doctorReg: 'MCI-REG-44912',
    clinicName: 'City Digestive Health Center',
    clinicLocation: 'Whitefield, Bengaluru',
    status: 'pending',
    statusLabel: 'Pending Pharmacist Review',
    statusDescription: 'OCR salt extraction complete (98.7% match). Awaiting scheduled tele-pharmacist signoff for Schedule H1 antibiotic.',
    ocrConfidence: 98.7,
    validUntil: 'Under Verification',
    daysRemaining: null,
    refillsAllowed: 1,
    refillsRemaining: 1,
    medicines: [
      {
        id: 'med-5',
        brandedName: 'Nexium 40mg',
        genericName: 'Esomeprazole Magnesium 40mg DR (Torrent)',
        dosage: '1 capsule empty stomach in morning',
        duration: '14 days',
        genericSavingsUSD: 26.20,
        genericSavingsINR: 262.00,
      },
      {
        id: 'med-6',
        brandedName: 'Augmentin 625mg Duo',
        genericName: 'Amoxicillin + Clavulanate (500/125mg) (Alkem)',
        dosage: '1 tablet twice daily after meals',
        duration: '6 days',
        genericSavingsUSD: 16.00,
        genericSavingsINR: 160.00,
      },
    ],
    auditHash: '0x17b4c901a52e663a...ff20',
  },
  {
    id: 'rx-hist-4',
    rxNumber: 'RX-2026-0610-02',
    fileName: 'rx_derma_skin_cure_june.pdf',
    fileSize: '890 KB',
    uploadDate: '10 Jun 2026',
    uploadTimestamp: '02:40 PM IST',
    source: 'abha_sync',
    sourceLabel: 'ABHA Health Locker Sync',
    doctorName: 'Dr. Sunita Kulkarni, MD',
    doctorSpecialty: 'Dermatology & Cutaneous Medicine',
    doctorReg: 'MCI-REG-29104',
    clinicName: 'Kaya Skin & Allergy Center',
    clinicLocation: 'Jayanagar, Bengaluru',
    status: 'expired',
    statusLabel: 'Expired / Completed',
    statusDescription: 'Prescription valid cycle ended on 10 Aug 2026. All approved refills successfully dispensed.',
    ocrConfidence: 99.0,
    validUntil: '10 Aug 2026',
    daysRemaining: 0,
    refillsAllowed: 2,
    refillsRemaining: 0,
    medicines: [
      {
        id: 'med-7',
        brandedName: 'Elocon Cream 0.1%',
        genericName: 'Mometasone Furoate 0.1% Topical Cream (Glenmark)',
        dosage: 'Apply thin layer once daily to affected skin',
        duration: '14 days',
        genericSavingsUSD: 14.20,
        genericSavingsINR: 142.00,
      },
      {
        id: 'med-8',
        brandedName: 'Clarinex 5mg',
        genericName: 'Desloratadine 5mg Tablet (Zydus Cadila)',
        dosage: '1 tablet once daily morning',
        duration: '10 days',
        genericSavingsUSD: 9.80,
        genericSavingsINR: 98.00,
      },
    ],
    auditHash: '0x94f1082cba394811...e201',
    pharmacistSignoff: {
      name: 'Ashok Kumar, M.Pharm, RPh',
      license: 'KA-PHARM-44102',
      timestamp: '10 Jun 2026, 03:05 PM IST',
    },
  },
];

interface PrescriptionContextType {
  prescriptions: PrescriptionRecord[];
  toasts: VerificationToast[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  dismissToast: (toastId: string) => void;
  addVerificationToast: (
    toastData: Omit<VerificationToast, 'id' | 'createdAt' | 'durationMs'>
  ) => void;
  updatePrescriptionStatus: (
    rxId: string,
    newStatus: 'approved' | 'rejected' | 'pending',
    reason?: string
  ) => void;
  simulateStatusChange: (
    rxId: string,
    targetStatus: 'approved' | 'rejected',
    delaySeconds?: number,
    customReason?: string
  ) => void;
  getPrescriptionById: (id: string) => PrescriptionRecord | undefined;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

export const PrescriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(INITIAL_PRESCRIPTIONS);
  const [toasts, setToasts] = useState<VerificationToast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const addVerificationToast = useCallback(
    (toastData: Omit<VerificationToast, 'id' | 'createdAt' | 'durationMs'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const durationMs = 7000;
      const newToast: VerificationToast = {
        ...toastData,
        id,
        createdAt: Date.now(),
        durationMs,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 4));

      if (soundEnabled) {
        playVerificationChime(toastData.type);
      }

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);
    },
    [soundEnabled]
  );

  const updatePrescriptionStatus = useCallback(
    (rxId: string, newStatus: 'approved' | 'rejected' | 'pending', reason?: string) => {
      setPrescriptions((prevList) => {
        const target = prevList.find((p) => p.id === rxId);
        if (!target) return prevList;

        const previousStatus = target.status;

        const nowFormatted = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const dateFormatted = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        let updatedRx: PrescriptionRecord;

        if (newStatus === 'approved') {
          updatedRx = {
            ...target,
            status: 'approved',
            statusLabel: 'Verified & Active',
            statusDescription: `Approved by Chief Pharmacist Ashok Kumar (${dateFormatted}, ${nowFormatted}). Generic substitutions active.`,
            validUntil: '08 Dec 2026',
            daysRemaining: 90,
            rejectionReason: undefined,
            pharmacistSignoff: {
              name: 'Ashok Kumar, M.Pharm, RPh',
              license: 'KA-PHARM-44102 / CDSCO Registered',
              timestamp: `${dateFormatted}, ${nowFormatted} IST`,
            },
          };
        } else if (newStatus === 'rejected') {
          const rejectReasonText =
            reason || 'Incomplete clinical doctor stamp and dosage exceeds CDSCO threshold';
          updatedRx = {
            ...target,
            status: 'rejected',
            statusLabel: 'Verification Rejected',
            statusDescription: `Rejected during clinical audit: ${rejectReasonText}. Please re-upload a clear prescription.`,
            validUntil: 'Rejected',
            daysRemaining: 0,
            rejectionReason: rejectReasonText,
          };
        } else {
          // Reset to pending
          updatedRx = {
            ...target,
            status: 'pending',
            statusLabel: 'Pending Pharmacist Review',
            statusDescription:
              'OCR salt extraction complete (98.7% match). Awaiting scheduled tele-pharmacist signoff for Schedule H1 antibiotic.',
            validUntil: 'Under Verification',
            daysRemaining: null,
            rejectionReason: undefined,
            pharmacistSignoff: undefined,
          };
        }

        // TRIGGER NOTIFICATION TOAST when status changes from 'pending' to 'approved' or 'rejected'
        if (previousStatus === 'pending' && (newStatus === 'approved' || newStatus === 'rejected')) {
          const medSummary = target.medicines.map((m) => m.brandedName).join(', ');
          if (newStatus === 'approved') {
            addVerificationToast({
              rxId: target.id,
              rxNumber: target.rxNumber,
              doctorName: target.doctorName,
              clinicName: target.clinicName,
              type: 'approved',
              title: 'Prescription Verification Approved',
              message: `Dr. ${target.doctorName}'s prescription (${target.rxNumber}) is verified and signed off by Chief Pharmacist. Bioequivalent generics are unlocked!`,
              medicinesSummary: medSummary,
              timestamp: `${nowFormatted} IST`,
            });
          } else {
            const rejectReasonText =
              reason || 'Doctor registration credentials or signature could not be verified';
            addVerificationToast({
              rxId: target.id,
              rxNumber: target.rxNumber,
              doctorName: target.doctorName,
              clinicName: target.clinicName,
              type: 'rejected',
              title: 'Prescription Verification Rejected',
              message: `Prescription (${target.rxNumber}) could not be approved. Reason: ${rejectReasonText}. Please re-upload a clear document.`,
              reason: rejectReasonText,
              medicinesSummary: medSummary,
              timestamp: `${nowFormatted} IST`,
            });
          }
        }

        return prevList.map((p) => (p.id === rxId ? updatedRx : p));
      });
    },
    [addVerificationToast]
  );

  const simulateStatusChange = useCallback(
    (
      rxId: string,
      targetStatus: 'approved' | 'rejected',
      delaySeconds: number = 0,
      customReason?: string
    ) => {
      if (delaySeconds <= 0) {
        updatePrescriptionStatus(rxId, targetStatus, customReason);
      } else {
        setTimeout(() => {
          updatePrescriptionStatus(rxId, targetStatus, customReason);
        }, delaySeconds * 1000);
      }
    },
    [updatePrescriptionStatus]
  );

  const getPrescriptionById = useCallback(
    (id: string) => {
      return prescriptions.find((p) => p.id === id);
    },
    [prescriptions]
  );

  return (
    <PrescriptionContext.Provider
      value={{
        prescriptions,
        toasts,
        soundEnabled,
        setSoundEnabled,
        dismissToast,
        addVerificationToast,
        updatePrescriptionStatus,
        simulateStatusChange,
        getPrescriptionById,
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};

export const usePrescription = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescription must be used within a PrescriptionProvider');
  }
  return context;
};
