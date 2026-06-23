import { useCallback } from 'react';
import { useAuditContext } from './context';
import { QuestionAnswer, SectionAnswers, FinalReport } from '../types';
import { wizardSections } from '../config/wizardSections';

export function useAuditState() {
  const { state, dispatch } = useAuditContext();

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);

  const setReport = useCallback((report: FinalReport) => {
    dispatch({ type: 'SET_REPORT', payload: { report } });
  }, [dispatch]);

  return {
    ...state,
    clearAll,
    setReport,
  };
}

export function useWizardNavigation() {
  const { state, dispatch } = useAuditContext();
  const totalSections = wizardSections.length;

  const goToSection = useCallback((index: number) => {
    if (index >= 0 && index < totalSections) {
      dispatch({ type: 'SET_CURRENT_SECTION', payload: { sectionIndex: index } });
    }
  }, [dispatch, totalSections]);

  const goNext = useCallback(() => {
    // Mark current section as complete
    dispatch({ type: 'SET_SECTION_COMPLETE', payload: { sectionIndex: state.currentSection } });

    // Check if next section should be skipped
    let nextIndex = state.currentSection + 1;
    while (nextIndex < totalSections) {
      const section = wizardSections[nextIndex];
      if (section.skipCondition && section.skipCondition(state.answers)) {
        dispatch({ type: 'SET_SECTION_COMPLETE', payload: { sectionIndex: nextIndex } });
        nextIndex++;
      } else {
        break;
      }
    }

    if (nextIndex < totalSections) {
      dispatch({ type: 'SET_CURRENT_SECTION', payload: { sectionIndex: nextIndex } });
    }
    return nextIndex;
  }, [dispatch, state.currentSection, state.answers, totalSections]);

  const goPrevious = useCallback(() => {
    let prevIndex = state.currentSection - 1;
    while (prevIndex >= 0) {
      const section = wizardSections[prevIndex];
      if (section.skipCondition && section.skipCondition(state.answers)) {
        prevIndex--;
      } else {
        break;
      }
    }
    if (prevIndex >= 0) {
      dispatch({ type: 'SET_CURRENT_SECTION', payload: { sectionIndex: prevIndex } });
    }
  }, [dispatch, state.currentSection, state.answers]);

  const isFirstSection = state.currentSection === 0;
  const isLastSection = (() => {
    let nextIndex = state.currentSection + 1;
    while (nextIndex < totalSections) {
      const section = wizardSections[nextIndex];
      if (section.skipCondition && section.skipCondition(state.answers)) {
        nextIndex++;
      } else {
        return false;
      }
    }
    return true;
  })();

  return {
    currentSection: state.currentSection,
    completedSections: state.completedSections,
    totalSections,
    goToSection,
    goNext,
    goPrevious,
    isFirstSection,
    isLastSection,
  };
}

export function useAnswers(sectionId: string) {
  const { state, dispatch } = useAuditContext();
  const sectionAnswers: SectionAnswers = state.answers[sectionId] || {};

  const setAnswer = useCallback((questionId: string, answer: QuestionAnswer) => {
    dispatch({
      type: 'SET_ANSWER',
      payload: { sectionId, questionId, answer },
    });
  }, [dispatch, sectionId]);

  const getAnswer = useCallback((questionId: string): QuestionAnswer | undefined => {
    return sectionAnswers[questionId];
  }, [sectionAnswers]);

  return {
    answers: sectionAnswers,
    setAnswer,
    getAnswer,
  };
}
