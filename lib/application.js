const http = require('http')
const EventEmitter = require('events').EventEmitter
const assert = require('assert')
const stream = require('stream')
const statues = require('statuses') // 存储常见的http状态码
const convert = require('koa-convert')
const compose = require('./helper/compose') // 处理middleware
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

  /**
   * TODO: fn可以是各种函数： generator， async， promise， 普通函数
   * @param {*} fn
   */
  use(fn) {
    this.middleware.push(convert(fn))
    return this
  }

  toJSON() {
    return only(this, ['subdomainOffset', 'proxy', 'env'])
  }
  inspect() {
    return this.toJSON()
  }

  /**
   * @description 对请求处理和加工
   * @param {Object} ctx
   * @param {Function} fn
   */
  handleRequest(ctx, fn) {
    return fn(ctx)
      .then(_ => respond(ctx))
      .catch(err => ctx.onerror(err))
  }

  callback() {
    const fn = compose(this.middleware)
    // const fn = compose(this.middleware)
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
// 处理请求状态和返回结果, 未处理head请求
function respond(ctx) {
  let tempBody

  // 不可写流
  if (!ctx.writable) return
  const { res, status, body } = ctx

  // 处理204 205 304内容为空
  if (statues.empty[status]) {
    ctx.body = null
    return res.end()
  }

  if (body === null) {
    return res.end()
  } else if (Buffer.isBuffer(body)) {
    return res.end(body)
    // body is readable stream
  } else if (body instanceof stream.Stream.Readable) {
    return body.pipe(res)
  } else if (typeof body === 'string') {
    return res.end(body)
  } else {
    tempBody = JSON.stringify(body)
    ctx.length = Buffer.byteLength(tempBody)
    return res.end(JSON.stringify(body))
  }
}

module.exports.default = Ikoa
module.exports = Ikoa
