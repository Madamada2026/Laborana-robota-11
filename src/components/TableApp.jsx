import React, { useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { tableReducer, initialTableState } from '../reducers/tableReducer';
import { TABLE_ACTIONS } from '../constants/tableActionTypes';

// Тестові дані для таблиці
const MOCK_USERS = [
  { id: 1, name: 'Олександр Петренко', email: 'oleksandr@gmail.com', role: 'Розробник' },
  { id: 2, name: 'Марія Коваленко', email: 'maria@ukr.net', role: 'Дизайнер' },
  { id: 3, name: 'Іван Шевченко', email: 'ivan@gmail.com', role: 'Менеджер' },
  { id: 4, name: 'Анна Бондар', email: 'anna@gmail.com', role: 'Тестувальник' },
  { id: 5, name: ' Дмитро Мельник', email: 'dmytro@ukr.net', role: 'Розробник' },
  { id: 6, name: 'Ольга Ткаченко', email: 'olga@gmail.com', role: 'HR' },
  { id: 7, name: 'Сергій Бойко', email: 'sergiy@gmail.com', role: 'DevOps' }
];

function TableApp() {
  const [state, dispatch] = useReducer(tableReducer, initialTableState);

  // Асинхронне завантаження даних (симуляція через dispatch послідовності)
  const loadData = useCallback(() => {
    dispatch({ type: TABLE_ACTIONS.FETCH_START });

    setTimeout(() => {
      // Симулюємо успішне завантаження
      dispatch({ type: TABLE_ACTIONS.FETCH_SUCCESS, payload: MOCK_USERS });
    }, 1000);
  }, []);

  // Завантажуємо дані при першому рендері
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Обробники подій
  const handleFilterChange = (e) => {
    dispatch({ type: TABLE_ACTIONS.SET_FILTER, payload: e.target.value });
  };

  const handleSort = (column) => {
    dispatch({ type: TABLE_ACTIONS.SET_SORT, payload: column });
  };

  const handlePageChange = (newPage) => {
    dispatch({ type: TABLE_ACTIONS.SET_PAGE, payload: newPage });
  };

  const handlePageSizeChange = (e) => {
    dispatch({ type: TABLE_ACTIONS.SET_PAGE_SIZE, payload: Number(e.target.value) });
  };

  // Фільтрація, сортування та пагінація даних за допомогою useMemo
  const processedData = useMemo(() => {
    let result = [...state.data];

    // 1. Фільтрація за текстом (по імені або email)
    if (state.filterText.trim()) {
      const query = state.filterText.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.email.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query)
      );
    }

    // 2. Сортування
    if (state.sorting.column) {
      result.sort((a, b) => {
        const valA = a[state.sorting.column];
        const valB = b[state.sorting.column];
        if (valA < valB) return state.sorting.direction === 'asc' ? -1 : 1;
        if (valA > valB) return state.sorting.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [state.data, state.filterText, state.sorting]);

  // Дані для поточної сторінки (пагінація)
  const paginatedData = useMemo(() => {
    const start = (state.pagination.currentPage - 1) * state.pagination.pageSize;
    return processedData.slice(start, start + state.pagination.pageSize);
  }, [processedData, state.pagination.currentPage, state.pagination.pageSize]);

  const totalPages = Math.ceil(processedData.length / state.pagination.pageSize) || 1;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Таблиця користувачів (Пагінація, Сортування, Фільтрація)</h2>

      {/* Панель керування: фільтр та оновлення */}
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input 
          type="text"
          placeholder="Фільтр за ім'ям, email або роллю..."
          value={state.filterText}
          onChange={handleFilterChange}
          style={{ padding: '8px', width: '300px' }}
        />
        <button onClick={loadData} style={{ padding: '8px 12px' }}>Перезавантажити дані</button>
      </div>

      {/* Статуси завантаження / помилки */}
      {state.loading && <p>Завантаження даних...</p>}
      {state.error && <p style={{ color: 'red' }}>Помилка: {state.error}</p>}

      {/* Сама таблиця */}
      {!state.loading && (
        <>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  ID {state.sorting.column === 'id' ? (state.sorting.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Ім'я {state.sorting.column === 'name' ? (state.sorting.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email {state.sorting.column === 'email' ? (state.sorting.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                  Роль {state.sorting.column === 'role' ? (state.sorting.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Даних не знайдено</td>
                </tr>
              ) : (
                paginatedData.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Панель пагінації */}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span>Показувати по: </span>
              <select value={state.pagination.pageSize} onChange={handlePageSizeChange}>
                <option value="2">2</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>

            <div>
              <button 
                onClick={() => handlePageChange(state.pagination.currentPage - 1)}
                disabled={state.pagination.currentPage === 1}
              >
                Назад
              </button>
              <span style={{ margin: '0 10px' }}>
                Сторінка {state.pagination.currentPage} з {totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(state.pagination.currentPage + 1)}
                disabled={state.pagination.currentPage >= totalPages}
              >
                Вперед
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TableApp;

