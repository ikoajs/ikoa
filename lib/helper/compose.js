/**
* @description 处理中间件
* @param {*} middleware
*/
module.exports = function compose(middleware) {
  return function (ctx,next) {
    let index = -1
    return dispatch(0)
    function dispatch(i) {
      const len = middleware.length
      let fn = middleware[i]
      if (index >= i) throw new Error('next is called more times')
      if (typeof fn != 'function') return Promise.resolve()
      index = i
      if (len === index) fn = next
      try {
        return Promise.resolve(fn(ctx,() => {
          return dispatch(i + 1)
        }))
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
}
