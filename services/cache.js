// Native
const { promisify } = require('util')
// Module
const mongoose = require('mongoose')
const redis = require('redis')

// Setup Redis
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)

// Promisify .hget()
client.hget = promisify(client.hget)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true
  this.hashKey = JSON.stringify(options.key || '')
  // Returning "this" makes method chainable.
  return this
}

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    // If not caching use original "exec" method.
    return exec.apply(this, arguments)
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  })

  const cacheValue = await client.hget(this.hashKey, key)

  if (cacheValue) {
    // Must return a Mongoose Document
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }
  // This is a Mongoose Document
  const result = await exec.apply(this, arguments)
  // Stringify for redis.
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10)
  return result
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}
