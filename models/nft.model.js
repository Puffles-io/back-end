const mongoose=require('mongoose')
require('dotenv').config();
const Schema=mongoose.Schema

const nftSchema=new Schema({
    cid:{type:String,required:true},
    title:{type:String,required:true},
    address:{type:String,
    required:true},
    timestamp:{type:Date,default:new Date()},
    ip:{type:String,required:true}
})
const NFT=mongoose.model('nft',nftSchema)
module.exports={NFT}