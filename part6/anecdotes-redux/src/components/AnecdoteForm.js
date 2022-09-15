import { useDispatch } from 'react-redux'
import { createAnecdote } from '../reducers/anecdoteReducer'
import { setNotification } from '../reducers/notificationReducer'

const AnecdoteForm = () => {
  const dispatch = useDispatch()

  const create = async (event) => {
    event.preventDefault()
    const content = event.target.content.value
    event.target.content.value = ''
    dispatch(createAnecdote(content))
    dispatch(setNotification(`new anecdote '${content}'`, 5))
  }

  return (
    <form onSubmit={create}>
      <div><input name="content"/></div>
      <button type="submit">create</button>
    </form>
  )
}

export default AnecdoteForm