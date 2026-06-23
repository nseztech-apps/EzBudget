import {
  WizardAnswers,
  ScoringConfig,
  ExpenseItem,
  ScoredExpenseItem,
  FinalReport,
  ReportOverview,
  SavingsOpportunity,
  ActionItem,
  ChecklistItem,
  Tip,
  AnswerState,
  QuestionConfig,
} from '../types';
import { scoreExpenseItem } from './scoring';
import { classifyExpense } from './classification';
import { calculateConfidence } from './confidence';
import { wizardSections } from '../config/wizardSections';

export function extractExpenseItems(answers: WizardAnswers): ExpenseItem[] {
  const items: ExpenseItem[] = [];

  // Process subscription lists (section 5)
  const subscricoes = answers['subscricoes'];
  if (subscricoes) {
    const listAnswer = subscricoes['q5_subscricoes_lista'];
    if (listAnswer && listAnswer.state === 'known' && Array.isArray(listAnswer.value)) {
      // Dynamic list items stored as JSON strings
      (listAnswer.value as string[]).forEach((entry, i) => {
        try {
          const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry;
          if (parsed.nome && parsed.custo) {
            items.push({
              id: `sub_${i}`,
              sectionId: 'subscricoes',
              questionId: 'q5_subscricoes_lista',
              category: 'Subscrições Digitais',
              description: parsed.nome,
              monthlyCost: Number(parsed.custo) || 0,
              autoRenewal: parsed.renovacao_auto === true || parsed.renovacao_auto === 'true',
              usageFrequency: parsed.frequencia_uso || undefined,
              wouldBeMissed: parsed.faria_falta === true || parsed.faria_falta === 'true',
              answerState: 'known',
            });
          }
        } catch {
          // Skip malformed entries
        }
      });
    }

    // Duplicates indicator
    const duplicadas = subscricoes['q5_duplicadas'];
    if (duplicadas && duplicadas.state === 'known' && duplicadas.value === true) {
      // Mark existing subscription items as potential duplicates
      items.forEach(item => {
        if (item.sectionId === 'subscricoes') {
          item.duplicateOf = 'possible_overlap';
        }
      });
    }
  }

  // Process direct debits (section 7)
  const debitos = answers['debitos_diretos'];
  if (debitos) {
    const listAnswer = debitos['q7_debitos_lista'];
    if (listAnswer && listAnswer.state === 'known' && Array.isArray(listAnswer.value)) {
      (listAnswer.value as string[]).forEach((entry, i) => {
        try {
          const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry;
          if (parsed.entidade && parsed.valor) {
            items.push({
              id: `dd_${i}`,
              sectionId: 'debitos_diretos',
              questionId: 'q7_debitos_lista',
              category: 'Débitos Diretos',
              description: parsed.entidade,
              monthlyCost: Number(parsed.valor) || 0,
              usageFrequency: parsed.usa_servico || undefined,
              autoRenewal: true,
              answerState: parsed.sabe_para_que ? 'known' : 'unknown',
            });
          }
        } catch {
          // Skip malformed entries
        }
      });
    }

    // Review status
    const revisao = debitos['q7_revisao'];
    if (revisao && revisao.state === 'known') {
      items.forEach(item => {
        if (item.sectionId === 'debitos_diretos') {
          item.lastReviewed = revisao.value as 'never' | 'over_12_months' | 'under_12_months';
        }
      });
    }
  }

  // Process insurance (section 8)
  const seguros = answers['seguros'];
  if (seguros) {
    const listAnswer = seguros['q8_seguros_lista'];
    if (listAnswer && listAnswer.state === 'known' && Array.isArray(listAnswer.value)) {
      (listAnswer.value as string[]).forEach((entry, i) => {
        try {
          const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry;
          if (parsed.tipo && parsed.custo_mensal) {
            items.push({
              id: `ins_${i}`,
              sectionId: 'seguros',
              questionId: 'q8_seguros_lista',
              category: 'Seguros',
              description: parsed.tipo,
              monthlyCost: Number(parsed.custo_mensal) || 0,
              autoRenewal: parsed.renovacao_auto === true || parsed.renovacao_auto === 'true',
              answerState: 'known',
            });
          }
        } catch {
          // Skip malformed entries
        }
      });
    }

    const reviewStatus = seguros['q8_ultimo_review'];
    if (reviewStatus && reviewStatus.state === 'known') {
      items.forEach(item => {
        if (item.sectionId === 'seguros') {
          item.lastReviewed = reviewStatus.value as 'never' | 'over_12_months' | 'under_12_months';
        }
      });
    }
  }

  // Process telecom (section 4) - premium channels
  const telecom = answers['telecomunicacoes'];
  if (telecom) {
    const premium = telecom['q4_canais_premium'];
    if (premium && premium.state === 'known' && premium.value === true) {
      const valorCanais = telecom['q4_canais_valor'];
      const usoCanais = telecom['q4_uso_canais'];
      items.push({
        id: 'telecom_premium',
        sectionId: 'telecomunicacoes',
        questionId: 'q4_canais_premium',
        category: 'Telecomunicações',
        description: 'Canais premium de TV',
        monthlyCost: valorCanais?.value ? Number(valorCanais.value) : 0,
        usageFrequency: usoCanais?.value as ExpenseItem['usageFrequency'] || undefined,
        answerState: premium.state,
      });
    }

    const reviewTelecom = telecom['q4_ultimo_review'];
    if (reviewTelecom && reviewTelecom.state === 'known') {
      const pacoteValor = telecom['q4_valor_pacote'];
      if (pacoteValor?.value && Number(pacoteValor.value) > 0) {
        items.push({
          id: 'telecom_pacote',
          sectionId: 'telecomunicacoes',
          questionId: 'q4_valor_pacote',
          category: 'Telecomunicações',
          description: 'Pacote telecomunicações',
          monthlyCost: Number(pacoteValor.value),
          lastReviewed: reviewTelecom.value as 'never' | 'over_12_months' | 'under_12_months',
          autoRenewal: true,
          answerState: 'known',
        });
      }
    }
  }

  // Process electricity (section 3)
  const eletricidade = answers['eletricidade'];
  if (eletricidade) {
    const valor = eletricidade['q3_valor_mensal'];
    const review = eletricidade['q3_ultimo_review'];
    const renovacao = eletricidade['q3_renovacao_auto'];
    if (valor && valor.state === 'known' && Number(valor.value) > 0) {
      items.push({
        id: 'eletricidade',
        sectionId: 'eletricidade',
        questionId: 'q3_valor_mensal',
        category: 'Eletricidade',
        description: 'Contrato de eletricidade',
        monthlyCost: Number(valor.value),
        lastReviewed: review?.state === 'known' ? review.value as 'never' | 'over_12_months' | 'under_12_months' : undefined,
        autoRenewal: renovacao?.state === 'known' ? renovacao.value === true : undefined,
        answerState: 'known',
      });
    }
  }

  // Process gym/clubs (section 6)
  const ginasios = answers['ginasios'];
  if (ginasios) {
    const temGinasio = ginasios['q6_ginasio'];
    if (temGinasio && temGinasio.state === 'known' && temGinasio.value === true) {
      const valor = ginasios['q6_ginasio_valor'];
      const uso = ginasios['q6_ginasio_uso'];
      const falta = ginasios['q6_ginasio_falta'];
      const renovacao = ginasios['q6_renovacao_auto'];
      items.push({
        id: 'ginasio',
        sectionId: 'ginasios',
        questionId: 'q6_ginasio',
        category: 'Ginásios e Clubes',
        description: 'Mensalidade de ginásio',
        monthlyCost: valor?.value ? Number(valor.value) : 0,
        usageFrequency: uso?.value as ExpenseItem['usageFrequency'] || undefined,
        wouldBeMissed: falta?.value === true,
        autoRenewal: renovacao?.value === true,
        answerState: temGinasio.state,
      });
    }
  }

  // Process habits (section 10)
  const habitos = answers['habitos'];
  if (habitos) {
    const tabaco = habitos['q10_tabaco'];
    if (tabaco && tabaco.state === 'known' && tabaco.value === true) {
      const gasto = habitos['q10_tabaco_gasto'];
      const freq = habitos['q10_tabaco_freq'];
      items.push({
        id: 'habito_tabaco',
        sectionId: 'habitos',
        questionId: 'q10_tabaco',
        category: 'Hábitos',
        description: 'Tabaco',
        monthlyCost: gasto?.value ? Number(gasto.value) : 0,
        habitFrequency: freq?.value as 'daily' | 'weekly' | 'monthly' || undefined,
        answerState: tabaco.state,
      });
    }

    const alcoolGasto = habitos['q10_alcool'];
    if (alcoolGasto && alcoolGasto.state === 'known' && Number(alcoolGasto.value) > 0) {
      const freq = habitos['q10_alcool_freq'];
      items.push({
        id: 'habito_alcool',
        sectionId: 'habitos',
        questionId: 'q10_alcool',
        category: 'Hábitos',
        description: 'Bebidas alcoólicas',
        monthlyCost: Number(alcoolGasto.value),
        habitFrequency: freq?.value as 'daily' | 'weekly' | 'monthly' || undefined,
        answerState: alcoolGasto.state,
      });
    }

    const jogos = habitos['q10_jogos'];
    if (jogos && jogos.state === 'known' && jogos.value === true) {
      const gasto = habitos['q10_jogos_gasto'];
      const freq = habitos['q10_jogos_freq'];
      items.push({
        id: 'habito_jogos',
        sectionId: 'habitos',
        questionId: 'q10_jogos',
        category: 'Hábitos',
        description: 'Jogos e apostas',
        monthlyCost: gasto?.value ? Number(gasto.value) : 0,
        habitFrequency: freq?.value as 'daily' | 'weekly' | 'monthly' || undefined,
        answerState: jogos.state,
      });
    }
  }

  // Process impulse purchases (section 11)
  const impulso = answers['compras_impulso'];
  if (impulso) {
    const gasto = impulso['q11_gasto_mensal'];
    if (gasto && gasto.state === 'known' && Number(gasto.value) > 0) {
      items.push({
        id: 'impulso_geral',
        sectionId: 'compras_impulso',
        questionId: 'q11_gasto_mensal',
        category: 'Compras por Impulso',
        description: 'Compras impulsivas mensais',
        monthlyCost: Number(gasto.value),
        isImpulsePurchase: true,
        answerState: gasto.state,
      });
    }
  }

  return items;
}

