import { TABLE_ACTIONS } from '../constants/tableActionTypes';

export const initialTableState = {
  data: [],            // Повний масив завантажених даних
  loading: false,      // Статус завантаження
  error: null,         // Помилка завантаження
  pagination: {
    currentPage: 1,
    pageSize: 5        // Кількість елементів на сторінці
  },
  sorting: {
    column: null,      // Колонка для сортування (напр., 'name', 'email')
    direction: 'asc'   // 'asc' або 'desc'
  },
  filterText: ''       // Текст для фільтрації
};

export function tableReducer(state, action) {
  switch (action.type) {
    case TABLE_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case TABLE_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null
      };

    case TABLE_ACTIONS.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case TABLE_ACTIONS.SET_PAGE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: action.payload
        }
      };

    case TABLE_ACTIONS.SET_PAGE_SIZE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageSize: action.payload,
          currentPage: 1 // Скидаємо на першу сторінку при зміні розміру
        }
      };

    case TABLE_ACTIONS.SET_SORT: {
      const column = action.payload;
      let direction = 'asc';
      
      // Якщо клікаємо на ту саму колонку — міняємо напрямок сортування
      if (state.sorting.column === column) {
        direction = state.sorting.direction === 'asc' ? 'desc' : 'asc';
      }

      return {
        ...state,
        sorting: { column, direction }
      };
    }

    case TABLE_ACTIONS.SET_FILTER:
      return {
        ...state,
        filterText: action.payload,
        pagination: {
          ...state.pagination,
          currentPage: 1 // При фільтрації повертаємось на 1-шу сторінку
        }
      };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
