const mongoose=require('mongoose')
require('dotenv').config();
const { mainDBConnection } = require('../config/database');
const Schema=mongoose.Schema

const nftSchema=new Schema({
    file_url:{type:String,required:true},
    title:{type:String,
    required:true},
   
    description:{type:String,required:true},
    detailed_reveal:{type:Boolean,required:true},
    placeholder_image:{type:String,required:true}
})
const NFT=mainDBConnection.model('nft',nftSchema)
module.exports={NFT}