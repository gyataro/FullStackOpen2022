const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const config = require('../utils/config')
const Blog = require('../models/blog')
const User = require('../models/user')

let token

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash(config.SECRET, 10)
  let user = new User({ username: 'root', passwordHash })
  user = await user.save()

  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog({ ...blog, user: user._id }))
  const promiseArray = blogObjects.map(blog => blog.save())
  let blogs = await Promise.all(promiseArray)

  blogs.forEach(blog => {
    user.blogs = user.blogs.concat(blog._id)
  })
  user = await user.save()

  const userForToken = {
    username: user.username,
    id: user._id
  }

  token = jwt.sign(userForToken, config.SECRET)
}, 10000)

describe('when there are some blogs saved', () => {
  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('all blogs have the unique identifier "id"', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)

    for(let blog of response.body) {
      expect(blog.id).toBeDefined()
    }
  })
})

describe('adding a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Adding a New Blog',
      author: 'New Author',
      url: 'http://www.newblog.com/newauthor',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(newBlog.title)
  })

  test('succeeds without "likes", it will default to 0', async () => {
    const newBlog = {
      title: 'Adding a New Blog',
      author: 'New Author',
      url: 'http://www.newblog.com/newauthor'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('without "title" or "url" will fail', async () => {
    const newBlogNoTitle = {
      author: 'New Author',
      url: 'http://www.newblog.com/newauthor'
    }

    const newBlogNoUrl = {
      title: 'Adding a New Blog',
      author: 'New Author'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogNoTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogNoUrl)
      .expect(400)
  })

  test('fails without a token', async () => {
    const newBlog = {
      title: 'Adding a New Blog',
      author: 'New Author',
      url: 'http://www.newblog.com/newauthor',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('deleting a blog', () => {
  test('succeeds if "id" is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

  test('fails without a token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)
  })
})

describe('updating a blog', () => {
  test('succeeds if "id" is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes += 100

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const likes = blogsAtEnd.map(blog => blog.likes)
    expect(likes).toContain(blogToUpdate.likes)
  })

  test('fails without a token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes += 100

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(401)
  })
})

afterAll(() => {
  mongoose.connection.close()
})