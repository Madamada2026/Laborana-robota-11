import { NOTIF_ACTIONS } from '../constants/notificationActionTypes';

export const initialNotificationState = {
  notifications: [],
  maxCount: 3 // Максимальна кількість одночасно відображуваних нотифікацій
};

export function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIF_ACTIONS.ADD_NOTIFICATION: {
      const newNotif = action.payload; // { id, type, message, duration }
      let updatedList = [newNotif, ...state.notifications];

      // Якщо перевищено максимальну кількість (maxCount), видаляємо найстарішу (останню в масиві)
      if (updatedList.length > state.maxCount) {
        updatedList = updatedList.slice(0, state.maxCount);
      }

      return {
        ...state,
        notifications: updatedList
      };
    }

    case NOTIF_ACTIONS.REMOVE_NOTIFICATION: {
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    }

    case NOTIF_ACTIONS.CLEAR_ALL: {
      return {
        ...state,
        notifications: []
      };
    }

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
