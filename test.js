const _remove  = require('lodash/remove')
let a = [{row :6 }]

_remove(a, row => row.row ==5 )
console.log(a)
