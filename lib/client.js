const Broadcast = require('./broadcast')
const Campaign = require('./campaign')
const Company = require('./company')
const Contact = require('./contact')
const Deal = require('./deal')
const Engagement = require('./engagement')
const File = require('./file')
const List = require('./list')
const Owner = require('./owner')
const Pipeline = require('./pipeline')
const Subscription = require('./subscription')
const BlogPosts = require('./blog_posts')
const BlogAuthors = require('./blog_authors')
const _ = require('lodash')
const request = require('request-promise')
const EventEmitter = require('events').EventEmitter

const debug = require('debug')('hubspot:client')

// define how long to wait API response before throwing a timeout error
const API_TIMEOUT = 15000
// define how many requests we can do each second (10/second)
const API_SECOND_LIMIT = 100

class Client extends EventEmitter {
  constructor (options = {}) {
    super()
    this.options = _.extend({ maxUsePercent: 90 }, options)
    this.qs = {}
    if (typeof options.apiKey === 'string') {
      this.qs.hapikey = options.apiKey
    } else if (typeof options.accessToken === 'string') {
      this.qs.accessToken = this.token
    }
    this.baseUrl = this.options.baseUrl || 'http://api.hubapi.com'
    this.apiCalls = 0
    this.on('apiCall', params => {
      debug('apiCall', _.pick(params, ['method', 'url']))
      this.apiCalls += 1
    })

    this.lastRequest = 0
    this.pendingRequests = 0

    this.broadcasts = new Broadcast(this)
    this.campaigns = new Campaign(this)
    this.companies = new Company(this)
    this.contacts = new Contact(this)
    this.deals = new Deal(this)
    this.engagements = new Engagement(this)
    this.files = new File(this)
    this.lists = new List(this)
    this.owners = new Owner(this)
    this.pipelines = new Pipeline(this)
    this.subscriptions = new Subscription(this)
    this.blogPosts = new BlogPosts(this)
    this.blogAuthors = new BlogAuthors(this)
  }

  _request (opts, cb) {
    const params = _.cloneDeep(opts)
    cb = cb || function noop () {}

    params.json = true

    params.url = this.baseUrl + params.path
    delete params.path
    params.qs = _.extend({}, this.qs, params.qs)

    params.qsStringifyOptions = {
      arrayFormat: 'repeat'
    }

    // here we allow to force timeout to be unseted by passing <0 as value (eg: used by file upload)
    // if timeout isn't set, we force to default API_TIMEOUT
    if (params.timeout < 0) {
      params.timeout = undefined
    }
    else if (!params.timeout) {
      params.timeout = API_TIMEOUT
    }

    return new Promise((resolve, reject) => {
      // we wait/queue 'API_SECOND_LIMIT+1' ms between each requests here to
      // ensure that we not reach the "second limit" (10 requests/seconds)
      if (this.lastRequest > 0 && Date.now() - this.lastRequest < API_SECOND_LIMIT+1) {
        setTimeout(() => {
          this._request(opts, cb)
        }, (this.pendingRequests+1)*API_SECOND_LIMIT+1)

        this.pendingRequests++
      }
      else {
        this.lastRequest = Date.now()

        this.checkApiLimit(params)
          .then(() => {
            this.emit('apiCall', params)
            request(params)
              .then(data => {
                if (typeof data === 'string') {
                  try {
                    data = JSON.parse(data)
                  } catch (e) {
                    const err = new Error(data)
                    cb(err)
                    reject(err)

                    return;
                  }
                }

                cb(null, data)
                resolve(data)
              }).catch(err => {
                cb(err)
                reject(err)
              })
              .then(() => {
                this.pendingRequests--
              })
          })
      }
    })


  }

  checkApiLimit (params) {
    if ((/integrations\/v1\/limit/).test(params.url)) { // don't check the api limit for the api call
      return Promise.resolve()
    }
    if (this.options.maxUsePercent === 0) { // if maxUsePercent set to 0, do not check for the API limit (use at your own risk)
      return Promise.resolve()
    }
    return this.getApiLimit().then(results => {
      const { usageLimit = 40000, currentUsage = 0 } = results
      const usagePercent = 100.0 * currentUsage / usageLimit
      debug('usagePercent', usagePercent, 'apiCalls', this.apiCalls)
      if (usagePercent > this.options.maxUsePercent) {
        const err = new Error('Too close to the API limit')
        err.usageLimit = usageLimit
        err.currentUsage = currentUsage
        err.usagePercent = usagePercent
        throw err
      }
    })
  }

  getApiLimit () {
    this.limit = this.limit || {}
    const collectedAt = this.limit.collectedAt || 0
    const recencyMinutes = (Date.now() - collectedAt) / (60 * 1000)
    debug('recencyMinutes', recencyMinutes)
    if (recencyMinutes < 5) {
      return Promise.resolve(this.limit)
    }
    return this._request({
      method: 'GET',
      path: '/integrations/v1/limit/daily'
    }).then(results => {
      this.limit = results[0]
      return this.limit
    })
  }
}

module.exports = Client