export function generateOverview(scoredItems: ScoredExpenseItem[]): ReportOverview {
  const leaks = scoredItems.filter(i => i.classification === 'Critical Leak' || i.classification === 'Strong Cut Candidate');
  const totalMonthlySavings = leaks.reduce((sum, item) => sum + item.monthlyCost, 0);
  const pendingCount = scoredItems.filter(i => i.confidence === 'Baixa confiança — dados em falta').length;

  // Health score: 100 if no issues, decreases with more/worse leaks
  const maxPossibleScore = scoredItems.length > 0 ? scoredItems.length * 10 : 1;
  const totalWaste = scoredItems.reduce((sum, item) => sum + item.wasteScore, 0);
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (totalWaste / maxPossibleScore) * 100)));

  return {
    healthScore,
    leaksIdentified: leaks.length,
    pendingConfirmation: pendingCount,
    estimatedMonthlySavings: totalMonthlySavings,
    estimatedAnnualSavings: totalMonthlySavings * 12,
  };
}

export function generateTopSavings(scoredItems: ScoredExpenseItem[]): SavingsOpportunity[] {
  const opportunities = scoredItems
    .filter(item => item.classification !== 'OK')
    .map(item => ({
      id: `saving_${item.id}`,
      category: item.category,
      problem: `${item.description} — pontuação de desperdício: ${item.wasteScore}`,
      estimatedMonthlyImpact: item.monthlyCost,
      suggestedAction: getSuggestedAction(item),
      priority: getPriority(item),
      confidence: item.confidence,
    }));

  // Sort by priority (high > medium > low) then by estimated monthly impact (descending)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return opportunities.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.estimatedMonthlyImpact - a.estimatedMonthlyImpact;
  });
}

