import { COLORS, SIZES, API_URL, SOCKET_URL } from '../constants';
import { Platform } from 'react-native';

describe('Constants', () => {
  describe('COLORS', () => {
    it('should define all required colors', () => {
      expect(COLORS.primary).toBeDefined();
      expect(COLORS.secondary).toBeDefined();
      expect(COLORS.background).toBeDefined();
      expect(COLORS.white).toBeDefined();
      expect(COLORS.text).toBeDefined();
      expect(COLORS.textSecondary).toBeDefined();
      expect(COLORS.border).toBeDefined();
      expect(COLORS.danger).toBeDefined();
      expect(COLORS.success).toBeDefined();
      expect(COLORS.online).toBeDefined();
      expect(COLORS.offline).toBeDefined();
    });

    it('should have valid color values', () => {
      expect(COLORS.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(COLORS.danger).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(COLORS.success).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('SIZES', () => {
    it('should define all required sizes', () => {
      expect(SIZES.xs).toBeDefined();
      expect(SIZES.sm).toBeDefined();
      expect(SIZES.md).toBeDefined();
      expect(SIZES.lg).toBeDefined();
      expect(SIZES.xl).toBeDefined();
      expect(SIZES.padding).toBeDefined();
      expect(SIZES.margin).toBeDefined();
      expect(SIZES.borderRadius).toBeDefined();
      expect(SIZES.avatar).toBeDefined();
    });

    it('should have numeric values', () => {
      expect(typeof SIZES.xs).toBe('number');
      expect(typeof SIZES.padding).toBe('number');
      expect(typeof SIZES.avatar).toBe('number');
    });

    it('should have logical size progression', () => {
      expect(SIZES.xs).toBeLessThan(SIZES.sm);
      expect(SIZES.sm).toBeLessThan(SIZES.md);
      expect(SIZES.md).toBeLessThan(SIZES.lg);
      expect(SIZES.lg).toBeLessThan(SIZES.xl);
    });
  });

  describe('API_URL', () => {
    it('should be defined', () => {
      expect(API_URL).toBeDefined();
      expect(typeof API_URL).toBe('string');
    });

    it('should be a valid URL', () => {
      expect(API_URL).toMatch(/^https?:\/\/.+/);
    });
  });

  describe('SOCKET_URL', () => {
    it('should be defined', () => {
      expect(SOCKET_URL).toBeDefined();
      expect(typeof SOCKET_URL).toBe('string');
    });

    it('should be a valid URL', () => {
      expect(SOCKET_URL).toMatch(/^https?:\/\/.+/);
    });

    it('should use correct URL for Android emulator', () => {
      if (Platform.OS === 'android') {
        expect(SOCKET_URL).toContain('10.0.2.2');
      }
    });
  });
});
