import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  let container

  const blog = {
    title: 'testing blog title',
    author: 'author',
    url: 'http://www.blog.com',
    likes: 13,
    user: {
      name: 'user'
    }
  }

  const handleLikeBlog = jest.fn()

  beforeEach(() => {
    container = render(
      <Blog blog={blog} handleLikeBlog={handleLikeBlog}/>
    ).container
  })

  test('renders title and author, but not url and likes by default', () => {
    const div = container.querySelector('.blog')
    expect(div).toHaveTextContent(blog.title)
    expect(div).toHaveTextContent(blog.author)
    expect(div).not.toHaveTextContent(blog.url)
    expect(div).not.toHaveTextContent(blog.likes)
  })

  test('shows url and likes, after the button "show" is clicked', async () => {
    const user = userEvent.setup()
    const button = screen.queryByText('show')
    await user.click(button)

    const div = container.querySelector('.blog')
    expect(div).toHaveTextContent(blog.url)
    expect(div).toHaveTextContent(blog.likes)
  })

  test('calls handleLikeBlog twice, after the button "like" is clicked twice', async () => {
    const user = userEvent.setup()
    const showButton = screen.queryByText('show')
    await user.click(showButton)
    const likeButton = screen.queryByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(handleLikeBlog.mock.calls).toHaveLength(2)
  })
})