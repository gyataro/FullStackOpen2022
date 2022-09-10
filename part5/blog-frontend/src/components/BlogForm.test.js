import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'


describe('<BlogForm />', () => {
  let container

  const form = {
    title: 'testing form title',
    author: 'testing form author',
    url: 'http://www.form.com'
  }

  const handleCreateBlog = jest.fn()

  beforeEach(() => {
    container = render(
      <BlogForm handleCreateBlog={handleCreateBlog} />
    ).container
  })

  test('calls handleCreateBlog with the right details, after a new blog is created', async () => {
    const user = userEvent.setup()
    const titleInput = container.querySelector('#title')
    const authorInput = container.querySelector('#author')
    const urlInput = container.querySelector('#url')
    const createButton = screen.getByText('create')

    await user.type(titleInput, form.title)
    await user.type(authorInput, form.author)
    await user.type(urlInput, form.url)
    await user.click(createButton)

    expect(handleCreateBlog.mock.calls).toHaveLength(1)
    expect(handleCreateBlog.mock.calls[0][0]).toBe(form.title)
    expect(handleCreateBlog.mock.calls[0][1]).toBe(form.author)
    expect(handleCreateBlog.mock.calls[0][2]).toBe(form.url)
  })
})