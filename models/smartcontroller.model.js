const mongoose=require('mongoose')
require('dotenv').config();
const Schema=mongoose.Schema

const smartcontractSchema=new Schema({
    name: {type:String,required:true},
    token_symbol: {type:String,required:true},
    total_supply: {type:Number,required:true},
    price: {type:Number,required:true},
    max_token_per_wallet: {type:Number,required:true},
    wallet_address: {type:String,required:true},
    recipient_address: {type:String,required:true},
    artwork_id:{type:String,required:true},
    timestamp:{type:Date,default:new Date()},
    ip:{type:String,required:true}
    })
const SmartContract=mongoose.model('smartcontract',smartcontractSchema)
module.exports={SmartContract}