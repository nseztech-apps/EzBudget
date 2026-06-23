import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../components/Stepper';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { Button } from '../components/Button';
import { useWizardNavigation, useAnswers, useAuditState } from '../data/hooks';
import { wizardSections } from '../config/wizardSections';
import { analyzeAudit } from '../engine/reportGenerator';
import { scoringConfig } from '../config/scoringRules';
import { QuestionAnswer } from '../types';

export function WizardPage() {
  const navigate = useNavigate();
  const { currentSection, completedSections, totalSections, goToSection, goNext, goPrevious, isFirstSection, isLastSection } = useWizardNavigation();
  const { setReport, answers: allAnswers } = useAuditState();

  const currentSectionConfig = wizardSections[currentSection];
  const { answers, setAnswer } = useAnswers(currentSectionConfig.id);

  const handleNext = () => {
    if (isLastSection) {
      // Generate report
      const report = analyzeAudit(allAnswers, scoringConfig);
      setReport(report);
      navigate('/relatorio');
    } else {
      goNext();
    }
  };

  const handleAnswerChange = (answer: QuestionAnswer) => {
    setAnswer(answer.questionId, answer);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1
            className="text-xl font-bold text-navy-900 cursor-pointer"
            onClick={() => navigate('/')}
          >
            EzBudget
          </h1>
          <span className="text-sm text-gray-500">
            Secção {currentSection + 1} de {totalSections}
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Mobile stepper */}
        <Stepper
          currentSection={currentSection}
          completedSections={completedSections}
          onSectionClick={goToSection}
        />

        <div className="flex gap-8">
          {/* Desktop stepper is rendered inside Stepper component as hidden on mobile */}

          {/* Main content */}
          <div className="flex-1 max-w-2xl">
            {/* Section header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{currentSectionConfig.icon}</span>
                <h2 className="text-2xl font-bold text-navy-900">{currentSectionConfig.title}</h2>
              </div>
              <p className="text-gray-600">{currentSectionConfig.description}</p>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              {currentSectionConfig.questions.map(question => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  answer={answers[question.id]}
                  onAnswerChange={handleAnswerChange}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="secondary"
                onClick={goPrevious}
                disabled={isFirstSection}
              >
                ← Anterior
              </Button>
              <Button onClick={handleNext}>
                {isLastSection ? 'Gerar Relatório' : 'Seguinte →'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
