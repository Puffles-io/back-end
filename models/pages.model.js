const mongoose=require('mongoose')
require('dotenv').config();
const Schema=mongoose.Schema

const pagesSchema=new Schema({
    artwork_id:{type:String,required:true},
    Url_string:{type:String,required:true},
    theme: {type:String,enum:['classic','modern'],required:true},
    bg_image:{type:String,required:true},
    timestamp:{type:Date,default:new Date()},
    ip:{type:String,required:true}
    })
const Pages=mongoose.model('pages',pagesSchema)
module.exports={Pages}