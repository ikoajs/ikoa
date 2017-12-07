/**
 *
 * @param {Object} proto
 * @param {String} target
 */
function Delegates(proto, target) {
  if (this.constructor !== Delegates) {
    return new Delegates(proto, target)
  }

  this.proto = proto
  this.target = target
  this.methods = []
  this.getters = []
  this.setters = []
}

Delegates.prototype = {
  constructor: Delegates,
  getter(name) {
    const target = this.target

    // use defineProperty instead of __defineGetter__
    Object.defineProperty(this.proto, name, {
      get() {
        return this[target][name]
      },
      configurable: true
    })

    this.getters.push(name)

    return this
  },
  setter(name) {
    const target = this.target

    // use defineProperty instead of __defineSetter__
    Object.defineProperty(this.proto, name, {
      get() {
        return target[name]
      },
      set(v) {
        this[target][name] = v
      },
      configurable: true
    })

    this.setters.push(name)

    return this
  },
  access(name) {
    this.getter(name).setter(name)
    return this
  },
  method(name) {
    const target = this.target
    this.methods.push(name)
    this.proto[name] = function() {
      return this[target][name].apply(this[target], arguments)
    }
    return this
  },
  _print(type) {
    const types = ['methods', 'getters', 'setters']
    if (!~~types.indexOf(type)) {
      console.log(JSON.stringify(this[type], null, 2))
    }
    return this
  }
}

module.exports = Delegates
