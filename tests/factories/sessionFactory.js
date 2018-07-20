const Buffer = require('safe-buffer').Buffer
const KeyGrip = require('keygrip')
const keys = require('../../config/keys')
const keygrip = new KeyGrip([keys.cookieKey])

module.exports = user => {
  const sessionObj = {
    passport: {
      user: user._id.toString()
    }
  }
  const session = Buffer.from(JSON.stringify(sessionObj)).toString('base64')
  const sig = keygrip.sign(`session=${session}`)

  return { session, sig }
}
