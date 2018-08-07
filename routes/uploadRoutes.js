const AWS = require('aws-sdk')
const { v1 } = require('uuid')

const keys = require('../config/keys')
const requireLogin = require('../middlewares/requireLogin')

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
})

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${v1()}.jpeg`
    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'codys-blog-bucket',
        ContentType: 'image/jpeg',
        Key: key
      },
      (err, url) =>
        res.send({
          key,
          url
        })
    )
  })
}
