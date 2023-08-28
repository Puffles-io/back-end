const mongoose=require('mongoose')
require('dotenv').config();
const Schema=mongoose.Schema

const nftSchema=new Schema({
    filename:{type:String,required:true},
    url:{type:String,required:true},
    artwork_id:{type:String,required:true},
    random_value:{required:true,type:String},
    placeholder_image:{required:true,type:String},
    title:{type:String,required:true},
    address:{type:String,required:true},
    timestamp:{type:Date,default:new Date()},
    ip:{type:String,required:true},
    
})
const usercidSchema=new Schema({
    address:{type:String,required:true},
    cid:{type:String,required:true}
})
const NFT=mongoose.model('nft',nftSchema)
const UserCid=mongoose.model('usercid',usercidSchema)
module.exports={NFT,UserCid}