import React, { useReducer, useState, useMemo } from 'react';
import { kanbanReducer, initialKanbanState } from '../reducers/kanbanReducer';
import { KANBAN_ACTIONS } from '../constants/kanbanActionTypes';

const COLUMNS = ['Todo', 'In Progress', 'Done'];

function KanbanApp() {
  const [state, dispatch] = useReducer(kanbanReducer, initialKanbanState);

  // Локальний стан форми нової картки
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', assignee: '' });
  const [error, setError] = useState('');

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.assignee.trim()) {
      setError("Заповніть назву та виконавця");
      return;
    }
    setError('');

    const newCard = {
      id: Date.now().toString(),
      ...form,
      status: 'Todo',
      createdAt: new Date().toISOString().split('T')[0]
    };

    dispatch({ type: KANBAN_ACTIONS.ADD_CARD, payload: newCard });
    setForm({ title: '', description: '', priority: 'Medium', assignee: '' });
  };

  // Фільтрація карток
  const filteredCards = useMemo(() => {
    return state.cards.filter(card => {
      const matchPriority = state.filterPriority === 'All' || card.priority === state.filterPriority;
      const matchAssignee = state.filterAssignee === 'All' || card.assignee === state.filterAssignee;
      return matchPriority && matchAssignee;
    });
  }, [state.cards, state.filterPriority, state.filterAssignee]);

  // Унікальні виконавці для фільтра
  const assignees = useMemo(() => {
    return ['All', ...new Set(state.cards.map(c => c.assignee))];
  }, [state.cards]);

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Kanban Board (Управління проєктами)</h2>

    {/* Панель фільтрів */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
        <div>
          <label>Пріоритет: </label>
          <select 
            value={state.filterPriority} 
            onChange={(e) => dispatch({ type: KANBAN_ACTIONS.SET_FILTER_PRIORITY, payload: e.target.value })}
            style={{ padding: '5px' }}
          >
            <option value="All">Всі</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label>Виконавець: </label>
          <select 
            value={state.filterAssignee} 
            onChange={(e) => dispatch({ type: KANBAN_ACTIONS.SET_FILTER_ASSIGNEE, payload: e.target.value })}
            style={{ padding: '5px' }}
          >
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Форма додавання картки */}
      <form onSubmit={handleAddCard} style={{ background: '#f1f3f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Додати нову картку</h3>
        {error && <p style={{ color: 'red', margin: '5px 0' }}>{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" placeholder="Назва" value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })} style={{ padding: '6px' }}
          />
          <input 
            type="text" placeholder="Опис" value={form.description} 
            onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '6px' }}
          />
          <input 
            type="text" placeholder="Виконавець (Assignee)" value={form.assignee} 
            onChange={e => setForm({ ...form, assignee: e.target.value })} style={{ padding: '6px' }}
          />
          <select 
            value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ padding: '6px' }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
       <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Додати картку</button>
      </form>

      {/* Колонки Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        {COLUMNS.map(col => (
          <div key={col} style={{ background: '#ebecf0', padding: '15px', borderRadius: '8px', minHeight: '300px' }}>
            <h3 style={{ marginTop: '0', borderBottom: '2px solid #ccc', paddingBottom: '8px' }}>{col}</h3>
            
            {filteredCards.filter(card => card.status === col).map(card => (
              <div 
                key={card.id} 
                style={{ background: '#fff', padding: '10px', marginBottom: '10px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('cardId', card.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px' }}>{card.title}</strong>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: card.priority === 'High' ? '#dc3545' : card.priority === 'Medium' ? '#ffc107' : '#28a745', color: '#fff' }}>
                    {card.priority}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#555', margin: '5px 0' }}>{card.description}</p>
                <div style={{ fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span>👤 {card.assignee}</span>
                  <span>📅 {card.createdAt}</span>
                </div>

                {/* Кнопки переміщення між колонками */}
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                  <select 
                    value={card.status} 
                    onChange={(e) => dispatch({ type: KANBAN_ACTIONS.MOVE_CARD, payload: { cardId: card.id, newStatus: e.target.value } })}
                    style={{ fontSize: '11px' }}
                  >
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button 
                    onClick={() => dispatch({ type: KANBAN_ACTIONS.DELETE_CARD, payload: card.id })}
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanApp;
