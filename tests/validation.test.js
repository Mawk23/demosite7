const { validateEmail, validateDOB, isValidPhone, normalizePhone } = require('../controllers/userController');

describe('Input Validation', () => {
  describe('Email validation', () => {
    test('valid emails should pass', () => {
      expect(validateEmail('alice@example.com')).toBe(true);
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
    });

    test('invalid emails should fail', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('Phone validation', () => {
    test('valid phone numbers should pass', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    test('invalid phone numbers should fail', () => {
      expect(isValidPhone('123')).toBe(false); // too short
      expect(isValidPhone('abc1234567')).toBe(false); // non-numeric
    });

    test('empty phone should be valid (optional field)', () => {
      expect(isValidPhone('')).toBe(true);
      expect(isValidPhone(null)).toBe(true);
    });

    test('normalizePhone should strip formatting', () => {
      expect(normalizePhone('123-456-7890')).toBe('1234567890');
      expect(normalizePhone('(123) 456-7890')).toBe('1234567890');
      expect(normalizePhone('+1 234 567 8900')).toBe('+12345678900');
    });
  });

  describe('Date of birth validation', () => {
    test('valid past dates should pass', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 25);
      expect(validateDOB(pastDate.toISOString().slice(0, 10))).toBe(true);
    });

    test('future dates should fail', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validateDOB(futureDate.toISOString().slice(0, 10))).toBe(false);
    });

    test('invalid dates should fail', () => {
      expect(validateDOB('not-a-date')).toBe(false);
      expect(validateDOB('2025-13-01')).toBe(false);
    });

    test('users under 13 should fail', () => {
      const tooYoung = new Date();
      tooYoung.setFullYear(tooYoung.getFullYear() - 10);
      expect(validateDOB(tooYoung.toISOString().slice(0, 10))).toBe(false);
    });

    test('empty dob should be valid (optional field)', () => {
      expect(validateDOB('')).toBe(true);
      expect(validateDOB(null)).toBe(true);
    });
  });
});
