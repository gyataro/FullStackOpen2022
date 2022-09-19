import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  message: '',
  timerId: null
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification(state, action) {
      return { ...state, message: action.payload }
    },
    hideNotification(state, action) {
      return { ...state, message: '' }
    },
    setTimerId(state, action) {
      return { ...state, timerId: action.payload } 
    }
  }
})

export const { showNotification, hideNotification, setTimerId } = notificationSlice.actions

export const setNotification = (message, seconds) => {
  return (dispatch, getState) => {
    clearTimeout(getState().notification.timerId)
    dispatch(showNotification(message))
    const timerId = setTimeout(() => {
      dispatch(hideNotification())
    }, 1000 * seconds)
    dispatch(setTimerId(timerId))
  }
}

export default notificationSlice.reducer