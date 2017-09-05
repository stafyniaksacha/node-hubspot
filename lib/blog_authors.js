class File {
  constructor (client) {
    this.client = client
  }

  create (data, cb) {
    return this.client._request({
      method: 'POST',
      path: '/blogs/v3/blog-authors',
      body: data
    }, cb)
  }

  update (id, data, cb) {
    if (!id || typeof (id) === 'function') {
      return cb(new Error('id parameter must be provided.'))
    }

    return this.client._request({
      method: 'PUT',
      path: '/blogs/v3/blog-authors/' + id,
      body: data
    }, cb)
  }

  delete (id, cb) {
    if (!id || typeof (id) === 'function') {
      return cb(new Error('id parameter must be provided.'))
    }

    return this.client._request({
      method: 'DELETE',
      path: '/blogs/v3/blog-authors/' + id
    }, cb)
  }

  get (options, cb) {
    if (typeof options === 'function') {
      cb = options
      options = {}
    }

    return this.client._request({
      method: 'GET',
      path: '/blogs/v3/blog-authors',
      qs: options
    }, cb)
  }

  getAll (options, cb) {
    return this.get(cb)
  }

  getById (id, cb) {
    if (!id || typeof (id) === 'function') {
      return cb(new Error('id parameter must be provided.'))
    }

    return this.client._request({
      method: 'GET',
      path: '/blogs/v3/blog-authors/' + id
    }, cb)
  }
}

module.exports = File
