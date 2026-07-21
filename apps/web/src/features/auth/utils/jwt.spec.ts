import { describe, it, expect } from 'vitest';
import { jwtDecode } from './jwt';

describe('jwtDecode', () => {
  it('should decode a valid JWT token', () => {
    // A mock JWT token structure: header.payload.signature
    // Payload contains { "userId": "123", "role": "ADMIN" }
    // Base64 encoded payload: eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiQURNSU4ifQ==
    const validToken = 'header.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiQURNSU4ifQ.signature';

    const decoded = jwtDecode<{ userId: string; role: string }>(validToken);
    expect(decoded).toEqual({ userId: '123', role: 'ADMIN' });
  });

  it('should throw an error for an invalid JWT format (not 3 parts)', () => {
    const invalidToken = 'header.payload'; // Only 2 parts
    expect(() => jwtDecode(invalidToken)).toThrow('Invalid JWT format');
  });

  it('should throw an error if payload is missing/empty', () => {
    const emptyPayloadToken = 'header..signature';
    expect(() => jwtDecode(emptyPayloadToken)).toThrow('Invalid JWT: missing payload');
  });

  it('should handle base64url padding correctly', () => {
    // Base64url without padding (common in JWTs)
    // Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
    const token =
      'header.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.signature';
    const decoded = jwtDecode(token);
    expect(decoded).toHaveProperty('name', 'John Doe');
  });
});
