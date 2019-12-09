const metaData = require('./metaData.js')
const _get = require('lodash/get')


module.exports = function (sheetName, key) {
  if (sheetName && key) {
    return _get(metaData, `${sheetName}.${key}`)
  } else {
    return metaData
  }
}
