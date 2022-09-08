const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  if(!user) return 

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })
  
  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()
  response.status(201).json(result)
})

blogsRouter.put('/:id', async(request, response) => {
  const body = request.body
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog does not exist' })
  }
  if (blog.user.toString() != user._id.toString()) {
    return response.status(403).json({ error: 'permission denied' })
  }

  const result = await blog.update(body, { new: true })
  response.status(200).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const blogId = request.params.id
  const blog = await Blog.findById(blogId)

  if (!blog) {
    return response.status(404).json({ error: 'blog does not exist' })
  }
  if (blog.user.toString() != user._id.toString()) {
    return response.status(403).json({ error: 'permission denied' })
  }

  user.blogs.pull({ _id: blogId })
  await user.save()
  await Blog.deleteOne({ _id: blogId })
  response.status(204).end()
})

module.exports = blogsRouter