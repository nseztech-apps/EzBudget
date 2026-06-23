import { WizardSectionConfig } from '../../types';

export const section8: WizardSectionConfig = {
  id: 'seguros',
  order: 8,
  title: 'Pequenos Seguros e Garantias',
  description: 'Seguros opcionais, extensões de garantia e proteções adicionais.',
  icon: '🛡️',
  questions: [
    {
      id: 'q8_seguros_lista',
      sectionId: 'seguros',
      text: 'Liste os seus seguros opcionais e extensões de garantia:',
      inputType: 'dynamic-list',
      supportsAnswerState: false,
      helpText: 'Inclua seguros de telemóvel, eletrodomésticos, viagem, etc.',
      dynamicListFields: [
        {
          id: 'tipo',
          sectionId: 'seguros',
          text: 'Tipo de seguro/garantia',
          inputType: 'text',
          supportsAnswerState: false,
        },
        {
          id: 'custo_mensal',
          sectionId: 'seguros',
          text: 'Custo mensal (€)',
          inputType: 'number',
          validation: { min: 0 },
          supportsAnswerState: false,
        },
        {
          id: 'ja_usou',
          sectionId: 'seguros',
          text: 'Já usou este seguro alguma vez?',
          inputType: 'boolean',
          supportsAnswerState: false,
        },
        {
          id: 'renovacao_auto',
          sectionId: 'seguros',
          text: 'Renova automaticamente?',
          inputType: 'boolean',
          supportsAnswerState: false,
        },
      ],
    },
    {
      id: 'q8_seguro_vida',
      sectionId: 'seguros',
      text: 'Tem seguro de vida? Qual o custo mensal?',
      inputType: 'number',
      validation: { min: 0 },
      supportsAnswerState: true,
    },
    {
      id: 'q8_seguro_saude',
      sectionId: 'seguros',
      text: 'Tem seguro de saúde privado? Qual o custo mensal?',
      inputType: 'number',
      validation: { min: 0 },
      supportsAnswerState: true,
    },
    {
      id: 'q8_ultimo_review',
      sectionId: 'seguros',
      text: 'Quando comparou seguros pela última vez?',
      inputType: 'select',
      options: [
        { value: 'under_12_months', label: 'Há menos de 12 meses' },
        { value: 'over_12_months', label: 'Há mais de 12 meses' },
        { value: 'never', label: 'Nunca comparei' },
      ],
      supportsAnswerState: true,
      scoringTags: ['not-reviewed'],
    },
  ],
};
