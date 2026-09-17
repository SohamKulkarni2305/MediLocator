import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ApprovePrescriptionSchema,
  DrugSearchSchema,
  RegisterSchema,
  RejectPrescriptionSchema,
} from '../src/lib/zod-schemas';

describe('request validation schemas', () => {
  it('normalizes paginated drug search query values', () => {
    const result = DrugSearchSchema.parse({ q: 'metformin', inStock: 'true' });

    assert.deepEqual(result, { q: 'metformin', inStock: true, limit: 20, offset: 0 });
  });

  it('rejects invalid pagination values', () => {
    assert.throws(() => DrugSearchSchema.parse({ limit: '0' }));
    assert.throws(() => DrugSearchSchema.parse({ offset: '-1' }));
  });

  it('requires a meaningful rejection reason', () => {
    assert.throws(() => RejectPrescriptionSchema.parse({ reason: 'unclear' }));
    assert.deepEqual(RejectPrescriptionSchema.parse({ reason: 'Doctor registration could not be verified' }), {
      reason: 'Doctor registration could not be verified',
    });
  });

  it('requires pharmacist identity for approval', () => {
    assert.throws(() => ApprovePrescriptionSchema.parse({ pharmacistName: 'A' }));
    assert.deepEqual(ApprovePrescriptionSchema.parse({ pharmacistName: 'A. Kumar', pharmacistLicense: 'KA-123' }), {
      pharmacistName: 'A. Kumar',
      pharmacistLicense: 'KA-123',
    });
  });

  it('validates and normalizes new customer registration data', () => {
    assert.deepEqual(RegisterSchema.parse({
      name: '  New Patient ',
      email: ' PATIENT@EXAMPLE.COM ',
      password: 'SecurePass!123',
    }), {
      name: 'New Patient',
      email: 'patient@example.com',
      password: 'SecurePass!123',
      role: 'CUSTOMER',
    });
    assert.equal(RegisterSchema.parse({ name: 'A Pharmacist', email: 'pharmacist@example.com', password: 'SecurePass!123', role: 'PHARMACIST' }).role, 'PHARMACIST');
    assert.throws(() => RegisterSchema.parse({ name: 'A', email: 'bad', password: 'short' }));
  });
});
