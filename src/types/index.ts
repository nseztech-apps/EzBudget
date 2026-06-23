// Answer States
export type AnswerState = 'known' | 'unknown' | 'pending_confirmation';

// Question Configuration
export interface SelectOption {
  value: string;
  label: string;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface QuestionConfig {
  id: string;
  sectionId: string;
  text: string;
  inputType: 'text' | 'number' | 'select' | 'multi-select' | 'boolean' | 'scale' | 'dynamic-list';
  options?: SelectOption[];
  validation?: ValidationRule;
  supportsAnswerState: boolean;
  scoringTags?: string[];
  helpText?: string;
  dynamicListFields?: QuestionConfig[];
}

// Answer Models
export interface QuestionAnswer {
  questionId: string;
  state: AnswerState;
  value?: string | number | boolean | string[];
}

export type SectionAnswers = Record<string, QuestionAnswer>;
export type WizardAnswers = Record<string, SectionAnswers>;

// Expense and Scoring Models
export interface ExpenseItem {
  id: string;
  sectionId: string;
  questionId: string;
  category: string;
  description: string;
  monthlyCost: number;
  autoRenewal?: boolean;
  usageFrequency?: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  wouldBeMissed?: boolean;
  duplicateOf?: string;
  lastReviewed?: 'never' | 'over_12_months' | 'under_12_months';
  answerState: AnswerState;
  isImpulsePurchase?: boolean;
  habitFrequency?: 'daily' | 'weekly' | 'monthly';
}

export interface ScoredExpenseItem extends ExpenseItem {
  wasteScore: number;
  classification: Classification;
  appliedRules: string[];
  confidence: ConfidenceLevel;
}

export type Classification = 'OK' | 'Review' | 'Strong Cut Candidate' | 'Critical Leak';
export type ConfidenceLevel = 'Alta confiança' | 'Confiança média' | 'Baixa confiança — dados em falta';

// Report Models
export interface FinalReport {
  overview: ReportOverview;
  topSavings: SavingsOpportunity[];
  immediateActions: ActionItem[];
  reviewActions: ActionItem[];
  checklist: ChecklistItem[];
  tips: Tip[];
  generatedAt: string;
}

export interface ReportOverview {
  healthScore: number;
  leaksIdentified: number;
  pendingConfirmation: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
}

export interface SavingsOpportunity {
  id: string;
  category: string;
  problem: string;
  estimatedMonthlyImpact: number;
  suggestedAction: string;
  priority: 'high' | 'medium' | 'low';
  confidence: ConfidenceLevel;
}

export interface ActionItem {
  id: string;
  type: string;
  description: string;
  category: string;
  estimatedSavings?: number;
}

export interface ChecklistItem {
  id: string;
  subject: string;
  whatToConfirm: string;
  whereToCheck: string;
  suggestedAction: string;
  originalQuestionId: string;
}

export interface Tip {
  id: string;
  text: string;
  relevantCategories: string[];
}

// Scoring Configuration
export interface ScoringRule {
  id: string;
  name: string;
  condition: (item: ExpenseItem) => boolean;
  points: number | ((item: ExpenseItem) => number);
  description: string;
}

export interface ScoringConfig {
  rules: ScoringRule[];
  thresholds: ClassificationThresholds;
}

export interface ClassificationThresholds {
  ok: { min: number; max: number };
  review: { min: number; max: number };
  strongCut: { min: number; max: number };
  criticalLeak: { min: number; max: number };
}

// Wizard Section Configuration
export interface WizardSectionConfig {
  id: string;
  order: number;
  title: string;
  description: string;
  icon?: string;
  questions: QuestionConfig[];
  skippable?: boolean;
  skipCondition?: (answers: WizardAnswers) => boolean;
}

// App State
export interface AppState {
  currentSection: number;
  completedSections: number[];
  answers: WizardAnswers;
  report: FinalReport | null;
  wizardStatus: 'in-progress' | 'completed';
}
