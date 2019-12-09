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

/*功能：
1、此表为中间表，无需展现，只需将数据保留，参与后续导出表计算；
规则：
1、科目编码、名称读取J06表中L列>0的科目；
2、标橙色的为固定取数：通过科目匹配将J06表中L列填入J07表中E列，从J07表F列开始所有合计值取J05中G列（用J07横向科目与J05中纵向科目匹配）；
3、计算
3.1、J07表横向大类增加匹配顺序：301、303、302、307、309、310、311、313、399；
3.2、计算原则：在做完特殊规则匹配之后，根据J02中指定的科目排序（剔除已匹配的代码）和J07中大类的排序，按照先纵后横，先用纵向合计与横向合计对比，取较小值；再用剩余纵向合计与横向合计对比，继续取较小值，依次计算，直至纵向合计数据用完；再用此规则计算剩余列；
特殊规则：
1)若科目代码出现2210201，优先填入“代码2210201”所在的Q列；（将行列合计中较小值直接填入，下同）2210201 Q
2)若科目代码出现2101101，优先填入“代码2101101”所在的N列；
3)若科目代码出现2101102，优先填入“代码2101102”所在的N列（可以先匹配2101101，再匹配2101102）；
3)若科目代码出现2101103，优先填入“代码2101103”所在的O列；
4)若科目代码出现2210202，优先填入“代码2210202”所在的H列；
5)若科目代码出现2080501,2080502,2080504，则科目代码所在的U列~AU列都为0；
6)若科目代码以203开头（除2030603）,则科目代码所在的G列~R列、以及AW列、AX列都为0；
7)若科目代码出现2080505，优先填入对应的L列，再到P列，再到S列;
8)若科目代码出现2080506，优先M列，依次P列，S列
9)若科目代码以21012开头，优先N列，依次P列，S列
4、所有列计算完成后，需保证：
G9=G10+G11+G12+…
E10=G10+H10+I10+…
横向数值相加等于E列合计，纵向相加等于G、H…列合计*/
const startRowIndex = 7

let eColumnCount = 0
let initData = db.get('calculateData.SheetSix').filter(rowData => {
    return _get(rowData, 'extends.row') >= getMetaData('SheetSix', 'startRowIndex') && _toNumber(rowData.L || 0) >0
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

const sheetFiveColumnConfig = getMetaData('SheetFive', 'mappingData')

let countRow = {
    extends:{
        row: 6
    },
    E: eColumnCount
}
for(let columnKey in sheetFiveColumnConfig){
    countRow[sheetFiveColumnConfig[columnKey]] = j05GMap[columnKey]
}

initData = [countRow, ...initData]

console.log(initData)

/*
2080501 AU 0
2080502 AU 0
2080504 AU 0
203>2030603 G R AW AX 0
2210201 Q
2101101 N
2101102 N
2101103 O
2210202 H
2080505 L
2080505 P
2080505 S
2080506 M
2080506 P
2080506 S

startwith 21012 N
startwith 21012 P
startwith 21012 S

301、303、302、307、309、310、311、313、399*/




