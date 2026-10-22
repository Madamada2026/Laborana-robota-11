import React, { useReducer, useState, useMemo, useCallback } from 'react';
import { cartReducer, initialCartState } from '../reducers/cartReducer';
import { CART_ACTIONS } from '../constants/cartActionTypes';

// Приклад тестових товарів для магазину
const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Смартфон', price: 12000, image: '📱' },
  { id: 2, name: 'Ноутбук', price: 25000, image: '💻' },
  { id: 3, name: 'Навушники', price: 3000, image: '🎧' }
];

function CartApp() {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [promoInput, setPromoInput] = useState('');

  // Додавання товару
  const handleAddToCart = useCallback((product) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: product });
  }, []);

  // Видалення товару
  const handleRemove = useCallback((id) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: id });
  }, []);

  // Зміна кількості
  const handleQuantityChange = useCallback((id, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id, quantity } });
  }, []);

  // Очищення кошика
  const handleClear = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  }, []);

  // Застосування промокоду
  const handleApplyPromo = useCallback((e) => {
    e.preventDefault();
    if (!promoInput) return;
    dispatch({ type: CART_ACTIONS.APPLY_PROMO_CODE, payload: promoInput });
    setPromoInput('');
  }, [promoInput]);

  // Обчислення загальної суми та знижки через useMemo
  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = (subtotal * state.discountPercent) / 100;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      total
    };
  }, [state.items, state.discountPercent]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Кошик покупок в інтернет-магазині</h2>

      {/* Список доступних товарів для покупки */}
      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h3>Доступні товари:</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          {SAMPLE_PRODUCTS.map(product => (
            <div key={product.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px' }}>{product.image}</div>
              <h4>{product.name}</h4>
              <p>{product.price} грн</p>
              <button 
                onClick={() => handleAddToCart(product)}
                style={{ background: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}
              >
                Додати в кошик
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Вміст кошика */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h3>Ваш кошик</h3>
        {state.items.length === 0 ? (
          <p>Кошик порожній</p>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {state.items.map(item => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>{item.image} {item.name} — {item.price} грн/шт</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                    <span><strong>{item.price * item.quantity} грн</strong></span>
                    <button onClick={() => handleRemove(item.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '3px 8px', cursor: 'pointer' }}>Видалити</button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Промокод */}
            <form onSubmit={handleApplyPromo} style={{ margin: '15px 0' }}>
              <input 
                type="text" 
                placeholder="Введіть промокод (напр. DISCOUNT10)" 
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                style={{ padding: '5px', marginRight: '5px' }}
              />
              <button type="submit">Застосувати промокод</button>
              {state.promoCode && <p style={{ color: 'green', margin: '5px 0' }}>Промокод застосовано: {state.promoCode} (-{state.discountPercent}%)</p>}
            </form>

            {/* Підсумки */}
            <div style={{ fontSize: '18px', marginTop: '15px' }}>
              <p>Сума без знижки: {totals.subtotal} грн</p>
              {state.discountPercent > 0 && <p style={{ color: 'green' }}>Знижка: -{totals.discountAmount} грн</p>}
              <p><strong>Загальна сума до сплати: {totals.total} грн</strong></p>
            </div>

            <button 
              onClick={handleClear}
              style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}
            >
              Очистити кошик
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CartApp;
