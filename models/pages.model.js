const mongoose=require('mongoose')
require('dotenv').config();
const Schema=mongoose.Schema

const pagesSchema=new Schema({
    address:{type:String,required:true},
    sale_date:{type:String,required:true},
    supply:{type:Number,required:true},
    limit_per_wallet:{type:Number,required:true},
    price:{type:Number,required:true},
    
    })
const Pages=mongoose.model('pages',pagesSchema)
module.exports={Pages}