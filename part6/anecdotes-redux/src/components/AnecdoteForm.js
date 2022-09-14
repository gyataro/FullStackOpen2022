import { useDispatch } from 'react-redux'
import { createAnecdote } from '../reducers/anecdoteReducer'

const AnecdoteForm = () => {
  const dispatch = useDispatch()

  const create = (event) => {
    event.preventDefault()
    const content = event.target.content.value
    event.target.content.value = ''
    console.log('create', content)
    dispatch(createAnecdote(content))
  }

  return (
    <form onSubmit={create}>
      <div><input name="content"/></div>
      <button type="submit">create</button>
    </form>
  )
}

export default AnecdoteForm