function getPriority(item: ScoredExpenseItem): 'high' | 'medium' | 'low' {
  if (item.classification === 'Critical Leak') return 'high';
  if (item.classification === 'Strong Cut Candidate') return 'medium';
  return 'low';
}

function getSuggestedAction(item: ScoredExpenseItem): string {
  if (item.classification === 'Critical Leak') {
    return `Cancele ou renegocie imediatamente: ${item.description}`;
  }
  if (item.classification === 'Strong Cut Candidate') {
    return `Considere cancelar ou reduzir: ${item.description}`;
  }
  return `Reveja se ainda necessita de: ${item.description}`;
}

export function generateImmediateActions(scoredItems: ScoredExpenseItem[]): ActionItem[] {
  return scoredItems
    .filter(item => item.classification === 'Critical Leak' || item.classification === 'Strong Cut Candidate')
    .map(item => ({
      id: `action_${item.id}`,
      type: item.classification === 'Critical Leak' ? 'cancelar' : 'renegociar',
      description: getSuggestedAction(item),
      category: item.category,
      estimatedSavings: item.monthlyCost,
    }));
}

export function generateReviewActions(scoredItems: ScoredExpenseItem[]): ActionItem[] {
  return scoredItems
    .filter(item => item.classification === 'Review')
    .map(item => ({
      id: `review_${item.id}`,
      type: 'investigar',
      description: `Pesquise alternativas para: ${item.description}`,
      category: item.category,
      estimatedSavings: Math.round(item.monthlyCost * 0.3),
    }));
}

