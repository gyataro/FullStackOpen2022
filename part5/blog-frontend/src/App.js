import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Message from './components/Message'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState({})

  useEffect(() => {
    const currentUser = window.localStorage.getItem('currentUser')
    if (currentUser) {
      const user = JSON.parse(currentUser)
      setUser(user)
      blogService.setToken(user.token)
      blogService.getAll().then(blogs => setBlogs(blogs))
    }
  }, [])

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => {
      setMessage({})
    }, 3000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem('currentUser', JSON.stringify(user)) 
      
      setUser(user)
      setUsername('')
      setPassword('')
      blogService.setToken(user.token)
      blogService.getAll().then(blogs => setBlogs(blogs))

    } catch(e) {
      showMessage(e.response.data.error, 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('currentUser')
    setUser(null)
  }

  const handleCreateBlog = async (event) => {
    event.preventDefault()
   
    try {
      const blog = await blogService.create({ title, author, url })
      setBlogs(blogs => [...blogs, blog])
      setTitle('')
      setAuthor('')
      setUrl('')
      showMessage(`a new blog "${blog.title}" by ${blog.author} added`, 'success')
    } catch(e) {
      showMessage(e.response.data.error, 'error')
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
          <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
          <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>  
  )

  const blogForm = () => (
    <form onSubmit={handleCreateBlog}>
      <div>
        title
          <input
          type="text"
          value={title}
          name="Title"
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div>
        author
          <input
          type="text"
          value={author}
          name="Author"
          onChange={({ target }) => setAuthor(target.value)}
        />
      </div>
      <div>
        url
          <input
          type="text"
          value={url}
          name="Url"
          onChange={({ target }) => setUrl(target.value)}
        />
      </div>
      <button type="submit">create</button>
    </form>  
  )

  return (
    <div>
      <Message text={message.text} type={message.type}/>

      {user === null ?
        loginForm() :
        <div>
          <h2>blogs</h2>
          <p>{user.name} logged-in</p>
          <button onClick={handleLogout}>logout</button>
          <h2>create new</h2>
          { blogForm() }
          { blogs.map(blog => <Blog key={blog.id} blog={blog} />) }
        </div>
      }

    </div>
  )
}

export default App
