require('dotenv').config();
const docclient=require('../config/database')
class DatabaseHelper{
    async addItem(data){
        return new Promise(async (resolve,reject)=>{
            try{
                docclient.put(data,function(err,data){
                    if(err) reject(err)
                    else resolve(data)
                })
            }catch(err){
                reject(err)
            } 
        })
    }
    async deleteItem(data){
        return new Promise(async (resolve,reject)=>{
            try{
                docclient.delete(data,function(err,data){
                    if(err) reject(err)
                    else resolve(data)
                })
            }catch(err){
                reject(err)
            }
        })
    }
    async getItem(data){
        return new Promise(async (resolve,reject)=>{
            try{
                docclient.get(data,function(err,data){
                    if(err) reject(err)
                    else resolve(data)
                })
            }catch(err){
                reject(err)
            }
        })
    }
    async getItems(data){
        return new Promise(async (resolve,reject)=>{
            try{
                docclient.query(data,function(err,data){
                    if(err) reject(err)
                    else resolve(data)
                })
            }catch(err){
                reject(err)
            }
        })
    }
    async updateItems(data){
        return new Promise(async (resolve,reject)=>{
            try{
                docclient.update(data,function(err,data){
                    if(err) reject(err)
                    else resolve(data)
                })
            }catch(err){
                reject(err)
            }
        })
    }
}
// const Schema=mongoose.Schema

// const nftSchema=new Schema({
//     cid:{type:String,required:true},
//     artwork_id:{type:String,required:true},
    
//     placeholder_filename:{required:false,type:String},
//     placeholder_fileurl:{required:false,type:String},
//     title:{type:String,required:false},
//     address:{type:String,required:true},
//     filename:{type:String,required:true},
//     timestamp:{type:Date,default:new Date()},
//     ip:{type:String,required:true},
    
// })
// const usercidSchema=new Schema({
//     address:{type:String,required:true},
//     cid:{type:String,required:true}
// })
// const NFT=mongoose.model('nft',nftSchema)
// const UserCid=mongoose.model('usercid',usercidSchema)
module.exports=DatabaseHelper