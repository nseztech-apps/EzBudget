import { WizardSectionConfig } from '../../types';

export const section7: WizardSectionConfig = {
  id: 'debitos_diretos',
  order: 7,
  title: 'Débitos Diretos Esquecidos',
  description: 'Pagamentos automáticos que podem estar esquecidos ou desatualizados.',
  icon: '🏦',
  questions: [
    {
      id: 'q7_debitos_lista',
      sectionId: 'debitos_diretos',
      text: 'Liste os débitos diretos ativos na sua conta bancária:',
      inputType: 'dynamic-list',
      supportsAnswerState: false,
      helpText: 'Verifique o extrato bancário para identificar débitos diretos recorrentes.',
      dynamicListFields: [
        {
          id: 'entidade',
          sectionId: 'debitos_diretos',
          text: 'Entidade/Empresa',
          inputType: 'text',
          supportsAnswerState: false,
        },
        {
          id: 'valor',
          sectionId: 'debitos_diretos',
          text: 'Valor mensal (€)',
          inputType: 'number',
          validation: { min: 0 },
          supportsAnswerState: false,
        },
        {
          id: 'sabe_para_que',
          sectionId: 'debitos_diretos',
          text: 'Sabe para que serve?',
          inputType: 'boolean',
          supportsAnswerState: false,
        },
        {
          id: 'usa_servico',
          sectionId: 'debitos_diretos',
          text: 'Ainda usa este serviço?',
          inputType: 'select',
          options: [
            { value: 'daily', label: 'Sim, uso regularmente' },
            { value: 'sometimes', label: 'Uso às vezes' },
            { value: 'rarely', label: 'Quase nunca' },
            { value: 'never', label: 'Não uso / não sei' },
          ],
          supportsAnswerState: false,
        },
      ],
    },
    {
      id: 'q7_total_debitos',
      sectionId: 'debitos_diretos',
      text: 'Qual o total mensal estimado em débitos diretos?',
      inputType: 'number',
      validation: { min: 0 },
      supportsAnswerState: true,
    },
    {
      id: 'q7_revisao',
      sectionId: 'debitos_diretos',
      text: 'Quando foi a última vez que reviu todos os débitos diretos?',
      inputType: 'select',
      options: [
        { value: 'under_12_months', label: 'Há menos de 12 meses' },
        { value: 'over_12_months', label: 'Há mais de 12 meses' },
        { value: 'never', label: 'Nunca revi' },
      ],
      supportsAnswerState: true,
      scoringTags: ['not-reviewed'],
    },
  ],
};
