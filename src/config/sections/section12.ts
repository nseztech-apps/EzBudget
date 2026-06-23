import { WizardSectionConfig, WizardAnswers } from '../../types';

export const section12: WizardSectionConfig = {
  id: 'filhos',
  order: 12,
  title: 'Filhos, Escola e Hobbies',
  description: 'Despesas com educação, atividades extracurriculares e hobbies dos filhos.',
  icon: '🎓',
  skippable: true,
  skipCondition: (answers: WizardAnswers) => {
    const agregado = answers['agregado'];
    if (!agregado) return true;
    const dependentes = agregado['q1_dependentes'];
    if (!dependentes) return true;
    return dependentes.state === 'known' && (dependentes.value === 0 || dependentes.value === '0');
  },
  questions: [
    {
      id: 'q12_escola_tipo',
      sectionId: 'filhos',
      text: 'Os seus filhos frequentam que tipo de ensino?',
      inputType: 'select',
      options: [
        { value: 'publico', label: 'Ensino público' },
        { value: 'privado', label: 'Ensino privado' },
        { value: 'misto', label: 'Misto (público + privado)' },
      ],
      supportsAnswerState: true,
    },
    {
      id: 'q12_mensalidade_escola',
      sectionId: 'filhos',
      text: 'Qual o custo mensal total com escola/creche?',
      inputType: 'number',
      validation: { min: 0 },
      supportsAnswerState: true,
    },
    {
      id: 'q12_atividades',
      sectionId: 'filhos',
      text: 'Quantas atividades extracurriculares têm os seus filhos?',
      inputType: 'number',
      validation: { min: 0, max: 20 },
      supportsAnswerState: true,
    },
    {
      id: 'q12_atividades_custo',
      sectionId: 'filhos',
      text: 'Qual o custo mensal total com atividades extracurriculares?',
      inputType: 'number',
      validation: { min: 0 },
      supportsAnswerState: true,
    },
    {
      id: 'q12_atividades_uso',
      sectionId: 'filhos',
      text: 'Os seus filhos frequentam todas as atividades regularmente?',
      inputType: 'select',
      options: [
        { value: 'daily', label: 'Sim, todas sem faltar' },
        { value: 'often', label: 'A maioria, com algumas faltas' },
        { value: 'sometimes', label: 'Algumas já não vão com regularidade' },
        { value: 'rarely', label: 'Várias estão praticamente abandonadas' },
      ],
      supportsAnswerState: true,
      scoringTags: ['low-usage'],
    },
    {
      id: 'q12_material_escolar',
      sectionId: 'filhos',
      text: 'Quanto gasta por mês em material escolar e livros?',
      inputType: 'number',
      validation: { min: 0 },
      supportsAnswerState: true,
    },
  ],
};
