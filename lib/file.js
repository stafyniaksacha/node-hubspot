class File {
  constructor (client) {
    this.client = client
  }

  get (cb) {
    return this.client._request({
      method: 'GET',
      path: '/filemanager/api/v2/files'
    }, cb)
  }

  create (data, override, cb) {
    if (typeof override === 'function') {
      cb = override
      override = false
    }
    return this.client._request({
      method: 'POST',
      path: '/filemanager/api/v2/files?override=' + override,
      formData: data
    }, cb)
  }

  getOne (id, cb) {
    if (!id || typeof (id) === 'function') {
      return cb(new Error('id parameter must be provided.'))
    }

    return this.client._request({
      method: 'GET',
      path: '/filemanager/api/v2/files/' + id
    }, cb)
  }
}

module.exports = File
