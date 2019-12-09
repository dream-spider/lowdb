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



const startRowIndex = getMetaData('SheetSeven', 'startRowIndex')

let eColumnCount = 0
let initData = db.get('calculateData.SheetSix').filter(rowData => {
    return _get(rowData, 'extends.row') >= getMetaData('SheetSix', 'startRowIndex') && _toNumber(rowData.L || 0) > 0
}).map(rowData => {
    eColumnCount += _toNumber(rowData.L || 0)
    return {
        A: rowData.A,
        D: rowData.D,
        E: rowData.L
    }
}).value()

let j05GMap = {}

db.get('calculateData.SheetFive').filter(rowData => {
    return _get(rowData, 'extends.row') >= getMetaData('SheetFive', 'startRowIndex')
}).value().forEach(rowData => {
    j05GMap[rowData.A] = rowData.G
})

const sheetSevenColumnConfig = getMetaData('SheetSeven', 'mappingData')

let countRow = {
    extends: {
        row: 6
    },
    E: eColumnCount
}

for (let columnKey in sheetSevenColumnConfig) {
    countRow[sheetSevenColumnConfig[columnKey]] = j05GMap[columnKey]
}

initData = [countRow, ...initData]
const calculateSort = ['301', '303', '302', '307', '309', '310', '311', '313', '399', '312']

const calculateRules = [
    {
        code: '2080501',
        formula: 'equals',
        value: 0,
        column: ['U', 'AU']
    },
    {
        code: '2080502',
        formula: 'equals',
        value: 0,
        column: ['U', 'AU']
    },
    {
        code: '2080504',
        formula: 'equals',
        value: 0,
        column: ['U', 'AU']
    },
    {
        code: '2210201',
        formula: 'calc',
        column: 'Q'
    },
    {
        code: '2101101',
        formula: 'calc',
        column: 'N'
    }
    ,
    {
        code: '2101102',
        formula: 'calc',
        column: 'N'
    },
    {
        code: '2101103',
        formula: 'calc',
        column: 'O'
    },
    {
        code: '2210202',
        formula: 'calc',
        column: 'H'
    },
    {
        code: '2080505',
        formula: 'calc',
        column: 'L'
    },
    {
        code: '2080505',
        formula: 'calc',
        column: 'P'
    }
    ,
    {
        code: '2080505',
        formula: 'calc',
        column: 'S'
    }
    ,
    {
        code: '2080506',
        formula: 'calc',
        column: 'M'
    },
    {
        code: '2080506',
        formula: 'calc',
        column: 'P'
    },
    {
        code: '2080506',
        formula: 'calc',
        column: 'S'
    },
    {
        code: '21012',
        formula: 'startWithCalc',
        column: ['N', 'P', 'S']
    },
    {
        code: '203',
        formula: 'startWith',
        except: '2030603',
        code: '21012',
        column: ['G', 'R', 'AW', 'AX'],
        value: '0'
    }
]
// 设定固定编码固定列的值
calculateRules.filter(rowData => rowData.formula === 'equals').forEach(rule => {
    initData.forEach(targetData => {
        if (targetData.A && targetData.A === rule.code) {
            for (let column of rule.column) {
                targetData[column] = rule.value
            }
        }
    })
})


// 设置固定编码开头的列为固定值
calculateRules.filter(rowData => rowData.formula === 'startWith').forEach(rule => {
    initData.filter(targetData => targetData.A && targetData.A.startsWith(rule.code)).forEach(targetData => {
        if (targetData.A !== rule.except) {
            for (let column of rule.column) {
                targetData[column] = rule.value
            }
        }
    })
})


calculateRules.filter(rowData => rowData.formula === 'calc').forEach(rule => {
    let calcData = initData.filter(targetData => targetData.A && targetData.A === rule.code)
    calculate(calcData, rule.column)
})

calculateRules.filter(rowData => rowData.formula === 'startWithCalc').forEach(rule => {
    initData.filter(targetData => targetData.A && targetData.A.startsWith(rule.code)).forEach(targetData => {
        for (let column of rule.column) {
            calculate(targetData, column)
        }
    })
})

let calcColumnSort = []

for (let bigCode of calculateSort) {
    for (let col in sheetSevenColumnConfig) {
        if (col.length === 5 && col.startsWith(bigCode)) {
            calcColumnSort.push(col)
        }
    }
}

let initDataSize = initData.length
if (initDataSize == 1) {
    return
}
// 按照大类排序，先纵后横计算
calcColumnSort.forEach(column => {
    for (let index = 1; index < initData; index++) {
        calculate(initData[index][column])
    }
})

// countSheet('SheetSeven')


function calculate(targetData, column) {
    if (targetData.length === 0 || targetData[column]) {
        console.log('nothing to calc')
        return
    }
    let startColumnValue = initData.filter(rowData => _get(rowData, 'extends.row') === startRowIndex - 1)
    if (startColumnValue.length === 1) {
        startColumnValue = _toNumber(startColumnValue[0][column] || 0)
    }
    let startRowValue = _toNumber(targetData.E || 0)
    // 计算当前行合计
    let rowSum = 0
    for (let col in sheetSevenColumnConfig) {
        if (sheetSevenColumnConfig[col].length === 5) {
            rowSum += _toNumber(targetData[col] || 0)
        }

    }
    // 计算当前列合计
    let colSum = 0
    initData.filter(rowData => _get(rowData, 'extends.row') >= startRowIndex).forEach(rowData => {
        column += _toNumber(rowData[column] || 0)
    })
    let xRs = startRowValue - rowSum
    let yrs = startColumnValue - colSum
    // 此处加上保留两位有效数字
    targetData[column] = xRs > yrs ? yrs : xRs
}









