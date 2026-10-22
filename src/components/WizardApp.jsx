import React, { useReducer, useEffect, useCallback } from 'react';
import { wizardReducer, initialWizardState } from '../reducers/wizardReducer';
import { WIZARD_ACTIONS } from '../constants/wizardActionTypes';

// Ключ для localStorage
const STORAGE_KEY = 'wizard_form_progress';

function WizardApp() {
  // Ініціалізація стану з урахуванням збережених даних у localStorage (якщо є)
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initial;
    } catch (e) {
      return initial;
    }
  });

  // Побічний ефект (useEffect): збереження прогресу у localStorage при кожній зміні стану форми
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Помилка збереження у localStorage', e);
    }
  }, [state]);

  // Обробник зміни полів вводу
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: WIZARD_ACTIONS.UPDATE_FIELD,
      payload: { field: name, value: type === 'checkbox' ? checked : value }
    });
  }, []);

  // Логіка валідації для кожного кроку окремо
  const validateStep = () => {
    const newErrors = {};
    const { currentStep, formData } = state;

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "Ім'я обов'язкове";
      if (!formData.lastName.trim()) newErrors.lastName = "Прізвище обов'язкове";
      if (!formData.birthDate) newErrors.birthDate = 'Дата народження обов\'язкова';
    } else if (currentStep === 2) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email обов\'язковий';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Некоректний формат email';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Номер телефону обов\'язковий';
      if (!formData.city.trim()) newErrors.city = 'Місто обов\'язкове';
    } else if (currentStep === 3) {
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Ви повинні погодитися з умовами';
      }
    }

    return newErrors;
  };

  // Перехід на наступний крок (з перевіркою валідації)
  const handleNext = () => {
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length > 0) {
      dispatch({ type: WIZARD_ACTIONS.SET_ERRORS, payload: stepErrors });
      return;
    }
    dispatch({ type: WIZARD_ACTIONS.NEXT_STEP });
  };

  // Перехід на попередній крок
  const handlePrev = () => {
    dispatch({ type: WIZARD_ACTIONS.PREV_STEP });
  };

  // Фінальна відправка форми
  const handleSubmit = (e) => {
    e.preventDefault();
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length > 0) {
      dispatch({ type: WIZARD_ACTIONS.SET_ERRORS, payload: stepErrors });
      return;
    }

    alert('Форму успішно надіслано!');
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: WIZARD_ACTIONS.RESET_FORM });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Реєстрація: Крок {state.currentStep} з 3</h2>

      {/* Індикатор прогресу */}
      <div style={{ display: 'flex', marginBottom: '20px', gap: '5px' }}>
        {[1, 2, 3].map(step => (
          <div 
            key={step} 
            style={{ 
              flex: 1, 
              height: '6px', 
              background: state.currentStep >= step ? '#007bff' : '#e0e0e0',
              borderRadius: '3px'
            }} 
          />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* КРОК 1: Персональна інформація */}
        {state.currentStep === 1 && (
          <div>
            <h3>1. Персональна інформація</h3>
            <div style={{ marginBottom: '10px' }}>
              <label>Ім'я:</label><br />
              <input 
                type="text" 
                name="firstName" 
                value={state.formData.firstName} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '8px' }}
              />
              {state.errors.firstName && <span style={{ color: 'red', fontSize: '12px' }}>{state.errors.firstName}</span>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Прізвище:</label><br />
              <input 
                type="text" 
                name="lastName" 
                value={state.formData.lastName} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '8px' }}
              />
              {state.errors.lastName && <span style={{ color: 'red', fontSize: '12px' }}>{state.errors.lastName}</span>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Дата народження:</label><br />
              <input 
                type="date" 
                name="birthDate" 
                value={state.formData.birthDate} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '8px' }}
              />
              {state.errors.birthDate && <span style={{ color: 'red', fontSize: '12px' }}>{state.errors.birthDate}</span>}
            </div>
          </div>
        )}

        {/* КРОК 2: Контактні дані */}
        {state.currentStep === 2 && (
          <div>
            <h3>2. Контактні дані</h3>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label><br />
              <input 
                type="email" 
                name="email" 
                value={state.formData.email} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '8px' }}
              />
              {state.errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{state.errors.email}</span>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Телефон:</label><br />
              <input 
                type="text" 
                name="phone" 
                value={state.formData.phone} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '8px' }}
              />
              {state.errors.phone && <span style={{ color: 'red', fontSize: '12px' }}>{state.errors.phone}</span>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Місто:</label><br />
              <input 
                type="text" 
                name="city" 
                value={state.formData.city} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '8px' }}
              />
              {state.errors.city && <span style={{ color: 'red', fontSize: '12px' }}>{state.errors.city}</span>}
            </div>
          </div>
        )}

        {/* КРОК 3: Підтвердження */}
        {state.currentStep === 3 && (
          <div>
            <h3>3. Підтвердження даних</h3>
            <div style={{ background: '#f9f9f9', padding: '10px', marginBottom: '15px', borderRadius: '5px' }}>
              <p><strong>Ім'я:</strong> {state.formData.firstName} {state.formData.lastName}</p>
              <p><strong>Дата народження:</strong> {state.formData.birthDate}</p>
              <p><strong>Email:</strong> {state.formData.email}</p>
              <p><strong>Телефон:</strong> {state.formData.phone}</p>
              <p><strong>Місто:</strong> {state.formData.city}</p>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>
                <input 
                  type="checkbox" 
                  name="acceptTerms" 
                  checked={state.formData.acceptTerms} 
                  onChange={handleChange} 
                />{' '}
                Я погоджуюсь з умовами обробки даних
              </label><br />
              {state.errors.acceptTerms && <span style={{ color: 'red', fontSize: '12px' }}>{state.errors.acceptTerms}</span>}
            </div>
          </div>
        )}

        {/* Кнопки навігації */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {state.currentStep > 1 ? (
            <button type="button" onClick={handlePrev} style={{ padding: '8px 15px' }}>Назад</button>
          ) : <div />}

          {state.currentStep < 3 ? (
            <button type="button" onClick={handleNext} style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Далі</button>
          ) : (
            <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Підтвердити і надіслати</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default WizardApp;
