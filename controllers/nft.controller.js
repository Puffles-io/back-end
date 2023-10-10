const {writeFile}=require('../utils/utils')
const error=require('../services/errorFormater');
const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs')
const fs=require('fs')
const Database=require('../models/nft.model')
const path=require('path')

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
        console.log("req body",req.body)
        if(!Boolean(req.body.id)){
            res.status(200).json({status:false,message:"Missing artwork id"})
        }
        else{
            const parentDirectory = path.join(__dirname, '..',"utils","files",req.body.id);
            if(fs.existsSync(parentDirectory)){
                let files=await IPFS.prototype.uploadFiles(req.body.id)
                const params={
                    TableName:'puffles',
                    Item:{
                        PK:`ADR#${req.user.address}`,
                        SK:`ART#${req.body.id}`,
                        filenames:files.files,
                        cid:files.cid,
                        timestamp:new Date().toISOString(),
                        ip:req.connection.remoteAddress

                    }
                }
                await Database.prototype.addItem(params)
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
        const params={
            TableName:'puffles',
            Key:{
                PK:`ADR#${req.user.address}`,
                SK:`ART#${req.body.artwork_id}`
                }
        }
        if(await Database.prototype.getItem(params) ===undefined){
            res.status(200).json({status:false,message:"Artwork ID doesn't exist"})
        }
        else{
            const updatedParams={
                TableName:'puffles',
                Key:{PK:`ADR#${req.user.address}`,SK:`ART#${req.body.artwork_id}`},
                UpdateExpression:"set #title=:title",
                ExpressionAttributeNames:{"#title":"title"},
                ExpressionAttributeValues:{":title":req.body.title}
            }
            await Database.prototype.updateItems(updatedParams)
           res.status(200).json({status:true,message:"Artwork title updated successfully"})
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
                const params={
                    TableName:'puffles',
                        Key:{
                        PK:`ADR#${req.user.address}`,
                        SK:`ART#${req.body.artwork_id}`
                        }
                }
                let results=await Database.prototype.getItem(params)
                if(results===undefined){
                    res.status(200).json({status:false,message:"Artwork id doesn't exist"})
                }
                else{
                    
                    if(results.Items.hasOwnProperty(placeholder_image)&& results.Items.placeholder_image!=""){
                        S3.prototype.deleteImage(results.Items.placeholder_image)
                    }
                    let filedata=await S3.prototype.uploadImage(req.file)
                    const updatedParams={
                        TableName:'puffles',
                        Key:{PK:`ADR#${req.user.address}`,SK:`ART#${req.body.artwork_id}`},
                        UpdateExpression:"set #placeholder_image=:placeholder_image,#placeholder_fileurl=:placeholder_fileurl",
                        ExpressionAttributeNames:{"#placeholder_image":"placeholder_image","#placeholder_fileurl":"placeholder_fileurl"},
                        ExpressionAttributeValues:{":placeholder_image":filedata.filename,":placeholder_fileurl":filedata.location}
                    }
                    await Database.prototype.updateItems(updatedParams)
                    res.status(200).json({status:true,message:"placeholder image saved"})
                }
            }
    }catch(err){
        res.staus(500).json({status:false,message:"Err: "+err})
    }
}
exports.metadata=async (req,res)=>{
    try{
        const params={
            TableName:'puffles',
            Key:{
                PK:`ADR#${req.user.address}`,
                SK:`ART#${req.body.artwork_id}`
                }
        }
        let results=await Database.prototype.getItem(params)
        if(results===undefined){
            res.status(200).json({status:false,message:"Artwork id doesn't exist"})
        }
        else{
            let cid=await IPFS.prototype.uploadImage(req.file)
            const updatedParams={
                TableName:'puffles',
                Key:{PK:`ADR#${req.user.address}`,SK:`ART#${req.body.artwork_id}`},
                UpdateExpression:"set #metadata=:metadata",
                ExpressionAttributeNames:{"#metadata":"metadata"},
                ExpressionAttributeValues:{":metadata":cid}
            }
            await Database.prototype.updateItems(updatedParams)
            res.status(200).json({status:true,message:cid})
        }
    }catch(err){
        res.sttaus(500).json({status:false,message:"Err: "+err})
    }
}
exports.get_nfts=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            const params={
                TableName:'puffles',
                KeyConditionExpression:"#PK=:PK and begins_with(#SK,:SK)",
                ExpressionAttributeNames:{"#PK":"PK","#SK":"SK"},
                ExpressionAttributeValues:{":PK":`ADR#${req.user.address}`,":SK":"ART#"}

            }
            let metadata=await Database.prototype.getItems(params)
            console.log("metadata: ",metadata)
            if(metadata.Items.length==0){
                res.status(200).json({status:true,artwork:[]})
            }
            else{
                
                res.status(200).json({status:true,artwork:metadata.Items})
            }
        }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Err: "+err})
        }
    })
}
exports.whitelistByTitle=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.title)){
                res.status(200).json({status:false,message:"Missing title"})
            }
            const params = {
                TableName: 'puffles', // Replace with your table name
                FilterExpression: 'title = :title',
                ExpressionAttributeValues: {
                    ':title': req.body.title
                }
            };
            let address=await DatabaseHelper.prototype.matchItem(params)
            if(address===undefined){
                res.status(200).json({status:false,message:"Artwork with given id does not exist"})
            }
            else{
                res.status(200).json({status:true,message:address.Items[0].whitelist})
            }
        }
        catch(err){
            console.log(err)
            res.status(500).json({status:false,message:"Server Error"})
        }
    })
}
