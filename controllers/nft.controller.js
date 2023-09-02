const {NFT,UserCid}=require("../models/nft.model")
const {writeFile}=require('../utils/utils')
const error=require('../services/errorFormater');
const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs')
const fs=require('fs')

exports.upload_v1=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.random)){
                res.status(200).json({status:false,message:"Missing data"})
            }
            else{
                writeFile(req.file,req.body.random)
                res.status(200).json({status:true,id:req.body.random})
                
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
exports.uploadtoIPFS=async (req,res)=>{
    try{
        if(!Boolean(req.body.id)){
            res.status(200).json({status:false,message:"Missing artwork id"})
        }
        else{
            if(fs.existsSync(`${__dirname}/files/${req.body.id}`)){
                let files=await IPFS.prototype.uploadFiles(req.body.id)
                let data=await NFT.find({artwork_id:req.body.random})
                if(data.length){
                    files.files.forEach(async file=>{
                        let nft=new NFT({title:data[0].title,placeholder_filename:data[0].placeholder_filename,placeholder_fileurl:data[0].placeholder_fileurl,filename:file,cid:files.cid,artwork_id:req.body.random,address:req.user.address,ip:req.socket.remoteAddress})
                        await nft.save();   
                        })    
                }
                else{
                    files.files.forEach(async file=>{
                        let nft=new NFT({title:"",placeholder_filename:"",placeholder_fileurl:"",filename:file,cid:files.cid,artwork_id:req.body.random,address:req.user.address,ip:req.socket.remoteAddress})
                        await nft.save();   
                        })
                }
                res.status(200).json({status:true,message:"Artworks uploaded successfully"})
                
            }
            else{
                res.status(200).json({status:false,message:"Artwork doesnt exist for this id"})
            }
        }
    }catch(err){
        res.status(200).json({status:false,message:err.toString()})
    }
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
            if(!Boolean(req.body.artwork_id)){
                res.status(200).json({status:false,message:"Missing data"})
            }
            else{
                if(await NFT.find({artwork_id:req.body.artwork_id}).length==0){
                    res.status(200).json({status:false,message:"Artwork id doesn't exist"})
                }
                else{
                    let filedata=await S3.prototype.uploadImage(req.file)
                    let artworks=await NFT.find({artwork_id:req.body.artwork_id})
                    artworks.forEach(async artwork=>{
                        artwork.placeholder_filename=filedata.filename
                        artwork.placeholder_fileurl=filedata.location
                        await artwork.save()
                    })
                    res.status(200).json({status:true,message:"placeholder image saved"})
                }
            }
    }catch(err){
        res.sttaus(500).json({status:false,message:"Err: "+err})
    }
}
exports.metadata=async (req,res)=>{
    try{
        if(await NFT.find({artwork_id:req.body.artwork_id}).length==0){
            res.status(200).json({status:false,message:"Artwork id doesn't exist"})
        }
        else{
            let cid=IPFS.prototype.uploadImage(req.file)
            let results=await NFT.find({artwork_id:req.body.artwork_id})
            results.forEach(async artwork=>{
                artwork.metadata_cid=cid
                await artwork.save()
            })
            res.status(200).json({status:true,message:"metadata saved"})
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
                const sortedObject = {};

                metadata.forEach(item => {
                    const artworkId = item.artwork_id;
                    delete item.artwork_id;
                    
                    if (!sortedObject[artworkId]) {
                        sortedObject[artworkId] = [];
                    }
                    
                    sortedObject[artworkId].push(item);
                });
                res.status(200).json({status:true,artwork:sortedObject})
            }
        }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Err: "+err})
        }
    })
}

