const http = require('http')
const EventEmitter = require('events').EventEmitter
const assert = require('assert')
const accepts = require('accepts') // 将原生request对象转换成一个简单的对象
const Cookies = require('cookies') // 处理http(s) cookie
const context = require('./context')
const request = require('./request')
const response = require('./response')

// only返回要处理的字段
const only = require('only')

class Ikoa extends EventEmitter {
  constructor(opts = {
    slient: false
  }) {
    super()

    if (this.constructor !== Ikoa) {
      return new Ikoa()
    }
    this.subdomainOffset = 2
    this.proxy = false
    this.slient = opts.slient
    this.env = process.env.NODE_ENV || 'development'
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
    this.middleware = []
  }

  /**
   * 将app, req, res, ctx, response相互关联，方便之间调用
   * @param {*} req
   * @param {*} res
   */
  createContext(req, res) {
    const context = Object.create(this.context)
    const request = context.request = Object.create(this.request)
    const response = context.response = Object.create(this.response)
    context.app = request.app = response.app = this
    context.req = request.req = response.req = req
    context.res = request.res = response.res = res
    request.ctx = response.ctx = context
    request.response = response
    response.request = request
    context.originalUrl = request.originalUrl = req.url
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    })
    request.ip = request.ips[0] || req.socket.remoteAddress || ''
    context.accept = request.accept = accepts(req)
    context.state = {}
    return context
  }

  createRequest() {

  }

  createResponse() {

  }
  /**
   * TODO: fn可以是各种函数： generator， async， promise， 普通函数
   * @param {*} fn
   */
  use(fn) {
    this.middleware.push(fn)
    return this
  }

  toJSON() {
    return only(this, ['subdomainOffset', 'proxy', 'env'])
  }
  inspect() {
    return this.toJSON()
  }
  /**
   * 处理中间件
   * @param {*} middleware
   */
  compose(middleware) {

  }
  /**
   * 对请求处理和加工
   * @param {*} ctx
   * @param {*} fn
   */
  handleRequest(ctx, fn) {

  }

  callback() {
    const fn = this.compose(this.middleware)
    // 订阅错误， 处理callback中的异常信息
    if (this.listeners('error').length === 0) {
      this.on('error', this.onerror)
    }
    const handleCallback = (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx, fn)
    }
    return handleCallback
  }
  /**
   * 统一处理错误
   * @param {*} err
   */
  onerror(err) {
    assert(err instanceof Error, `non-error thrown:${err}`)

    if (this.slient) return

    const msg = err.stack || err.toString()
    console.error()
    console.error(msg.replace(/^/gm, '  '))
    console.error()
  }

  listen(...args) {
    return http.createServer(this.callback()).listen(...args)
  }
}

module.exports.default = Ikoa
module.exports = Ikoa
