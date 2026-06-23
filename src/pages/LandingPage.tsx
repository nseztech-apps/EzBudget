import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-navy-900">EzBudget</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <div className="mb-8">
          <span className="inline-block px-4 py-1.5 bg-navy-100 text-navy-700 rounded-full text-sm font-medium mb-6">
            Auditoria Financeira Doméstica
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-6 leading-tight">
            Descubra para onde vai o seu dinheiro
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Uma auditoria completa às suas despesas domésticas em 12 passos simples.
            Identifique desperdícios, subscrições esquecidas e oportunidades de poupança.
          </p>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Receba um relatório personalizado com ações concretas para reduzir gastos
            e melhorar a saúde financeira do seu agregado.
          </p>
        </div>

        <div className="mb-12">
          <Button
            onClick={() => navigate('/auditoria')}
            className="text-lg px-8 py-4"
          >
            Iniciar Auditoria
          </Button>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="font-semibold text-navy-900 mb-2">12 Áreas de Análise</h3>
            <p className="text-sm text-gray-600">
              Da eletricidade aos seguros, das subscrições aos hábitos — cobrimos tudo.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-navy-900 mb-2">Relatório Detalhado</h3>
            <p className="text-sm text-gray-600">
              Classificação automática de cada despesa com nível de confiança.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-3">💰</div>
            <h3 className="font-semibold text-navy-900 mb-2">Ações Concretas</h3>
            <p className="text-sm text-gray-600">
              Lista priorizada do que cancelar, renegociar ou investigar.
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Sem registo necessário · 100% privado · Dados apenas no seu browser</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span>✓ Gratuito</span>
            <span>✓ ~15 minutos</span>
            <span>✓ Resultados imediatos</span>
          </div>
        </div>
      </main>
    </div>
  );
}
