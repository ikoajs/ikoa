module.exports = function isJson(v) {
  if (!v) return false
  if (typeof v === 'string') return false
  if (typeof v.pipe === 'function') return false
  return true
}
