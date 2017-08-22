class File {
  constructor (client) {
    this.client = client
  }

  get (options, cb) {
    if (typeof options === 'function') {
      cb = options
      options = {}
    }

    return this.client._request({
      method: 'GET',
      path: '/content/api/v2/blog-posts',
      qs: options
    }, cb)
  }

  getAll (options, cb) {
    return this.get(cb)
  }

  getOne (id, cb) {
    if (!id || typeof (id) === 'function') {
      return cb(new Error('id parameter must be provided.'))
    }

    return this.client._request({
      method: 'GET',
      path: '/content/api/v2/blog-posts/' + id
    }, cb)
  }
}

module.exports = File
