import { createSlice } from "@reduxjs/toolkit"
import anecdoteService from "../services/anecdoteService"

const sortByVotes = (a, b) => {
  return (a.votes <= b.votes) ? 1 : -1
}

const initialState = []

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState,
  reducers: {
    modifyAnecdote(state, action) {
      const id = action.payload.id
      const changedAnecdote = action.payload
      return state.map(anecdote => anecdote.id === id ? changedAnecdote : anecdote).sort(sortByVotes)
    },
    appendAnecdote(state, action) {
      return [ ...state, action.payload ]
    },
    setAnecdotes(state, action) {
      return action.payload
    }
  }
})

export const { modifyAnecdote, appendAnecdote, setAnecdotes } = anecdoteSlice.actions

export const initializeAnecdotes = () => {
  return async dispatch => {
    const anecdotes = await anecdoteService.getAll()
    dispatch(setAnecdotes(anecdotes))
  }
}

export const createAnecdote = content => {
  return async dispatch => {
    const newAnecdote = await anecdoteService.createNew(content)
    dispatch(appendAnecdote(newAnecdote))
  }
}

export const voteAnecdote = id => {
  return async (dispatch, getState) => {
    const targetAnecdote = getState().anecdotes.find(anecdote => anecdote.id === id)
    const changedAnecdote = await anecdoteService.modify({ ...targetAnecdote, votes: targetAnecdote.votes + 1 })
    dispatch(modifyAnecdote(changedAnecdote))
  }
}

export default anecdoteSlice.reducer