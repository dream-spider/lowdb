const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const object = require('lodash/fp/object');
const _get = require('lodash/get')
const _assign = require('lodash/assign')
//
const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ dictionaryData: {}, calculateData: {} }).write()

let sheetOneRefData = db.get('calculateData.SheetOne')
    .filter(rowData => {
        return _get(rowData, 'extends.row') >= 7
    })
    .map(rowData => {
        return {
            extends: {
                row: _get(rowData, 'extends.row'),
                readonly: true,
            },
            A: rowData.A,
            D: rowData.D,
            I: rowData.E
        }
    })
    .value()

const sheetTowRefData = db.get('calculateData.SheetTwo').value()

let a = [{A:1,D:'t1',readonly:true},{A:10,D:'t10',readonly:true}]
let b = [{A:1,D:'t11',F:'t1f',readonly:true},{A:2,D:'t22',F:'t2f',readonly:true},{A:3,D:'t33'}]
const codes = a.map(aitem=>{
    return aitem.A
})
b = b.map(bitem=>{
    for(let aitem of a){
        if(aitem.A  === bitem.A){
            bitem = _assign(bitem,aitem)
            break
        }
    }
    return bitem
})

const bcodes = b.map(bitem=>{
    return bitem.A
})
b = b.filter(bitem=>{
    return (bitem.readonly ===true && codes.includes(bitem.A))|| bitem.readonly !== true
}).concat(a.filter(aitem=>{
    return !bcodes.includes(aitem.A)
}))


console.log(b)
// db.set('calculateData.SheetTwo',sheetOneRefData).write()
