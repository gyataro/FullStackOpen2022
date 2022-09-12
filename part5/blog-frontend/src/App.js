import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Message from './components/Message'
import Togglable from './components/Togglable'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState({})
  const blogFormRef = useRef()

  useEffect(() => {
    const currentUser = window.localStorage.getItem('currentUser')
    if (currentUser) {
      const user = JSON.parse(currentUser)
      setUser(user)
      blogService.setToken(user.token)
      blogService.getAll().then(blogs => {
        blogs.sort((a, b) => b.likes - a.likes)
        setBlogs(blogs)
      })
    }
  }, [])

  const handleLogin = async (username, password) => {
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('currentUser', JSON.stringify(user))
      setUser(user)
      blogService.setToken(user.token)
      blogService.getAll().then(blogs => {
        blogs.sort((a, b) => b.likes - a.likes)
        setBlogs(blogs)
      })
    } catch(e) {
      showMessage(e.response.data.error, 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('currentUser')
    setUser(null)
  }

  const handleCreateBlog = async (title, author, url) => {
    try {
      const blog = await blogService.create({ title, author, url })
      blogFormRef.current.toggleVisibility()
      setBlogs(blogs => [...blogs, blog])
      showMessage(`a new blog "${blog.title}" by ${blog.author} added`, 'success')
    } catch(e) {
      showMessage(e.response.data.error, 'error')
    }
  }

  const handleLikeBlog = async (likedBlog) => {
    try {
      await blogService.modify({ ...likedBlog, likes: likedBlog.likes + 1 })
      let updatedBlogs = blogs.map(blog => {
        if(blog.id === likedBlog.id) return { ...blog, likes: blog.likes + 1 }
        return blog
      })
      updatedBlogs.sort((a, b) => b.likes - a.likes)
      setBlogs(updatedBlogs)
    } catch(e) {
      showMessage(e.response.data.error, 'error')
    }
  }

  const handleDeleteBlog = async (deletedBlog) => {
    if(!window.confirm(`Delete blog ${deletedBlog.title} by ${deletedBlog.author}?`)) return

    try {
      await blogService.remove(deletedBlog)
      let updatedBlogs = blogs.filter(blog => {
        return blog.id !== deletedBlog.id
      })
      setBlogs(updatedBlogs)
      showMessage('Blog deleted successfully', 'success')
    } catch(e) {
      showMessage(e.response.data.error, 'error')
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => {
      setMessage({})
    }, 3000)
  }

  return (
    <div>
      <Message text={message.text} type={message.type}/>

      {user === null ?
        <LoginForm handleLogin={handleLogin} /> :
        <div>
          <h2>blogs</h2>
          <p>{user.name} logged-in <button onClick={handleLogout}>logout</button></p>

          <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <h2>create new</h2>
            <BlogForm handleCreateBlog={handleCreateBlog} />
          </Togglable>

          {
            blogs.map(
              blog => <Blog
                key={blog.id}
                blog={blog}
                handleLikeBlog={handleLikeBlog}
                handleDeleteBlog={handleDeleteBlog}
              />
            )
          }
        </div>
      }

    </div>
  )
}

export default App
