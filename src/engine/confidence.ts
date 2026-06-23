import { AnswerState, ConfidenceLevel } from '../types';

export function calculateConfidence(answerStates: AnswerState[]): ConfidenceLevel {
  if (answerStates.length === 0) {
    return 'Baixa confiança — dados em falta';
  }

  const hasUnknown = answerStates.some(s => s === 'unknown');
  const hasPending = answerStates.some(s => s === 'pending_confirmation');

  if (hasUnknown || hasPending) {
    return 'Baixa confiança — dados em falta';
  }

  const allKnown = answerStates.every(s => s === 'known');
  if (allKnown) {
    return 'Alta confiança';
  }

  return 'Confiança média';
}
