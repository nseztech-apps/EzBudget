import { ScoringRule, ExpenseItem, ScoringConfig } from '../types';
import { classificationThresholds } from './thresholds';

export const autoRenewalRule: ScoringRule = {
  id: 'auto-renewal',
  name: 'Renovação Automática',
  condition: (item: ExpenseItem) => item.autoRenewal === true,
  points: 2,
  description: 'Serviço com renovação automática ativa',
};

export const lowUsageRule: ScoringRule = {
  id: 'low-usage',
  name: 'Uso Baixo ou Nulo',
  condition: (item: ExpenseItem) =>
    item.usageFrequency === 'never' || item.usageFrequency === 'rarely',
  points: 4,
  description: 'Serviço com uso muito baixo ou inexistente',
};

export const wouldntMissRule: ScoringRule = {
  id: 'wouldnt-miss',
  name: 'Não Faria Falta',
  condition: (item: ExpenseItem) => item.wouldBeMissed === false,
  points: 5,
  description: 'O utilizador indica que não sentiria falta',
};

export const duplicateRule: ScoringRule = {
  id: 'duplicate',
  name: 'Serviço Duplicado',
  condition: (item: ExpenseItem) =>
    item.duplicateOf !== undefined && item.duplicateOf !== '',
  points: 3,
  description: 'Serviço que duplica funcionalidade de outro',
};

export const notReviewedRule: ScoringRule = {
  id: 'not-reviewed',
  name: 'Não Revisto Recentemente',
  condition: (item: ExpenseItem) =>
    item.lastReviewed === 'never' || item.lastReviewed === 'over_12_months',
  points: 3,
  description: 'Contrato/serviço não revisto há mais de 12 meses',
};

export const habitFrequencyRule: ScoringRule = {
  id: 'habit-frequency',
  name: 'Frequência de Hábito',
  condition: (item: ExpenseItem) => item.habitFrequency !== undefined,
  points: (item: ExpenseItem) => {
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
  },
  description: 'Hábito com frequência elevada gera mais desperdício',
};

export const impulsePurchaseRule: ScoringRule = {
  id: 'impulse-purchase',
  name: 'Compra por Impulso',
  condition: (item: ExpenseItem) => item.isImpulsePurchase === true,
  points: 4,
  description: 'Compra identificada como impulsiva',
};

export const allScoringRules: ScoringRule[] = [
  autoRenewalRule,
  lowUsageRule,
  wouldntMissRule,
  duplicateRule,
  notReviewedRule,
  habitFrequencyRule,
  impulsePurchaseRule,
];

export const scoringConfig: ScoringConfig = {
  rules: allScoringRules,
  thresholds: classificationThresholds,
};
