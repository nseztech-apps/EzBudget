import { Classification } from '../types';
import { classificationThresholds } from '../config/thresholds';

export function classifyExpense(wasteScore: number): Classification {
  if (wasteScore >= classificationThresholds.criticalLeak.min) {
    return 'Critical Leak';
  }
  if (wasteScore >= classificationThresholds.strongCut.min && wasteScore <= classificationThresholds.strongCut.max) {
    return 'Strong Cut Candidate';
  }
  if (wasteScore >= classificationThresholds.review.min && wasteScore <= classificationThresholds.review.max) {
    return 'Review';
  }
  return 'OK';
}
