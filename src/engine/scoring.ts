import { ExpenseItem, ScoringRule, ScoredExpenseItem } from '../types';
import { allScoringRules } from '../config/scoringRules';

export function applyAutoRenewalRule(item: ExpenseItem): number {
  return item.autoRenewal === true ? 2 : 0;
}

export function applyLowUsageRule(item: ExpenseItem): number {
  return item.usageFrequency === 'never' || item.usageFrequency === 'rarely' ? 4 : 0;
}

export function applyWouldntMissRule(item: ExpenseItem): number {
  return item.wouldBeMissed === false ? 5 : 0;
}

export function applyDuplicateRule(item: ExpenseItem): number {
  return item.duplicateOf !== undefined && item.duplicateOf !== '' ? 3 : 0;
}

export function applyNotReviewedRule(item: ExpenseItem): number {
  return item.lastReviewed === 'never' || item.lastReviewed === 'over_12_months' ? 3 : 0;
}

export function applyHabitFrequencyRule(item: ExpenseItem): number {
  if (!item.habitFrequency) return 0;
  switch (item.habitFrequency) {
    case 'daily':
      return 5;
    case 'weekly':
      return 4;
    case 'monthly':
      return 3;
    default:
      return 0;
  }
}

export function applyImpulsePurchaseRule(item: ExpenseItem): number {
  return item.isImpulsePurchase === true ? 4 : 0;
}

export function calculateWasteScore(item: ExpenseItem, rules?: ScoringRule[]): number {
  const rulesToApply = rules || allScoringRules;
  let totalScore = 0;

  for (const rule of rulesToApply) {
    if (rule.condition(item)) {
      const points = typeof rule.points === 'function' ? rule.points(item) : rule.points;
      totalScore += points;
    }
  }

  return totalScore;
}

export function scoreExpenseItem(item: ExpenseItem, rules?: ScoringRule[]): { score: number; appliedRules: string[] } {
  const rulesToApply = rules || allScoringRules;
  let totalScore = 0;
  const appliedRules: string[] = [];

  for (const rule of rulesToApply) {
    if (rule.condition(item)) {
      const points = typeof rule.points === 'function' ? rule.points(item) : rule.points;
      totalScore += points;
      appliedRules.push(rule.id);
    }
  }

  return { score: totalScore, appliedRules };
}
