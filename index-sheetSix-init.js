const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const object = require('lodash/fp/object');
const _get = require('lodash/get')
const _countBy = require('lodash/countBy')
const _assign = require('lodash/assign')
//
const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({dictionaryData: {}, calculateData: {}}).write()
const sheetName = 'SheetSix'
let sheetOneData = db.get('calculateData.SheetOne').filter(rowData => {
    return _get(rowData, 'extends.row') > 6
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
    return (_get(rowData, 'extends.row') >= 6) &&
        sheetOneCodes.includes(rowData.A)
})
    .map(rowData => {
        return {
            extends: {
                row: _get(rowData, 'extends.row'),
                readonly: true
            },
            A: rowData.A,
            D: rowData.D,
            J: rowData.F,
            P: rowData.G
        }
    }).value()

let sheetFourData = db.get('calculateData.SheetFour').filter(rowData => {
    return (_get(rowData, 'extends.row') >= 6) &&
        sheetOneCodes.includes(rowData.A)
})
    .map(rowData => {
        if(rowData)
        return {
            extends: {
                row: _get(rowData, 'extends.row'),
                readonly: true
            },
            A: rowData.A,
            D: rowData.D,
            N: rowData.H
        }
    }).value()
if (sheetThreeData.length > 0) {
    sheetOneData = sheetOneData.map(one => {
        for (let three of sheetThreeData) {
            if (three.A === one.A && three.D === one.D) {
                return _assign(one, three)
            }
        }
        return one
    })
}


if (sheetFourData.length > 0) {
    sheetOneData = sheetOneData.map(one => {
        for (let four of sheetFourData) {
            if (four.A === one.A && four.D === one.D) {
                return _assign(one, four)
            }
        }
        return one
    })
}
let sheetSixData = db.get(`calculateData.${sheetName}`).value()

if (sheetSixData.length > 0) {
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
    db.set(`calculateData.${sheetName}`, sheetSixData).write()
} else {
    db.set(`calculateData.${sheetName}`, sheetOneData).write()
}
return db.get(`calculateData.${sheetName}`).value() || {}
