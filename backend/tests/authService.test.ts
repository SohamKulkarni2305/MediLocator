import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hashPassword,
  signAccessToken,
  verifyPassword,
  verifyToken,
} from '../src/services/authService';

describe('auth service', () => {
  it('hashes and verifies passwords without retaining the plaintext', async () => {
    const password = 'TestPassword!123';
    const hash = await hashPassword(password);

    assert.notEqual(hash, password);
    assert.equal(await verifyPassword(password, hash), true);
    assert.equal(await verifyPassword('wrong-password', hash), false);
  });

  it('signs and verifies access token claims', () => {
    const token = signAccessToken({ userId: 'user-1', email: 'test@example.com', role: 'CUSTOMER' });
    const claims = verifyToken(token, 'access');
    assert.deepEqual({
      userId: claims.userId,
      email: claims.email,
      role: claims.role,
    }, {
      userId: 'user-1',
      email: 'test@example.com',
      role: 'CUSTOMER',
    });
  });
});
