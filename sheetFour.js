const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const object = require('lodash/fp/object');
const _get = require('lodash/get')
const _countBy = require('lodash/countBy')
const _assign = require('lodash/assign')
const getMetaData = require('./getMetaData')
const _toNumber = require('lodash/toNumber')
//
const adapter = new FileSync('db.json')
const db = low(adapter)


// Set some defaults (required if your JSON file is empty)
db.defaults({dictionaryData: {}, calculateData: {}}).write()

const sheetName = 'SheetSix'
let sheetOneData = db.get('calculateData.SheetOne').filter(rowData => {
    return _get(rowData, 'extends.row') >= getMetaData('SheetOne', 'startRowIndex')
})
    .map(rowData => {
        return {
            extends: {
                row: _get(rowData, 'extends.row'),
                readonly: true
            },
            A: rowData.A,
            D: rowData.D,
            H: rowData.F
        }
    })
    .value()

const sheetOneCodes = sheetOneData.map(rowData => rowData.A)

let sheetThreeData = db.get('calculateData.SheetThree').filter(rowData => {
    return (_get(rowData, 'extends.row') >= getMetaData('SheetThree', 'startRowIndex')) &&
        sheetOneCodes.includes(rowData.A)
})
    .map(rowData => {
        return {
            extends: {
                row: _get(rowData, 'extends.row'),
                readonly: true
            },
            A: rowData.A,
            J: rowData.F,
            P: rowData.G,
            M: rowData.H
        }
    }).value()
let sheetThreeCountData = {}

sheetThreeData.forEach(rowData => {
    if(sheetThreeCountData[rowData.A]){
        sheetThreeCountData[rowData.A].J = _toNumber(sheetThreeCountData[rowData.A].J || 0) +  _toNumber(rowData.J || 0)
        sheetThreeCountData[rowData.A].P = _toNumber(sheetThreeCountData[rowData.A].P || 0) + _toNumber(rowData.P || 0)
        sheetThreeCountData[rowData.A].M = _toNumber(sheetThreeCountData[rowData.A].M || 0) + _toNumber(rowData.M || 0)
    }else {
        sheetThreeCountData[rowData.A] = rowData
    }
})

if (sheetThreeData.length > 0) {
    sheetOneData = sheetOneData.map(one => {
        for (let code in sheetThreeCountData) {
            if (sheetThreeCountData[code].A === one.A) {
                return _assign(one, sheetThreeCountData[code])
            }
        }
        return one
    })
}


let sheetSixData = db.get(`calculateData.${sheetName}`).value()
if (sheetSixData && sheetSixData.length > 0) {
    sheetSixData = sheetSixData.map(rowData => {
        for (let oneRowData of sheetOneData) {
            if (oneRowData.A === rowData.A) {
                return _assign(rowData, oneRowData)
            }
        }
        return rowData
    }).filter(rowData => (rowData.extends.readonly === true && sheetOneCodes.includes(rowData.A)) || (rowData.extends.readonly !== true))
    let sheetSixCodes = sheetSixData.filter(rowData => _get(rowData, 'extends.readonly') === true).map(rowData => rowData.A)
    sheetSixData = sheetSixData.concat(sheetOneData.filter(rowData => !sheetSixCodes.includes(rowData.A)))
    console.log(sheetSixData)
} else {
}



