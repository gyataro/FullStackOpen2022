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

describe('when there are some blogs saved', () => {
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
})

describe('adding a new blog', () => {
  test('succeeds with valid data', async() => {
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
  
  test('without "likes", "likes" will default to 0', async () => {
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
  
  test('without "title" or "url" will fail', async () => {
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
})

describe('deleting a blog', () => {
  test('succeeds if "id" is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  
    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('succeeds if "id" is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes += 100

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
  
    const blogsAtEnd = await helper.blogsInDb()
    const likes = blogsAtEnd.map(blog => blog.likes)
    expect(likes).toContain(blogToUpdate.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})