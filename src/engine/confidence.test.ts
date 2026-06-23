import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateConfidence } from './confidence';
import { AnswerState, ConfidenceLevel } from '../types';

const answerStateArb = fc.constantFrom('known', 'unknown', 'pending_confirmation') as fc.Arbitrary<AnswerState>;

/**
 * **Validates: Requirements 24.2, 24.3, 24.4**
 * Property 6: Confidence level is determined by answer completeness
 */
describe('Property 6: Confidence level is determined by answer completeness', () => {
  it('all known answers produce Alta confiança', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constant('known' as AnswerState), { minLength: 1, maxLength: 20 }),
        (states) => {
          expect(calculateConfidence(states)).toBe('Alta confiança');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('answers containing unknown produce Baixa confiança', () => {
    fc.assert(
      fc.property(
        fc.array(answerStateArb, { minLength: 1, maxLength: 20 }).filter(
          states => states.includes('unknown')
        ),
        (states) => {
          expect(calculateConfidence(states)).toBe('Baixa confiança — dados em falta');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('answers containing pending_confirmation produce Baixa confiança', () => {
    fc.assert(
      fc.property(
        fc.array(answerStateArb, { minLength: 1, maxLength: 20 }).filter(
          states => states.includes('pending_confirmation') && !states.includes('unknown')
        ),
        (states) => {
          expect(calculateConfidence(states)).toBe('Baixa confiança — dados em falta');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty array produces Baixa confiança', () => {
    expect(calculateConfidence([])).toBe('Baixa confiança — dados em falta');
  });

  it('result is always one of the three valid confidence levels', () => {
    fc.assert(
      fc.property(
        fc.array(answerStateArb, { minLength: 0, maxLength: 20 }),
        (states) => {
          const result = calculateConfidence(states);
          const validLevels: ConfidenceLevel[] = [
            'Alta confiança',
            'Confiança média',
            'Baixa confiança — dados em falta',
          ];
          expect(validLevels).toContain(result);
        }
      ),
      { numRuns: 200 }
    );
  });
});
