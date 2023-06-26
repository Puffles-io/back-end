const {NFT,UserCid}=require("../models/nft.model")
const {uploaddata,updatedata}=require('../utils/utils')
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
                if((await UserCid.find({address:req.user.address})).length){
                    let nft=new NFT({title:req.body.title,address:req.user.address,ip:req.socket.remoteAddress})
                    let nftData=await nft.save()
                    let result=await updatedata(req.user.address,{title:req.body.title,description:req.body.description,detailed_reveal:req.body.detailed_reveal,base64string:req.body.file_url,id:nftData._id})
                    res.status(200).json({status:result,message:"NFT saved successfully"})
                    
                }
                else{
                    let nft=new NFT({title:req.body.title,address:req.user.address,ip:req.socket.remoteAddress})
                    let nftData=await nft.save()    
                    let result= await uploaddata(req.user.address,{title:req.body.title,description:req.body.description,detailed_reveal:req.body.detailed_reveal,base64string:req.body.file_url,id:nftData._id})
                    
                    let data=new UserCid({address:req.user.address,url:url})
                    await data.save()
                    res.status(200).json({status:result,message:"NFT saved successfully"})
                    
                }
                // let {cid,filename}= await uploadImage(req.body.file_url);
                // let metadata={title:req.body.title,description:req.body.description,cid:cid,detailed_reveal:req.body.detailed_reveal,filename:filename}
                // let metadata_url=await uploadJSON(metadata)
                // let nft=new NFT({cid:metadata_url,address:req.user.address,ip:req.connection.remoteAddress,title:req.body.title})
                // await nft.save()
                // res.status(200).json({status:true,message:"NFT saved successfully"})
            }
        }
        catch(err){
            console.log("error: ",err)
            error(err,req);
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}
exports.get_nfts=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            let metadata=await UserCid.find({address:req.user.address})
            console.log("metadata: ",metadata)
            if(metadata.length==0){
                res.status(200).json({status:true,url:false})
            }
            else{
                res.status(200).json({status:true,url:metadata[0].url})
            }
        }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Err: "+err})
        }
    })
}
exports.update_nft=async (req,res)=>{
    return new ProcessingInstruction(async function(resolve,reject){
        try{

        }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Err"+err})
        }
    })
}