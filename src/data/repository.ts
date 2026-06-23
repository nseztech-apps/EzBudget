import { SectionAnswers, WizardAnswers, FinalReport } from '../types';

export interface IAuditRepository {
  saveAnswers(sectionId: string, answers: SectionAnswers): void;
  getAnswers(sectionId: string): SectionAnswers | null;
  getAllAnswers(): WizardAnswers;
  saveReport(report: FinalReport): void;
  getReport(): FinalReport | null;
  clearAll(): void;
}

export class LocalStateAdapter implements IAuditRepository {
  private answers: WizardAnswers = {};
  private report: FinalReport | null = null;

  saveAnswers(sectionId: string, answers: SectionAnswers): void {
    this.answers[sectionId] = { ...this.answers[sectionId], ...answers };
  }

  getAnswers(sectionId: string): SectionAnswers | null {
    return this.answers[sectionId] || null;
  }

  getAllAnswers(): WizardAnswers {
    return { ...this.answers };
  }

  saveReport(report: FinalReport): void {
    this.report = report;
  }

  getReport(): FinalReport | null {
    return this.report;
  }

  clearAll(): void {
    this.answers = {};
    this.report = null;
  }
}
