import { useState } from 'react'

const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5
}

const Blog = ({
  blog,
  handleLikeBlog,
  handleDeleteBlog
}) => {
  const [isDetailed, setDetailed] = useState(false)

  const toggleDetails = () => {
    setDetailed(!isDetailed)
  }

  const Details = () => (
    <div>
      <ul>
        <li>Url: {blog.url}</li>
        <li>Likes: {blog.likes}<button onClick={() => handleLikeBlog(blog)}>like</button></li>
        <li>Created by: {blog.user.name}</li>
      </ul>
      <button onClick={() => handleDeleteBlog(blog)}>remove</button>
    </div>
  )

  return (
    <div style={blogStyle} className="blog">
      {blog.title} by {blog.author}
      <button onClick={toggleDetails}>{isDetailed ? 'hide' : 'show'}</button>
      { isDetailed && <Details/> }
    </div>
  )
}

export default Blog