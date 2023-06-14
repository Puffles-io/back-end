const {NFT}=require("../models/nft.model")
const {uploadImage,uploadJSON}=require('../utils/utils')
const error=require('../services/errorFormater');
exports.upload_v1=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.title||req.body.description||req.body.file_url||req.body.placeholder_image)){
                res.status(200).json({status:false,message:"Missing data"})
            }
            else if(req.body.detailed_reveal===undefined){
                res.status(200).json({status:false,message:"Detailed reveal is not defined"})
            }
            else{
                let {cid,filename}= await uploadImage(req.body.file_url);
                let metadata={title:req.body.title,description:req.body.description,cid:cid,detailed_reveal:req.body.detailed_reveal,filename:filename}
                let metadata_url=await uploadJSON(metadata)
                let nft=new NFT({cid:metadata_url,address:req.user.address,ip:req.connection.remoteAddress})
                await nft.save()
                res.status(200).json({status:true,message:"NFT saved successfully"})
            }
        }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}
exports.get_nfts=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            let metadata=await NFT.find({address:req.user.address})
            if(metadata.length==0){
                res.status(200).json({status:true,cids:[]})
            }
            else{
                let cids=[]
                for(let ids of metadata){
                    cids.push(ids.cid)
                }
                res.status(200).json({status:true,cids:cids})
            }
        }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Err: "+err})
        }
    })
}