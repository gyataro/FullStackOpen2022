const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
}, 10000)

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('all blogs have the unique identifier "id"', async () => {
  const response = await api.get('/api/blogs')
  for(let blog of response.body) {
    expect(blog.id).toBeDefined()
  }
})

test('adding a blog', async() => {
  const newBlog = {
    title: "Adding a New Blog",
    author: "New Author",
    url: "http://www.newblog.com/newauthor",
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  expect(titles).toContain(newBlog.title)
})

test('adding a blog without "likes", it will default to 0', async () => {
  const newBlog = {
    title: "Adding a New Blog",
    author: "New Author",
    url: "http://www.newblog.com/newauthor"
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)
})

test('adding a blog without "title" or "url" will fail', async () => {
  const newBlogNoTitle = {
    author: "New Author",
    url: "http://www.newblog.com/newauthor"
  }

  const newBlogNoUrl = {
    title: "Adding a New Blog",
    author: "New Author"
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoTitle)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .send(newBlogNoUrl)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

afterAll(() => {
  mongoose.connection.close()
})