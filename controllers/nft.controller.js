const {NFT,UserCid}=require("../models/nft.model")
const {uploaddata,updatedata}=require('../utils/utils')
const error=require('../services/errorFormater');
const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs')
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


                let filedata,placeholderdata
                if(req.body.detailed_reveal){
                    placeholderdata=await IPFS.prototype.uploadImage(req.body.placeholder_image)
                   
                }
           
                    else{
                        placeholderdata=null
                    }
                    filedata=await S3.prototype.uploadImage(req.body.file_url)
                    let nft=new NFT({title:req.body.title,address:req.user.address,ip:req.socket.remoteAddress})
                    let nftData=await nft.save()
                if((await UserCid.find({address:req.user.address})).length){
                   let usercid=await UserCid.find({address:req.user.address}) 
                   
                    let cid=await IPFS.prototype.pushtoJson(usercid[0].cid,{title:req.body.title,description:req.body.description,detailed_reveal:req.body.detailed_reveal,filename:filedata.filename,file_url:filedata.location,placeholder_file:placeholderdata,id:nftData._id})
                    UserCid.findOne({address:req.user.address}).then(async (user)=>{
                        user.cid=cid
                        await user.save()
                    })
                    res.status(200).json({status:result,id:nftData._id})
                }
                else{
                    let result= await IPFS.prototype.uploadJson({title:req.body.title,description:req.body.description,detailed_reveal:req.body.detailed_reveal,filename:filedata.filename,file_url:filedata.location,placeholder_file:placeholderdata,id:nftData._id})
                    let data=new UserCid({address:req.user.address,cid:result})
                    await data.save()
                    res.status(200).json({status:result.status,id:nftData._id})
                    
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
                res.status(200).json({status:true,url:[]})
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

