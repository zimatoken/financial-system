import type { AuditCheck } from '../types';

export const defaultAuditQuestions: AuditCheck[] = [
  { id: 'a1', question: 'Есть финансовая подушка на 6 месяцев', category: 'protection', completed: false },
  { id: 'a2', question: 'Все дорогие долги (>10%) погашены', category: 'debt', completed: false },
  { id: 'a3', question: 'Норма сбережений >20%', category: 'savings', completed: false },
  { id: 'a4', question: 'Есть инвестиционный портфель', category: 'invest', completed: false },
  { id: 'a5', question: 'Диверсификация по 3+ классам активов', category: 'invest', completed: false },
  { id: 'a6', question: 'Страхование жизни оформлено', category: 'insurance', completed: false },
  { id: 'a7', question: 'Страхование здоровья оформлено', category: 'insurance', completed: false },
  { id: 'a8', question: 'Налоги оптимизированы', category: 'tax', completed: false },
  { id: 'a9', question: 'Есть пассивный доход', category: 'income', completed: false },
  { id: 'a10', question: 'Ведётся учёт расходов', category: 'budget', completed: false },
  { id: 'a11', question: 'Есть финансовые цели на 1 год', category: 'goals', completed: false },
  { id: 'a12', question: 'Есть финансовые цели на 5 лет', category: 'goals', completed: false },
  { id: 'a13', question: 'Проверял кредитную историю за год', category: 'debt', completed: false },
  { id: 'a14', question: 'Имеет завещание / наследственный план', category: 'legacy', completed: false },
  { id: 'a15', question: 'Знает свою точку безубыточности', category: 'analytics', completed: false },
  { id: 'a16', question: 'Ребалансирует портфель ежеквартально', category: 'invest', completed: false },
  { id: 'a17', question: 'Использует ИИС / НПФ', category: 'tax', completed: false },
  { id: 'a18', question: 'Имеет 3+ источника дохода', category: 'income', completed: false },
  { id: 'a19', question: 'Автоматизированы платежи и сбережения', category: 'budget', completed: false },
  { id: 'a20', question: 'Понимает свою FIRE-цифру', category: 'analytics', completed: false },
  { id: 'a21', question: 'Имеет резерв в валюте / золоте', category: 'protection', completed: false },
  { id: 'a22', question: 'Прошёл финансовый аудит за квартал', category: 'audit', completed: false },
  { id: 'a23', question: 'Обновил страховки за год', category: 'insurance', completed: false },
  { id: 'a24', question: 'Имеет план выхода на пенсию', category: 'legacy', completed: false },
];

export function calculateAuditScore(audits: AuditCheck[]): number {
  if (audits.length === 0) return 0;
  const completed = audits.filter(a => a.completed).length;
  return Math.round((completed / audits.length) * 100);
}
