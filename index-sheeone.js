const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const object = require('lodash/fp/object');
const _get = require('lodash/get')
//
const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ dictionaryData: {}, calculateData: {} }).write()

function updateCell(sheetName, colNumber, rowNumber, axis, oldValue, newValue) {
    console.log(sheetName, colNumber, rowNumber, axis, oldValue, newValue)
    if (newValue) {
        const path = `calculateData.${sheetName}.R_${rowNumber}`
        const originalData = db.get(path).value()
        db.set(path, {
            ...originalData,
            row: rowNumber,
            [colNumber]: newValue
        }).write()

        calculate(sheetName,colNumber,rowNumber,oldValue,newValue)

        return db.get(`calculateData.${sheetName}`).value()
    }
}

function calculate(sheetName,colNumber,rowNumber,oldValue,newValue){
    switch (sheetName) {
        case 'SheetOne':
            calculateSheetOne(colNumber,rowNumber,oldValue,newValue);
            break;
    }
}

function calculateSheetOne(colNumber,rowNumber,oldValue,newValue){
    // 行合计：F-L
    const path = `calculateData.SheetOne.R_${rowNumber}`
    const originalData = db.get(path).value()
    console.log(originalData)
    let rowSumKey =object.keys(originalData).filter(e=>{return e!=='A'&&e!=='D'&&e!=='row'});
    let rowSum = 0
    for(let rsk of rowSumKey){
        rowSum = rowSum+_get(originalData[rsk],0)
    }

    updateCell('SheetOne','E',rowNumber,`E${rowNumber}`,'0',rowSum)
    // originalData["F"]
    // 列合计：rowNumber
}

// updateCell('SheetOne','F','7','F7','43','50')

let sheetReference = db.get('calculateData.SheetOne')
let sumTotal = []
//计算每行合计
sheetReference.value().forEach(data=>{
    let rowSum = 0.00
    for (let col in data){
        if(col!=='A'&&col!=='D'&&col!=='E'&&col!=='row'){
            rowSum = rowSum + parseFloat(data[col])
        }
    }
    // update每行合计
    console.log(rowSum)
    sumTotal.push(rowSum)
    updateCell('SheetOne','E',data.row,`E${data.row}`,0,rowSum)
})


// 计算每列合计
let colSumMap = {}
sheetReference.filter((item)=>{
    return item.row>6
}).value().forEach(item=>{
    for(let col in item){
        if(col!=='A'&&col!=='D'&&col!=='E'&&col!=='row'){
            if(colSumMap[col]){
                colSumMap[col].push(item[col])
            }else{
                colSumMap[col] = [item[col]]
            }
        }
    }

})

for(let key in colSumMap){
    updateCell('SheetOne',key,6,`${key}6`,0,colSumMap[key].reduce((a,c)=>{
        return parseFloat(a)+parseFloat(c)
    }))
}

// 计算总合计
updateCell('SheetOne','E',6,`E6`,0,sumTotal.reduce((a,c)=>{
    return parseFloat(a)+parseFloat(c)
}))
/*let F6 = db.get('calculateData.SheetOne').filter((item)=>{
    return item.row>6
}).map(item=>{
    return item['F']
}).reduce((a,c)=>{return parseFloat(a)+parseFloat(c) }).value()
console.log('---------F6----------')
    console.log( F6)


// update E6 总合计

let E6 = db.get('calculateData.SheetOne').filter((item)=>{
    return item.row>6
}).map(item=>{
    return item['E']
}).reduce((a,c)=>{return parseFloat(a)+parseFloat(c) }).value()

console.log('---------E6----------')
console.log( E6)*/
