const Page = require('./helpers/page')

let page
beforeEach(async () => {
  page = await Page.build()
  await page.goto('localhost:3000')
})

afterEach(async () => {
  await page.close()
})

describe('When Logged In', () => {
  beforeEach(async () => {
    await page.login()
    await page.click('a.btn-floating')
  })
  test('should see blog create form', async () => {
    const actual = await page.getContentsOf('form label')
    const expected = 'Blog Title'
    expect(actual).toEqual(expected)
  })
  describe('And using valid inputs', () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title')
      await page.type('.content input', 'My Content')
      await page.click('form button')
    })
    test('should take to review screen', async () => {
      const actual = await page.getContentsOf('h5')
      const expected = 'Please confirm your entries'
      expect(actual).toEqual(expected)
    })
    test('should take to submit screen', async () => {
      await page.click('button.green')
      await page.waitFor('.card')
      const actualTitle = await page.getContentsOf('.card-title')
      const actualContent = await page.getContentsOf('p')
      const expectedContent = 'My Content'
      const expectedTitle = 'My Title'
      expect(actualContent).toEqual(expectedContent)
      expect(actualTitle).toEqual(expectedTitle)
    })
  })
  describe('And using invalid inputs', () => {
    beforeEach(async () => {
      await page.click('form button')
    })
    test('should show error message', async () => {
      const actualTitle = await page.getContentsOf('.title .red-text')
      const actualContent = await page.getContentsOf('.content .red-text')
      const expected = 'You must provide a value'
      expect(actualContent).toEqual(expected)
      expect(actualTitle).toEqual(expected)
    })
  })
})

describe('When Logged Out', () => {
  // test('should not be able to create blog post', async () => {
  //   const actual = await page.post('/api/blogs', {
  //     title: 'My Title',
  //     content: 'My Content'
  //   })
  //   const expected = { error: 'You must log in!' }
  //   expect(actual).toEqual(expected)
  // })
  // test('should not be able to get list of posts', async () => {
  //   const actual = await page.get('/api/blogs')
  //   const expected = { error: 'You must log in!' }
  //   expect(actual).toEqual(expected)
  // })
  test('should prohibit all blog related actions', async () => {
    const actions = [
      {
        method: 'get',
        path: '/api/blogs'
      },
      {
        method: 'post',
        path: '/api/blogs',
        data: {
          title: 'My Title',
          content: 'My Content'
        }
      }
    ]
    const results = await page.execRequests(actions)
    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' })
    }
  })
})
