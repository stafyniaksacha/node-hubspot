class File {
  constructor (client) {
    this.client = client
  }

  create (data, cb) {
    return this.client._request({
      method: 'POST',
      path: '/content/api/v2/blog-posts',
      body: data
    }, cb)
  }

  update (id, data, cb) {
    if (!id || typeof (id) === 'function') {
      return cb(new Error('id parameter must be provided.'))
    }
    
    return this.client._request({
      method: 'PUT',
      path: '/content/api/v2/blog-posts/' + id,
      body: data
    }, cb)
  }

  delete (id, cb) {
    if (!id || typeof (id) === 'function') {
      return cb(new Error('id parameter must be provided.'))
    }

    return this.client._request({
      method: 'DELETE',
      path: '/content/api/v2/blog-posts/' + id
    }, cb)
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

  getById (id, cb) {
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
