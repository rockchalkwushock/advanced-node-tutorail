const Page = require('./helpers/page')

describe('Header Tests', () => {
  let page
  beforeEach(async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
  })

  test('should see brand logo', async () => {
    const actual = await page.getContentsOf('a.brand-logo')
    const expected = 'Blogster'
    expect(actual).toEqual(expected)
  })

  test('should start OAuth flow on click', async () => {
    await page.click('.right a')
    const actual = await page.url()
    const expected = '/accounts.google.com/'
    expect(actual).toMatch(expected)
  })

  test('should see logout button when logged in', async () => {
    await page.login()
    const actual = await page.getContentsOf('a[href="/auth/logout"]')
    const expected = 'Logout'
    expect(actual).toEqual(expected)
  })

  afterEach(async () => {
    await page.close()
  })
})
