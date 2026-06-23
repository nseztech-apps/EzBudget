import { ClassificationThresholds } from '../types';

export const classificationThresholds: ClassificationThresholds = {
  ok: { min: 0, max: 2 },
  review: { min: 3, max: 5 },
  strongCut: { min: 6, max: 8 },
  criticalLeak: { min: 9, max: Infinity },
};
