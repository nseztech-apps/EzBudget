import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, SectionAnswers, FinalReport, QuestionAnswer } from '../types';

// Action types
type AuditAction =
  | { type: 'SET_ANSWER'; payload: { sectionId: string; questionId: string; answer: QuestionAnswer } }
  | { type: 'SET_SECTION_COMPLETE'; payload: { sectionIndex: number } }
  | { type: 'SET_CURRENT_SECTION'; payload: { sectionIndex: number } }
  | { type: 'SET_REPORT'; payload: { report: FinalReport } }
  | { type: 'CLEAR_ALL' };

// Initial state
const initialState: AppState = {
  currentSection: 0,
  completedSections: [],
  answers: {},
  report: null,
  wizardStatus: 'in-progress',
};

// Reducer
function auditReducer(state: AppState, action: AuditAction): AppState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const { sectionId, questionId, answer } = action.payload;
      const sectionAnswers: SectionAnswers = state.answers[sectionId] || {};
      return {
        ...state,
        answers: {
          ...state.answers,
          [sectionId]: {
            ...sectionAnswers,
            [questionId]: answer,
          },
        },
      };
    }
    case 'SET_SECTION_COMPLETE': {
      const { sectionIndex } = action.payload;
      const completedSections = state.completedSections.includes(sectionIndex)
        ? state.completedSections
        : [...state.completedSections, sectionIndex];
      return {
        ...state,
        completedSections,
      };
    }
    case 'SET_CURRENT_SECTION': {
      return {
        ...state,
        currentSection: action.payload.sectionIndex,
      };
    }
    case 'SET_REPORT': {
      return {
        ...state,
        report: action.payload.report,
        wizardStatus: 'completed',
      };
    }
    case 'CLEAR_ALL': {
      return { ...initialState };
    }
    default:
      return state;
  }
}

// Context
interface AuditContextType {
  state: AppState;
  dispatch: React.Dispatch<AuditAction>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Provider
interface AuditProviderProps {
  children: ReactNode;
}

export function AuditProvider({ children }: AuditProviderProps) {
  const [state, dispatch] = useReducer(auditReducer, initialState);

  return (
    <AuditContext.Provider value={{ state, dispatch }}>
      {children}
    </AuditContext.Provider>
  );
}

// Hook to access context
export function useAuditContext(): AuditContextType {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAuditContext must be used within an AuditProvider');
  }
  return context;
}