export function generateChecklist(answers: WizardAnswers): ChecklistItem[] {
  const checklistItems: ChecklistItem[] = [];

  for (const sectionId of Object.keys(answers)) {
    const sectionAnswers = answers[sectionId];
    const section = wizardSections.find(s => s.id === sectionId);

    for (const questionId of Object.keys(sectionAnswers)) {
      const answer = sectionAnswers[questionId];
      if (answer.state === 'pending_confirmation') {
        const question = section?.questions.find(q => q.id === questionId);
        checklistItems.push({
          id: `check_${questionId}`,
          subject: question?.text || questionId,
          whatToConfirm: `Confirmar o valor/resposta para: ${question?.text || questionId}`,
          whereToCheck: getWhereToCheck(sectionId),
          suggestedAction: 'Recolha a informação e volte a preencher esta secção.',
          originalQuestionId: questionId,
        });
      }
    }
  }

  return checklistItems;
}

function getWhereToCheck(sectionId: string): string {
  const sectionChecks: Record<string, string> = {
    agregado: 'Documentos pessoais e recibos de vencimento',
    habitacao: 'Contrato de arrendamento ou crédito habitação',
    eletricidade: 'Fatura de eletricidade ou área de cliente',
    telecomunicacoes: 'Fatura ou área de cliente do operador',
    subscricoes: 'Extratos bancários e emails de confirmação',
    ginasios: 'Contrato do ginásio ou área de sócio',
    debitos_diretos: 'Extrato bancário - secção de débitos diretos',
    seguros: 'Apólices de seguro ou correspondência da seguradora',
    refeicoes_fora: 'Extratos bancários e apps de pagamento',
    habitos: 'Extratos bancários',
    compras_impulso: 'Extratos bancários e histórico de compras',
    filhos: 'Recibos da escola e atividades',
  };
  return sectionChecks[sectionId] || 'Verifique os seus documentos';
}

