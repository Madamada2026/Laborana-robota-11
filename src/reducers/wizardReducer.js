import { WIZARD_ACTIONS } from '../constants/wizardActionTypes';

export const initialWizardState = {
  currentStep: 1, // Поточний крок (1, 2 або 3)
  formData: {
    // Крок 1: Персональна інформація
    firstName: '',
    lastName: '',
    birthDate: '',
    // Крок 2: Контактні дані
    email: '',
    phone: '',
    city: '',
    // Крок 3: Підтвердження (наприклад, згода з умовами)
    acceptTerms: false
  },
  errors: {} // Помилки валідації для поточного кроку
};

export function wizardReducer(state, action) {
  switch (action.type) {
    case WIZARD_ACTIONS.UPDATE_FIELD: {
      const { field, value } = action.payload;
      return {
        ...state,
        formData: {
          ...state.formData,
          [field]: value
        },
        // Очищаємо помилку для поля при його редагуванні
        errors: {
          ...state.errors,
          [field]: ''
        }
      };
    }

    case WIZARD_ACTIONS.SET_ERRORS: {
      return {
        ...state,
        errors: action.payload
      };
    }

    case WIZARD_ACTIONS.NEXT_STEP: {
      if (state.currentStep >= 3) return state;
      return {
        ...state,
        currentStep: state.currentStep + 1,
        errors: {} // Очищаємо помилки при переході на наступний крок
      };
    }

    case WIZARD_ACTIONS.PREV_STEP: {
      if (state.currentStep <= 1) return state;
      return {
        ...state,
        currentStep: state.currentStep - 1,
        errors: {}
      };
    }

    case WIZARD_ACTIONS.RESET_FORM: {
      return initialWizardState;
    }

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
