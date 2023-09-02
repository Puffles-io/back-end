const mongoose=require('mongoose')
require('dotenv').config();
const Schema=mongoose.Schema

const nftSchema=new Schema({
    cid:{type:String,required:true},
    artwork_id:{type:String,required:true},
    
    placeholder_filename:{required:false,type:String},
    placeholder_fileurl:{required:false,type:String},
    title:{type:String,required:false},
    address:{type:String,required:true},
    filename:{type:String,required:true},
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