var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let total = 0
  blogs.forEach(blog => {
    if(blog.likes) total += blog.likes
  })

  return total
}

const favoriteBlog = (blogs) => {
  if(!blogs || blogs.length <= 0) return {}

  let favorite = blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog);
  return _.pick(favorite, ['title', 'author', 'likes'])
}

const mostBlogs = (blogs) => {
  if(!blogs || blogs.length <= 0) return {}

  return _(blogs)
    .countBy("author")
    .map(function(count, author) { return { author: author, blogs: count }})
    .maxBy('blogs')
}

const mostLikes = (blogs) => {
  let favorite = favoriteBlog(blogs)
  return _.pick(favorite, ['author', 'likes'])
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}