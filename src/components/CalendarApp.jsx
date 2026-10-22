import React, { useReducer, useMemo, useState, useCallback } from 'react';
import { calendarReducer, initialCalendarState } from '../reducers/calendarReducer';
import { CALENDAR_ACTIONS } from '../constants/calendarActionTypes';

function CalendarApp() {
  const [state, dispatch] = useReducer(calendarReducer, initialCalendarState);

  // Локальний стан форми додавання/редагування події
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Навігація по місяцях
  const handlePrevMonth = () => dispatch({ type: CALENDAR_ACTIONS.PREV_MONTH });
  const handleNextMonth = () => dispatch({ type: CALENDAR_ACTIONS.NEXT_MONTH });

  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  // Генерація днів місяця для сітки
  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      days.push(`${yearStr}-${monthStr}-${dayStr}`);
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [year, month]);

  // Валідація та збереження події (з перевіркою на накладення часу)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.date || !form.time) {
      setError("Заповніть обов'язкові поля (Назва, Дата, Час)");
      return;
    }

    // Перевірка на накладення подій (Event Overlap Prevention) в той самий день і час
    const isOverlap = state.events.some(ev => 
      ev.date === form.date && ev.time === form.time && ev.id !== editingId
    );

    if (isOverlap) {
      setError('На цей день і час вже запланована інша подія!');
      return;
    }

    if (editingId) {
      dispatch({
        type: CALENDAR_ACTIONS.EDIT_EVENT,
        payload: { id: editingId, ...form }
      });
      setEditingId(null);
    } else {
      dispatch({
        type: CALENDAR_ACTIONS.ADD_EVENT,
        payload: { id: Date.now(), ...form }
      });
    }

    setForm({ title: '', date: '', time: '', description: '' });
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setForm({ title: event.title, date: event.date, time: event.time, description: event.description });
  };

  const handleDelete = (id) => {
    dispatch({ type: CALENDAR_ACTIONS.DELETE_EVENT, payload: id });
  };

  // Фільтрація подій за текстом та обраною датою
  const filteredEvents = useMemo(() => {
    return state.events.filter(ev => {
      const matchesText = ev.title.toLowerCase().includes(state.filterText.toLowerCase()) ||
                          ev.description.toLowerCase().includes(state.filterText.toLowerCase());
      const matchesDate = state.selectedDate ? ev.date === state.selectedDate : true;
      return matchesText && matchesDate;
    });
  }, [state.events, state.filterText, state.selectedDate]);

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Календар подій</h2>

      {/* Панель навігації та пошуку */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <button onClick={handlePrevMonth} style={{ padding: '6px 12px' }}>&lt; Попередній</button>
          <span style={{ margin: '0 15px', fontWeight: 'bold', fontSize: '18px' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} style={{ padding: '6px 12px' }}>Наступний &gt;</button>
        </div>
        <input 
          type="text" 
          placeholder="Пошук подій..." 
          value={state.filterText}
          onChange={(e) => dispatch({ type: CALENDAR_ACTIONS.SET_FILTER_TEXT, payload: e.target.value })}
          style={{ padding: '6px', width: '200px' }}
        />
      </div>

      {/* Форма додавання / редагування */}
      <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editingId ? 'Редагувати подію' : 'Додати нову подію'}</h3>
        {error && <p style={{ color: 'red', margin: '5px 0' }}>{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="Назва події" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ padding: '8px' }}
          />
          <input 
            type="date" 
            value={form.date} 
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ padding: '8px' }}
          />
          <input 
            type="time" 
            value={form.time} 
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            style={{ padding: '8px' }}
          />
          <input 
            type="text" 
            placeholder="Опис" 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {editingId ? 'Зберегти зміни' : 'Додати подію'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', date: '', time: '', description: '' }); }} style={{ marginLeft: '10px', padding: '8px 15px' }}>
            Скасувати
          </button>
        )}
      </form>

      {/* Міні-календар (список днів місяця для фільтрації) */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Фільтрувати за днем місяця: </strong>
        <button onClick={() => dispatch({ type: CALENDAR_ACTIONS.SET_SELECTED_DATE, payload: null })} style={{ margin: '2px', padding: '4px 8px' }}>Всі</button>
        {daysInMonth.map(day => (
          <button 
            key={day} 
            onClick={() => dispatch({ type: CALENDAR_ACTIONS.SET_SELECTED_DATE, payload: day })}
            style={{ margin: '2px', padding: '4px 8px', background: state.selectedDate === day ? '#007bff' : '#eee', color: state.selectedDate === day ? '#fff' : '#000', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
          >
            {day.split('-')[2]}
          </button>
        ))}
      </div>

      {/* Список подій */}
      <div>
        <h3>Список подій ({filteredEvents.length})</h3>
        {filteredEvents.length === 0 ? (
          <p style={{ color: '#888' }}>Подій не знайдено</p>
        ) : (
          filteredEvents.map(ev => (
            <div key={ev.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{ev.title} ({ev.date} о {ev.time})</h4>
                <p style={{ margin: '0', color: '#555' }}>{ev.description}</p>
              </div>
              <div>
                <button onClick={() => handleEdit(ev)} style={{ marginRight: '5px', padding: '5px 10px' }}>Редагувати</button>
                <button onClick={() => handleDelete(ev.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px' }}>Видалити</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CalendarApp;
