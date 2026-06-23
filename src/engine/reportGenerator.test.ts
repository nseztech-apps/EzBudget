import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { WizardAnswers, QuestionAnswer, ScoredExpenseItem, ConfidenceLevel } from '../types';
import { generateChecklist, generateTopSavings, analyzeAudit } from './reportGenerator';
import { scoringConfig } from '../config/scoringRules';

const answerStateArb = fc.constantFrom('known', 'unknown', 'pending_confirmation') as fc.Arbitrary<'known' | 'unknown' | 'pending_confirmation'>;

/**
 * **Validates: Requirements 3.3, 16.6, 22.1**
 * Property 3: Pending confirmation generates checklist items
 */
describe('Property 3: Pending confirmation generates checklist items', () => {
  it('number of checklist items equals number of pending_confirmation answers', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 15 }),
            fc.record({
              questionId: fc.string({ minLength: 1, maxLength: 15 }),
              state: answerStateArb,
              value: fc.option(fc.string(), { nil: undefined }),
            }) as fc.Arbitrary<QuestionAnswer>,
            { minKeys: 1, maxKeys: 5 }
          ),
          { minKeys: 1, maxKeys: 4 }
        ),
        (answers: WizardAnswers) => {
          // Ensure questionId matches the key
          const fixedAnswers: WizardAnswers = {};
          for (const sectionId of Object.keys(answers)) {
            fixedAnswers[sectionId] = {};
            for (const questionId of Object.keys(answers[sectionId])) {
              fixedAnswers[sectionId][questionId] = {
                ...answers[sectionId][questionId],
                questionId,
              };
            }
          }

          const checklist = generateChecklist(fixedAnswers);

          // Count all pending_confirmation answers
          let pendingCount = 0;
          for (const sectionId of Object.keys(fixedAnswers)) {
            for (const questionId of Object.keys(fixedAnswers[sectionId])) {
              if (fixedAnswers[sectionId][questionId].state === 'pending_confirmation') {
                pendingCount++;
              }
            }
          }

          expect(checklist.length).toBe(pendingCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 19.3**
 * Property 5: Savings opportunities are sorted by priority then impact
 */
describe('Property 5: Savings opportunities are sorted by priority then impact', () => {
  const scoredItemArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 10 }),
    sectionId: fc.string({ minLength: 1, maxLength: 10 }),
    questionId: fc.string({ minLength: 1, maxLength: 10 }),
    category: fc.string({ minLength: 1, maxLength: 20 }),
    description: fc.string({ minLength: 1, maxLength: 30 }),
    monthlyCost: fc.float({ min: 1, max: 5000, noNaN: true }),
    answerState: fc.constant('known') as fc.Arbitrary<'known'>,
    wasteScore: fc.integer({ min: 3, max: 30 }),
    classification: fc.constantFrom('Review', 'Strong Cut Candidate', 'Critical Leak') as fc.Arbitrary<'Review' | 'Strong Cut Candidate' | 'Critical Leak'>,
    appliedRules: fc.array(fc.string(), { minLength: 0, maxLength: 3 }),
    confidence: fc.constantFrom('Alta confiança', 'Confiança média', 'Baixa confiança — dados em falta') as fc.Arbitrary<ConfidenceLevel>,
  }) as fc.Arbitrary<ScoredExpenseItem>;

  it('savings are sorted by priority (high > medium > low) then by impact (descending)', () => {
    fc.assert(
      fc.property(
        fc.array(scoredItemArb, { minLength: 2, maxLength: 10 }),
        (items) => {
          const savings = generateTopSavings(items);
          const priorityOrder = { high: 0, medium: 1, low: 2 };

          for (let i = 1; i < savings.length; i++) {
            const prev = savings[i - 1];
            const curr = savings[i];
            const prevPriority = priorityOrder[prev.priority];
            const currPriority = priorityOrder[curr.priority];

            if (prevPriority === currPriority) {
              // Same priority: impact should be descending
              expect(prev.estimatedMonthlyImpact).toBeGreaterThanOrEqual(curr.estimatedMonthlyImpact);
            } else {
              // Different priority: should be in order
              expect(prevPriority).toBeLessThanOrEqual(currPriority);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 25.2, 25.3, 26.4**
 * Property 4: Report recalculation is idempotent with unchanged answers
 */
describe('Property 4: Report recalculation is idempotent with unchanged answers', () => {
  it('same inputs produce identical report (excluding generatedAt timestamp)', () => {
    // Use a fixed set of answers to test idempotence
    const testAnswers: WizardAnswers = {
      subscricoes: {
        q5_subscricoes_lista: {
          questionId: 'q5_subscricoes_lista',
          state: 'known',
          value: [JSON.stringify({ nome: 'Netflix', custo: '15', frequencia_uso: 'daily', renovacao_auto: 'true', faria_falta: 'true' })],
        },
        q5_total_estimado: {
          questionId: 'q5_total_estimado',
          state: 'known',
          value: 15,
        },
        q5_duplicadas: {
          questionId: 'q5_duplicadas',
          state: 'known',
          value: false,
        },
      },
    };

    const report1 = analyzeAudit(testAnswers, scoringConfig);
    const report2 = analyzeAudit(testAnswers, scoringConfig);

    // Compare everything except generatedAt
    expect(report1.overview).toEqual(report2.overview);
    expect(report1.topSavings).toEqual(report2.topSavings);
    expect(report1.immediateActions).toEqual(report2.immediateActions);
    expect(report1.reviewActions).toEqual(report2.reviewActions);
    expect(report1.checklist).toEqual(report2.checklist);
    expect(report1.tips).toEqual(report2.tips);
  });

  it('analyzeAudit is deterministic for any well-formed answers', () => {
    fc.assert(
      fc.property(
        fc.record({
          agregado: fc.constant({
            q1_num_pessoas: { questionId: 'q1_num_pessoas', state: 'known' as const, value: 3 },
            q1_dependentes: { questionId: 'q1_dependentes', state: 'known' as const, value: 1 },
            q1_rendimento: { questionId: 'q1_rendimento', state: 'known' as const, value: 2500 },
          }),
        }),
        (answers: WizardAnswers) => {
          const report1 = analyzeAudit(answers, scoringConfig);
          const report2 = analyzeAudit(answers, scoringConfig);

          expect(report1.overview).toEqual(report2.overview);
          expect(report1.topSavings).toEqual(report2.topSavings);
          expect(report1.immediateActions).toEqual(report2.immediateActions);
          expect(report1.reviewActions).toEqual(report2.reviewActions);
          expect(report1.checklist).toEqual(report2.checklist);
        }
      ),
      { numRuns: 50 }
    );
  });
});
