import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditState } from '../data/hooks';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ProgressBar } from '../components/ProgressBar';
import { FinalReport, SavingsOpportunity, ActionItem, ChecklistItem, Tip } from '../types';

export function ReportPage() {
  const navigate = useNavigate();
  const { report } = useAuditState();

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nenhum relatório disponível. Complete a auditoria primeiro.</p>
          <Button onClick={() => navigate('/auditoria')}>Ir para Auditoria</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1
            className="text-xl font-bold text-navy-900 cursor-pointer"
            onClick={() => navigate('/')}
          >
            EzBudget
          </h1>
          <Button variant="secondary" onClick={() => navigate('/auditoria')}>
            Rever respostas
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-navy-900 mb-2">Relatório da Auditoria</h2>
          <p className="text-gray-500 text-sm">
            Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-PT')}
          </p>
        </div>

        {/* Overview Section */}
        <OverviewSection report={report} />

        {/* Top Savings */}
        {report.topSavings.length > 0 && (
          <TopSavingsSection savings={report.topSavings} />
        )}

        {/* Immediate Actions */}
        {report.immediateActions.length > 0 && (
          <ImmediateActionsSection actions={report.immediateActions} />
        )}

        {/* Review Actions */}
        {report.reviewActions.length > 0 && (
          <ReviewActionsSection actions={report.reviewActions} />
        )}

        {/* Checklist */}
        <ChecklistSection items={report.checklist} />

        {/* Tips */}
        {report.tips.length > 0 && (
          <TipsSection tips={report.tips} />
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-8 pb-12">
          <Button variant="secondary" onClick={() => navigate('/auditoria')}>
            Rever respostas
          </Button>
        </div>
      </main>
    </div>
  );
}

function OverviewSection({ report }: { report: FinalReport }) {
  const { overview } = report;

  return (
    <Card>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-navy-900 mb-4">Visão Geral</h3>
        <ProgressBar value={overview.healthScore} className="max-w-md mx-auto" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{overview.leaksIdentified}</div>
          <div className="text-xs text-gray-600 mt-1">Fugas Identificadas</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">{overview.pendingConfirmation}</div>
          <div className="text-xs text-gray-600 mt-1">A Confirmar</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{overview.estimatedMonthlySavings}€</div>
          <div className="text-xs text-gray-600 mt-1">Poupança/Mês</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{overview.estimatedAnnualSavings}€</div>
          <div className="text-xs text-gray-600 mt-1">Poupança/Ano</div>
        </div>
      </div>
    </Card>
  );
}

function TopSavingsSection({ savings }: { savings: SavingsOpportunity[] }) {
  return (
    <Card title="Maiores Oportunidades de Poupança">
      <div className="space-y-4">
        {savings.map(item => (
          <div key={item.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>
                <p className="text-sm text-gray-800 mb-1">{item.problem}</p>
                <p className="text-xs text-navy-700 font-medium">{item.suggestedAction}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-green-600">{item.estimatedMonthlyImpact}€/mês</div>
                <ConfidenceBadge confidence={item.confidence} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ImmediateActionsSection({ actions }: { actions: ActionItem[] }) {
  return (
    <Card title="Ações Imediatas">
      <p className="text-sm text-gray-500 mb-4">Ações que pode tomar agora, sem necessidade de pesquisa adicional.</p>
      <div className="space-y-3">
        {actions.map(action => (
          <div key={action.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <span className="text-red-500 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{action.description}</p>
              <span className="text-xs text-gray-500">{action.category}</span>
            </div>
            {action.estimatedSavings && (
              <span className="text-sm font-medium text-green-600">{action.estimatedSavings}€/mês</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReviewActionsSection({ actions }: { actions: ActionItem[] }) {
  return (
    <Card title="Para Investigar">
      <p className="text-sm text-gray-500 mb-4">Requer alguma pesquisa ou comparação antes de agir.</p>
      <div className="space-y-3">
        {actions.map(action => (
          <div key={action.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <span className="text-amber-500 text-lg">🔍</span>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{action.description}</p>
              <span className="text-xs text-gray-500">{action.category}</span>
            </div>
            {action.estimatedSavings && (
              <span className="text-sm font-medium text-green-600">~{action.estimatedSavings}€/mês</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ChecklistSection({ items }: { items: ChecklistItem[] }) {
  if (items.length === 0) {
    return (
      <Card title="Checklist de Confirmação">
        <div className="text-center py-6">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-gray-600">Parabéns! Não há itens pendentes de confirmação.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Checklist de Confirmação">
      <p className="text-sm text-gray-500 mb-4">Itens que marcou como "Preciso confirmar" — verifique quando puder.</p>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-800 mb-1">{item.subject}</p>
            <p className="text-xs text-gray-600 mb-1">📋 {item.whatToConfirm}</p>
            <p className="text-xs text-gray-500">📍 Onde verificar: {item.whereToCheck}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TipsSection({ tips }: { tips: Tip[] }) {
  return (
    <Card title="Dicas e Recomendações">
      <div className="space-y-3">
        {tips.map(tip => (
          <div key={tip.id} className="flex gap-3 p-3 bg-navy-50 border border-navy-100 rounded-lg">
            <span className="text-navy-600 text-lg flex-shrink-0">💡</span>
            <p className="text-sm text-navy-800">{tip.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
