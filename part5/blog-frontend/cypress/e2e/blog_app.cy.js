const user = {
  name: 'Xiwen Teoh',
  username: 'gyataro',
  password: 'password'
}

const blog = {
  title: 'Cypress test blog',
  author: 'Cypress author',
  url: 'www.crypress.com'
}

describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    cy.visit('http://localhost:3000')
    cy.request('POST', 'http://localhost:3003/api/users/', user)
  })

  it('login form is shown', function() {
    cy.get('#username').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('#login-button').should('be.visible')
  })

  describe('login', function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type(user.username)
      cy.get('#password').type(user.password)
      cy.get('#login-button').click()

      cy.contains(`${user.name} logged-in`)
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type(user.username)
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.clock()
      cy.get('.message')
        .should('contain', 'invalid username or password')
        .and('have.css', 'color', 'rgb(186, 57, 57)')

      cy.get('html').should('not.contain', `${user.name} logged-in`)
    })
  })

  describe('when logged in', function() {
    beforeEach(function() {
      cy.login({ username: user.username, password: user.password })
    })

    it('a blog can be created', function() {
      cy.contains('create new blog').click()
      cy.get('#title').type(blog.title)
      cy.get('#author').type(blog.author)
      cy.get('#url').type(blog.url)
      cy.get('#create-blog-button').click()

      cy.get('.blog').last()
        .should('contain', `${blog.title} by ${blog.author}`)
    })

    describe('and some blogs exist', function() {
      beforeEach(function() {
        cy.createBlog({ title: `${blog.title} one` , author: blog.author, url: blog.url })
        cy.createBlog({ title: `${blog.title} two` , author: blog.author, url: blog.url })
        cy.createBlog({ title: `${blog.title} three` , author: blog.author, url: blog.url })
      })

      it('they can be liked', function() {
        cy.contains(`${blog.title} one`).as('target')
        cy.get('@target').contains('show').click()
        cy.get('@target').contains('like').click()
        cy.get('@target').should('contain', 'Likes: 1')
      })

      it('they can be deleted by their creator', function() {
        cy.on('window:confirm', () => true)
        cy.contains(`${blog.title} two`).as('target')
        cy.get('@target').contains('show').click()
        cy.get('@target').contains('remove').click()
        cy.get('@target').should('not.exist')
      })

      it('they cannot be deleted by another user', function() {
        const anotherUser = {
          name: 'John Doe',
          username: 'jdoe',
          password: 'password'
        }
        cy.request('POST', 'http://localhost:3003/api/users/', anotherUser)
        cy.login({ username: anotherUser.username, password: anotherUser.password })
        cy.on('window:confirm', () => true)
        cy.contains(`${blog.title} two`).as('target')
        cy.get('@target').contains('show').click()
        cy.get('@target').contains('remove').click()

        cy.clock()
        cy.get('.message')
          .should('contain', 'permission denied')
          .and('have.css', 'color', 'rgb(186, 57, 57)')

        cy.get('@target').should('exist')
      })

      it('they are sorted by descending order of likes', function() {
        cy.intercept('http://localhost:3000/api/blogs/*').as('likeBlog')

        cy.get('.blog').eq(0).contains('show').click()
        cy.get('.blog').eq(1).contains('show').click()
        cy.get('.blog').eq(2).contains('show').click()

        cy.get('.blog').eq(2).contains('like').click()

        cy.wait('@likeBlog').then(() => {
          cy.get('.blog').eq(0).should('contain', `${blog.title} three`)
          cy.get('.blog').eq(1).should('contain', `${blog.title} one`)
          cy.get('.blog').eq(2).should('contain', `${blog.title} two`)
        })
      })
    })
  })
})