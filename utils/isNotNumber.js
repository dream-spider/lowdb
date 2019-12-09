import _toNumber from 'lodash/toNumber'
import _isNaN from 'lodash/isNaN'

export default function (value) {
  return _isNaN(_toNumber(value))
}