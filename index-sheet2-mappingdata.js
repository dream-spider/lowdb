const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const object = require('lodash/fp/object');
const _get = require('lodash/get')
const _assign = require('lodash/assign')
const _countBy = require('lodash/countBy')
const _toNumber  = require('lodash/toNumber')
const _parseInt = require('lodash/parseInt')
const _chunk = require('lodash/chunk')

const _ = require('lodash')

const _slice = require('lodash/slice')
//
const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ dictionaryData: {}, calculateData: {} }).write()

let codes = [301,30101,30102,30103,30106,30107,30108,30109,30110,30111,30112,30113,30114,30199,302,30201,30202,30203,30204,30205,30206,30207,30208,30209,30211,30212,30213,30214,30215,30216,30217,30218,30224,30225,30226,30227,30228,30229,30231,30239,30240,30299,303,30301,30302,30303,30304,30305,30306,30307,30308,30309,30310,30399,307,30701,30702,30703,30704,309,30901,30902,30903,30905,30906,30907,30908,30913,30919,30921,30922,30999,310,31001,31002,31003,31005,31006,31007,31008,31009,31010,31011,31012,31013,31019,31021,31022,31099,311,31101,31199,312,31201,31203,31204,31205,31299,313,31302,31303,399,39906,39907,39908,39999]

let indexCodes = []
for(let i = 1;i<=114;i++){
    indexCodes.push(i)
}
let group = _chunk(indexCodes,26)
let t = 0
let tt = []
for(let i =0;i<group.length;i++){
    for(let j =0;j<group[i].length;j++){
        let data = j+65
        let index
        if(i==0){
            index = String.fromCharCode(data)
        }else if(i==1){
            index ='A' + String.fromCharCode(data)
        }
        else if(i==2){
            index ='B' + String.fromCharCode(data)
        }
        else if(i==3){
            index ='C' + String.fromCharCode(data)
        }
        else if(i==4){
            index ='D' + String.fromCharCode(data)
        }
        tt.push(index)
    }
}
tt = _slice(tt,8,tt.length)
let mapData = []
let i =0
tt.forEach(item=>{
    mapData.push({
        [codes[i++]]:item
    })
})

db.set('mapData',mapData).write()
