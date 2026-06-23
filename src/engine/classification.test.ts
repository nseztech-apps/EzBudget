import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { classifyExpense } from './classification';
import { Classification } from '../types';

/**
 * **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
 * Property 1: Classification is determined solely by Waste Score thresholds
 */
describe('Property 1: Classification is determined solely by Waste Score thresholds', () => {
  it('score 0-2 always classifies as OK', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (score) => {
        expect(classifyExpense(score)).toBe('OK');
      }),
      { numRuns: 100 }
    );
  });

  it('score 3-5 always classifies as Review', () => {
    fc.assert(
      fc.property(fc.integer({ min: 3, max: 5 }), (score) => {
        expect(classifyExpense(score)).toBe('Review');
      }),
      { numRuns: 100 }
    );
  });

  it('score 6-8 always classifies as Strong Cut Candidate', () => {
    fc.assert(
      fc.property(fc.integer({ min: 6, max: 8 }), (score) => {
        expect(classifyExpense(score)).toBe('Strong Cut Candidate');
      }),
      { numRuns: 100 }
    );
  });

  it('score 9+ always classifies as Critical Leak', () => {
    fc.assert(
      fc.property(fc.integer({ min: 9, max: 100 }), (score) => {
        expect(classifyExpense(score)).toBe('Critical Leak');
      }),
      { numRuns: 100 }
    );
  });

  it('classification is exactly one of the four valid values', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 50 }), (score) => {
        const result = classifyExpense(score);
        const validClassifications: Classification[] = ['OK', 'Review', 'Strong Cut Candidate', 'Critical Leak'];
        expect(validClassifications).toContain(result);
      }),
      { numRuns: 200 }
    );
  });

  it('every non-negative integer has exactly one classification', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100 }), (score) => {
        const result = classifyExpense(score);
        // Verify it returns a valid classification
        expect(['OK', 'Review', 'Strong Cut Candidate', 'Critical Leak']).toContain(result);
      }),
      { numRuns: 200 }
    );
  });
});