export function generateTips(scoredItems: ScoredExpenseItem[]): Tip[] {
  const tips: Tip[] = [];
  const categories = new Set(scoredItems.map(i => i.category));

  tips.push({
    id: 'tip_geral_1',
    text: 'Reveja todos os seus contratos anualmente. Muitos serviços aumentam o preço sem avisar claramente.',
    relevantCategories: ['Telecomunicações', 'Eletricidade', 'Seguros'],
  });

  tips.push({
    id: 'tip_geral_2',
    text: 'Configure alertas no homebanking para débitos diretos acima de determinado valor.',
    relevantCategories: ['Débitos Diretos'],
  });

  if (categories.has('Subscrições Digitais')) {
    tips.push({
      id: 'tip_subscricoes',
      text: 'Considere partilhar subscrições familiares (Spotify, Netflix, etc.) para reduzir o custo por pessoa.',
      relevantCategories: ['Subscrições Digitais'],
    });
  }

  if (categories.has('Telecomunicações')) {
    tips.push({
      id: 'tip_telecom',
      text: 'Ligue para o seu operador a pedir a melhor oferta atual — geralmente consegue redução sem mudar de operador.',
      relevantCategories: ['Telecomunicações'],
    });
  }

  if (categories.has('Eletricidade')) {
    tips.push({
      id: 'tip_eletricidade',
      text: 'Use o simulador da ERSE (erse.pt) para comparar tarifas e verificar se a sua potência contratada é adequada.',
      relevantCategories: ['Eletricidade'],
    });
  }

  if (categories.has('Ginásios e Clubes')) {
    tips.push({
      id: 'tip_ginasio',
      text: 'Se vai ao ginásio menos de 2x por semana, considere pagar por sessão ou usar alternativas gratuitas ao ar livre.',
      relevantCategories: ['Ginásios e Clubes'],
    });
  }

  if (categories.has('Hábitos')) {
    tips.push({
      id: 'tip_habitos',
      text: 'Pequenos gastos diários acumulam rapidamente: 5€/dia = 150€/mês = 1.800€/ano.',
      relevantCategories: ['Hábitos'],
    });
  }

  if (categories.has('Compras por Impulso')) {
    tips.push({
      id: 'tip_impulso',
      text: 'Aplique a regra das 48 horas: espere 2 dias antes de compras não essenciais acima de 50€.',
      relevantCategories: ['Compras por Impulso'],
    });
  }

  tips.push({
    id: 'tip_geral_3',
    text: 'Crie uma transferência automática para poupança no dia em que recebe o ordenado — pague-se primeiro.',
    relevantCategories: [],
  });

  return tips;
}

export function analyzeAudit(answers: WizardAnswers, config: ScoringConfig): FinalReport {
  // 1. Extract expense items from answers
  const expenseItems = extractExpenseItems(answers);

  // 2. Score each item
  const scoredItems: ScoredExpenseItem[] = expenseItems
    .filter(item => item.answerState !== 'unknown')
    .map(item => {
      const { score, appliedRules } = scoreExpenseItem(item, config.rules);
      const classification = classifyExpense(score);

      // Gather answer states for confidence calculation
      const sectionAnswers = answers[item.sectionId] || {};
      const answerStates: AnswerState[] = Object.values(sectionAnswers).map(a => a.state);
      const confidence = calculateConfidence(answerStates);

      return {
        ...item,
        wasteScore: score,
        classification,
        appliedRules,
        confidence,
      };
    });

  // 3. Generate report sections
  const overview = generateOverview(scoredItems);
  const topSavings = generateTopSavings(scoredItems);
  const immediateActions = generateImmediateActions(scoredItems);
  const reviewActions = generateReviewActions(scoredItems);
  const checklist = generateChecklist(answers);
  const tips = generateTips(scoredItems);

  return {
    overview,
    topSavings,
    immediateActions,
    reviewActions,
    checklist,
    tips,
    generatedAt: new Date().toISOString(),
  };
}
