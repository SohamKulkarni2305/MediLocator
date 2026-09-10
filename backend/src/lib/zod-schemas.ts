import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Drugs ────────────────────────────────────────────────────────────────────

export const DrugSearchSchema = z.object({
  q: z.string().optional(),
  inStock: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default(20),
  offset: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(0))
    .optional()
    .default(0),
});

// ─── Prescriptions ────────────────────────────────────────────────────────────

export const PrescriptionUploadSchema = z.object({
  source: z.enum(['camera', 'file', 'abha_sync']),
  doctorName: z.string().min(1, 'Doctor name is required').optional(),
  clinicName: z.string().min(1, 'Clinic name is required').optional(),
});

export const RejectPrescriptionSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export const ApprovePrescriptionSchema = z.object({
  pharmacistName: z.string().min(1, 'Pharmacist name is required'),
  pharmacistLicense: z.string().min(1, 'Pharmacist license is required'),
});

// ─── Pharmacies ───────────────────────────────────────────────────────────────

export const PharmacyActionSchema = z.object({
  notes: z.string().optional(),
});

export const RejectPharmacySchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

// ─── Cases ────────────────────────────────────────────────────────────────────

export const CaseSignoffSchema = z.object({
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
  pharmacistName: z.string().min(1, 'Pharmacist name is required'),
  pharmacistLicense: z.string().min(1, 'Pharmacist license is required'),
});

// ─── AI ───────────────────────────────────────────────────────────────────────

export const DrugMatchSchema = z.object({
  molecules: z
    .array(z.string().min(1))
    .min(1, 'At least one molecule is required')
    .max(20, 'Maximum 20 molecules per request'),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof LoginSchema>;
export type DrugSearchInput = z.infer<typeof DrugSearchSchema>;
export type PrescriptionUploadInput = z.infer<typeof PrescriptionUploadSchema>;
export type RejectPrescriptionInput = z.infer<typeof RejectPrescriptionSchema>;
export type ApprovePrescriptionInput = z.infer<typeof ApprovePrescriptionSchema>;
export type CaseSignoffInput = z.infer<typeof CaseSignoffSchema>;
export type DrugMatchInput = z.infer<typeof DrugMatchSchema>;
