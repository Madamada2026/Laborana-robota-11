import { CART_ACTIONS } from '../constants/cartActionTypes';

export const initialCartState = {
  items: [], // масив товарів: { id, name, price, quantity, image }
  promoCode: null,
  discountPercent: 0 // наприклад, 10 для 10% знижки
};

export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const newItem = action.payload;
      // Перевіряємо, чи є вже такий товар у кошику
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);

      if (existingItemIndex > -1) {
        // Якщо товар є, збільшуємо його quantity
        const updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        );
        return { ...state, items: updatedItems };
      }

      // Якщо товару немає, додаємо новий з дефолтною кількістю 1
      return {
        ...state,
        items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }]
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // Якщо кількість 0 або менше — видаляємо товар
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...initialCartState
      };
    }

    case CART_ACTIONS.APPLY_PROMO_CODE: {
      const code = action.payload.trim().toUpperCase();
      let discount = 0;

      // Приклад простих промокодів
      if (code === 'DISCOUNT10') {
        discount = 10; // 10% знижки
      } else if (code === 'SUPER20') {
        discount = 20; // 20% знижки
      } else {
        alert('Невірний промокод!');
        return state;
      }

      return {
        ...state,
        promoCode: code,
        discountPercent: discount
      };
    }

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
