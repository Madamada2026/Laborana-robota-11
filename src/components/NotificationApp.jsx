import React, { useReducer, useCallback } from 'react';
import { notificationReducer, initialNotificationState } from '../reducers/notificationReducer';
import { NOTIF_ACTIONS } from '../constants/notificationActionTypes';

// Компонент окремого повідомлення з автовидаленням
function NotificationItem({ notification, onRemove }) {
  // Автоматичне видалення через заданий час (duration у мілісекундах)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, [notification, onRemove]);

  // Стилі залежно від типу нотифікації
  const getStyle = (type) => {
    const base = { padding: '12px 15px', marginBottom: '10px', borderRadius: '5px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' };
    switch (type) {
      case 'success': return { ...base, background: '#28a745' };
      case 'error': return { ...base, background: '#dc3545' };
      case 'warning': return { ...base, background: '#ffc107', color: '#333' };
      case 'info': default: return { ...base, background: '#17a2b8' };
    }
  };

  return (
    <div style={getStyle(notification.type)}>
      <span>{notification.message}</span>
      <button 
        onClick={() => onRemove(notification.id)} 
        style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
      >
        &times;
      </button>
    </div>
  );
}

function NotificationApp() {
  const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);

  const removeNotification = useCallback((id) => {
    dispatch({ type: NOTIF_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  }, []);

  // Функція додавання нотифікації
  const triggerNotification = (type, message) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      type,
      message,
      duration: 4000 // 4 секунди за замовчуванням
    };
    dispatch({ type: NOTIF_ACTIONS.ADD_NOTIFICATION, payload: newNotif });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Система нотифікацій (Task 4)</h2>
      <p>Максимум одночасних повідомлень: {state.maxCount}</p>

      {/* Кнопки генерації різних типів нотифікацій */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => triggerNotification('success', 'Операція успішно виконана!')} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Success</button>
        <button onClick={() => triggerNotification('error', 'Сталася критична помилка!')} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Error</button>
        <button onClick={() => triggerNotification('warning', 'Увага! Перевірте дані.')} style={{ background: '#ffc107', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Warning</button>
        <button onClick={() => triggerNotification('info', 'Інформаційне повідомлення.')} style={{ background: '#17a2b8', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Info</button>
      </div>

      {/* Контейнер відображення нотифікацій (фіксована або динамічна область) */}
      <div style={{ minHeight: '150px' }}>
        {state.notifications.length === 0 ? (
          <p style={{ color: '#888' }}>Немає активних повідомлень</p>
        ) : (
          state.notifications.map(notif => (
            <NotificationItem key={notif.id} notification={notif} onRemove={removeNotification} />
          ))
        )}
      </div>

      {state.notifications.length > 0 && (
        <button 
          onClick={() => dispatch({ type: NOTIF_ACTIONS.CLEAR_ALL })}
          style={{ marginTop: '10px', padding: '6px 10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Очистити всі
        </button>
      )}
    </div>
  );
}

export default NotificationApp;
