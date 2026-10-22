import { CALENDAR_ACTIONS } from '../constants/calendarActionTypes';

export const initialCalendarState = {
  events: [
    { id: 1, date: '2026-10-25', time: '10:00', title: 'Лекція з архітектури', description: 'Clean Architecture' },
    { id: 2, date: '2026-10-26', time: '14:30', title: 'Зустріч команди', description: 'Обговорення завдань' }
  ],
  currentDate: new Date(2026, 9, 1), // Поточний місяць (жовтень 2026)
  selectedDate: null,                 // Фільтрація за конкретною клітинкою календаря
  filterText: ''                      // Пошук за текстом
};

export function calendarReducer(state, action) {
  switch (action.type) {
    case CALENDAR_ACTIONS.ADD_EVENT:
      return {
        ...state,
        events: [...state.events, action.payload]
      };

    case CALENDAR_ACTIONS.EDIT_EVENT:
      return {
        ...state,
        events: state.events.map(ev => ev.id === action.payload.id ? action.payload : ev)
      };

    case CALENDAR_ACTIONS.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(ev => ev.id !== action.payload)
      };

    case CALENDAR_ACTIONS.NEXT_MONTH: {
      const next = new Date(state.currentDate);
      next.setMonth(next.getMonth() + 1);
      return { ...state, currentDate: next };
    }

    case CALENDAR_ACTIONS.PREV_MONTH: {
      const prev = new Date(state.currentDate);
      prev.setMonth(prev.getMonth() - 1);
      return { ...state, currentDate: prev };
    }

    case CALENDAR_ACTIONS.SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload // Рядок виду 'YYYY-MM-DD' або null
      };

    case CALENDAR_ACTIONS.SET_FILTER_TEXT:
      return {
        ...state,
        filterText: action.payload
      };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
