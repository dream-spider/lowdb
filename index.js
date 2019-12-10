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
// const adapter = new FileSync('C:\\Users\\jiaoqx\\AppData\\Roaming\\electron-vue-test\\data1.json')
const db = low(adapter)


// Set some defaults (required if your JSON file is empty)
db.defaults({calculateData: {}}).write()



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
let rowIndex = startRowIndex-1
initData = initData.map(rowData =>{
    return {
        ...rowData,
        ...{
            extends: {
                row: rowIndex++
            }
        }
    }
})
const calculateSort = ['301', '303', '302', '307', '309', '310', '311', '313', '399', '312']

const calculateRules = getMetaData('SheetSeven', 'calculateRules')
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
    // console.log(rule)
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
    if(calcData.length===1) {
        calculate(calcData[0], rule.column)
    }
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
    for (let index = 1; index < initData.length; index++) {
        calculate(initData[index], sheetSevenColumnConfig[column])
    }
})

// countSheet('SheetSeven')
const sheetName = 'SheetSeven'
db.set(`calculateData.${sheetName}`,initData).write()
function calculate(targetData, column) {
    if (targetData[column] !== undefined) {
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
        if (col.length === 5) {
            rowSum += _toNumber(targetData[sheetSevenColumnConfig[col]] || 0)
        }
    }
    // 计算当前列合计
    let colSum = 0
    initData.filter(rowData => _get(rowData, 'extends.row') >= startRowIndex).forEach(rowData => {
        colSum += _toNumber(rowData[column] || 0)
    })
    let xRs = startRowValue - rowSum
    let yrs = startColumnValue - colSum
    // 此处加上保留两位有效数字
    targetData[column] = (xRs > yrs ? yrs : xRs)
    if(column ==='DD' && targetData.extends.row === 7){
        console.log(startRowValue)
        console.log(startColumnValue)
        console.log(rowSum)
        console.log(colSum)
        console.log(xRs > yrs ? yrs : xRs)
    }
}









