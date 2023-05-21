const mongoose=require('mongoose')
require('dotenv').config();
const { mainDBConnection } = require('../config/database');
const Schema=mongoose.Schema

const smartcontractSchema=new Schema({
    name:{type:String,required:true},
    address:{type:String,required:true},
    total_supply:{type:Number,required:true},
    token_symbol:{type:String,required:true},
    price:{type:String,required:true},
    max_token_per_wallet:{type:Number,required:true},
    wallet_address:{type:String,required:true},
    recipient_address:{type:String,required:true}
    })
const SmartContract=mainDBConnection.model('smartcontract',smartcontractSchema)
module.exports={SmartContract}