const {NFT,UserCid}=require("../models/nft.model")
const {uploaddata,updatedata}=require('../utils/utils')
const error=require('../services/errorFormater');
const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs')
const { v4: uuidv4 } = require('uuid');

exports.upload_v1=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.random)){
                res.status(200).json({status:false,message:"Missing data"})
            }
            else{
                filedata=await S3.prototype.uploadImage(req.file)
                if(await NFT.find({random_value:req.body.random}).length){
                    let nftdata=await NFT.find({random_value:req.body.random}) 
                    let nft=new NFT({title:nftdata[0].title,filename:filedata.filename,url:filedata.location,artwork_id:nftdata[0].artwork_id,address:req.user.address,random_value:req.body.random,ip:req.socket.remoteAddress})
                    await nft.save();
                    res.json(200).json({status:true,id:nftdata[0].artwork_id})
                }
                else{
                    const uuid=uuidv4()
                    let nft=new NFT({title:"",filename:filedata.filename,url:filedata.location,artwork_id:uuid,address:req.user.address,random_value:req.body.random,ip:req.socket.remoteAddress})
                    await nft.save();
                    res.status(200).json({status:true,id:uuid})
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
exports.title=async (req,res)=>{
    try{
    if(!Boolean(req.body.artwork_id)){
        res.status(200).json({status:false,message:"Missing data"})
    }
    else{
        if(await NFT.find({artwork_id:req.body.artwork_id}).length==0){
            res.status(200).json({status:false,message:"Artwork ID doesn't exist"})
        }
        else{
           let artworks= await NFT.find({random_value:req.body.artwork_id})
           artworks.forEach(async artwork=>{
            artwork.title=req.body.title
            await artwork.save()
           })
           res.status(200).json({status:true,message:"Artwork saved successfully"})
        }

    }
}catch(err){
    res.status(500).json({message:"Err"+err})
}
}
exports.placeholder_image=async (req,res)=>{
    try{
            if(!Boolean(req.body.placeholder_image)){
                res.status(200).json({status:false,message:"Missing data"})
            }
            else{
                if(await NFT.find({artwork_id:req.body.artwork_id}).length==0){
                    res.status(200).json({status:false,message:"Artwork id doesn't exist"})
                }
                else{
                    let cid=await IPFS.prototype.uploadImage(req.file)
                    let artworks=await NFT.find({artwork_id:req.body.artwork_id})
                    artworks.forEach(async artwork=>{
                        artwork.placeholder_image=cid
                        await artwork.save()
                    })
                    res.status(200).json({status:true,message:"placeholder image saved"})
                }
            }
    }catch(err){
        res.sttaus(500).json({status:false,message:"Err: "+err})
    }
}
exports.get_nfts=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            let metadata=await NFT.find({address:req.user.address})
            console.log("metadata: ",metadata)
            if(metadata.length==0){
                res.status(200).json({status:true,artwork:[]})
            }
            else{
                const transformedObject = {};

            // Iterate through the original array
            for (const item of metadata) {
            const { artwork_id, url, filename } = item;

            // If the artworkId is not a key in the transformed object, create an array with location and filename pairs
            if (!transformedObject.hasOwnProperty(artwork_id)) {
                transformedObject[artwork_id] = [{ url, filename }];
            } else {
                // If the artworkId already exists in the transformed object, push a new location and filename pair to the existing array
                transformedObject[artwork_id].push({ url, filename });
            }
            }
                res.status(200).json({status:true,artwork:transformedObject})
            }
        }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Err: "+err})
        }
    })
}

