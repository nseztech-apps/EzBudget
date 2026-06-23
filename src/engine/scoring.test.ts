import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ExpenseItem } from '../types';
import {
  applyAutoRenewalRule,
  applyLowUsageRule,
  applyWouldntMissRule,
  applyDuplicateRule,
  applyNotReviewedRule,
  applyHabitFrequencyRule,
  applyImpulsePurchaseRule,
  calculateWasteScore,
} from './scoring';
import { allScoringRules } from '../config/scoringRules';

// Generator for ExpenseItem
const expenseItemArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  sectionId: fc.string({ minLength: 1, maxLength: 20 }),
  questionId: fc.string({ minLength: 1, maxLength: 20 }),
  category: fc.string({ minLength: 1, maxLength: 30 }),
  description: fc.string({ minLength: 1, maxLength: 50 }),
  monthlyCost: fc.float({ min: 0, max: 10000, noNaN: true }),
  autoRenewal: fc.option(fc.boolean(), { nil: undefined }),
  usageFrequency: fc.option(
    fc.constantFrom('never', 'rarely', 'sometimes', 'often', 'daily') as fc.Arbitrary<'never' | 'rarely' | 'sometimes' | 'often' | 'daily'>,
    { nil: undefined }
  ),
  wouldBeMissed: fc.option(fc.boolean(), { nil: undefined }),
  duplicateOf: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  lastReviewed: fc.option(
    fc.constantFrom('never', 'over_12_months', 'under_12_months') as fc.Arbitrary<'never' | 'over_12_months' | 'under_12_months'>,
    { nil: undefined }
  ),
  answerState: fc.constantFrom('known', 'unknown', 'pending_confirmation') as fc.Arbitrary<'known' | 'unknown' | 'pending_confirmation'>,
  isImpulsePurchase: fc.option(fc.boolean(), { nil: undefined }),
  habitFrequency: fc.option(
    fc.constantFrom('daily', 'weekly', 'monthly') as fc.Arbitrary<'daily' | 'weekly' | 'monthly'>,
    { nil: undefined }
  ),
});

/**
 * **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.7, 16.8**
 * Property 2: Scoring rules are additive and bounded
 */
describe('Property 2: Scoring rules are additive and bounded', () => {
  it('total waste score equals sum of individual rule scores', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const totalScore = calculateWasteScore(item, allScoringRules);

        // Calculate expected sum by applying each rule individually
        let expectedSum = 0;
        expectedSum += applyAutoRenewalRule(item);
        expectedSum += applyLowUsageRule(item);
        expectedSum += applyWouldntMissRule(item);
        expectedSum += applyDuplicateRule(item);
        expectedSum += applyNotReviewedRule(item);
        expectedSum += applyHabitFrequencyRule(item);
        expectedSum += applyImpulsePurchaseRule(item);

        expect(totalScore).toBe(expectedSum);
      }),
      { numRuns: 200 }
    );
  });

  it('auto-renewal rule contributes exactly +2 when applicable', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = applyAutoRenewalRule(item);
        if (item.autoRenewal === true) {
          expect(score).toBe(2);
        } else {
          expect(score).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('low usage rule contributes exactly +4 when applicable', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = applyLowUsageRule(item);
        if (item.usageFrequency === 'never' || item.usageFrequency === 'rarely') {
          expect(score).toBe(4);
        } else {
          expect(score).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('wouldnt-miss rule contributes exactly +5 when applicable', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = applyWouldntMissRule(item);
        if (item.wouldBeMissed === false) {
          expect(score).toBe(5);
        } else {
          expect(score).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('duplicate rule contributes exactly +3 when applicable', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = applyDuplicateRule(item);
        if (item.duplicateOf !== undefined && item.duplicateOf !== '') {
          expect(score).toBe(3);
        } else {
          expect(score).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('not-reviewed rule contributes exactly +3 when applicable', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = applyNotReviewedRule(item);
        if (item.lastReviewed === 'never' || item.lastReviewed === 'over_12_months') {
          expect(score).toBe(3);
        } else {
          expect(score).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('habit frequency rule contributes +3 to +5 based on frequency', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = applyHabitFrequencyRule(item);
        if (item.habitFrequency === 'daily') {
          expect(score).toBe(5);
        } else if (item.habitFrequency === 'weekly') {
          expect(score).toBe(4);
        } else if (item.habitFrequency === 'monthly') {
          expect(score).toBe(3);
        } else {
          expect(score).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('impulse purchase rule contributes exactly +4 when applicable', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = applyImpulsePurchaseRule(item);
        if (item.isImpulsePurchase === true) {
          expect(score).toBe(4);
        } else {
          expect(score).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('waste score is always non-negative', () => {
    fc.assert(
      fc.property(expenseItemArb, (item: ExpenseItem) => {
        const score = calculateWasteScore(item, allScoringRules);
        expect(score).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 200 }
    );
  });
});
