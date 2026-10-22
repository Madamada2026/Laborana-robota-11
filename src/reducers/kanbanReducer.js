import { KANBAN_ACTIONS } from '../constants/kanbanActionTypes';

export const initialKanbanState = {
  cards: [
    { id: '1', title: 'Реалізувати API', description: 'Створити REST endpoints', priority: 'High', assignee: 'Олександр', status: 'Todo', createdAt: '2026-10-22' },
    { id: '2', title: 'Верстка сторінки', description: 'Створити сітку Tailwind', priority: 'Medium', assignee: 'Марія', status: 'In Progress', createdAt: '2026-10-21' },
    { id: '3', title: 'Написати тести', description: 'Vitest для компонентів', priority: 'Low', assignee: 'Іван', status: 'Done', createdAt: '2026-10-20' }
  ],
  filterPriority: 'All',
  filterAssignee: 'All'
};

export function kanbanReducer(state, action) {
  switch (action.type) {
    case KANBAN_ACTIONS.ADD_CARD:
      return {
        ...state,
        cards: [...state.cards, action.payload]
      };

    case KANBAN_ACTIONS.MOVE_CARD: {
      const { cardId, newStatus } = action.payload;
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === cardId ? { ...card, status: newStatus } : card
        )
      };
    }

    case KANBAN_ACTIONS.DELETE_CARD:
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };

    case KANBAN_ACTIONS.SET_FILTER_PRIORITY:
      return { ...state, filterPriority: action.payload };

    case KANBAN_ACTIONS.SET_FILTER_ASSIGNEE:
      return { ...state, filterAssignee: action.payload };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
