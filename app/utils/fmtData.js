module.exports = function (data) {
  if (!data) return {}
  if (Array.isArray(data)) {
    return data.map(item => {
      return Object.assign({}, item)
    })
  } else {
    return Object.assign({}, data)
  }
}