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

  create (file, target, filename, overwrite, cb) {
    if (typeof overwrite === 'function') {
      cb = overwrite
      overwrite = false
    }

    if (typeof filename === 'function') {
      cb = filename
      filename = undefined
      overwrite = false
    }

    if (typeof target === 'function') {
      cb = path
      target = undefined
      filename = undefined
      overwrite = false
    }

    let formData = {
      files: {
        value: file,
        options: {}
      }
    }

    if (target) {
      formData.folder_paths = {
        value: target,
        options: {}
      }
    }

    if (filename) {
      formData.files.options = {filename}
      formData.file_names = {
        value: filename,
        options: {}
      }
    }

    return this.client._request({
      method: 'POST',
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'multipart/form-data'
      },
      qs: { overwrite },
      path: '/filemanager/api/v2/files/',
      timeout: -1,
      formData
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
