const {writeFile, writeMetadata}=require('../utils/utils')
const error=require('../services/errorFormater');
const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs')
const fs=require('fs')
const fsextra=require('fs-extra')
const Database=require('../models/nft.model')
const { uuid } = require('uuidv4');
const path=require('path')

exports.upload_v1=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
                if(!Boolean(req.body.artwork_id)){
                    let id=writeFile(req.file,uuid())
                    res.status(200).json({status:true,id:id})
                }
                else{
                    let id=writeFile(req.file,req.body.artwork_id)
                    res.status(200).json({status:true,id:id})
                    
                }
                // let {cid,filename}= await uploadImage(req.body.file_url);
                // let metadata={title:req.body.title,description:req.body.description,cid:cid,detailed_reveal:req.body.detailed_reveal,filename:filename}
                // let metadata_url=await uploadJSON(metadata)
                // let nft=new NFT({cid:metadata_url,address:req.user.address,ip:req.connection.remoteAddress,title:req.body.title})
                // await nft.save()
                // res.status(200).json({status:true,message:"NFT saved successfully"}) 
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
                fsextra.removeSync(parentDirectory)
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
        const id=uuid();
        const params={
            TableName:'puffles',
            Item:{
                PK:`ADR#${req.user.address}`,
                SK:`ART#${id}`,
                title:req.body.title,
                timestamp:new Date().toISOString(),
                ip:req.connection.remoteAddress

            }
        }
        await Database.prototype.addItem(params)
        res.status(200).json({status:true,message:id})
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
            res.status(200).json({status:true,message:"Artwork with given id doesnt exist"})
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
           res.status(200).json({status:true,message:req.body.artwork_id})
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
        res.status(500).json({status:false,message:"Err: "+err})
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
            writeMetadata(req.file,req.body.artwork_id)
            res.status(200).json({status:true,message:"Saved Metadata files"})
        }
    }catch(err){
        res.sttaus(500).json({status:false,message:"Err: "+err})
    }
}
exports.metadataUpload=async (req,res)=>{
    try{
        if(!Boolean(req.body.artwork_id)){
            res.status(200).json({status:false,message:"Missing artwork id"})
        }
        else{
            const parentDirectory = path.join(__dirname, '..',"utils","metadata",req.body.artwork_id);
            if(fs.existsSync(parentDirectory)){
                const params={
                    TableName:'puffles',
                    Key:{
                        PK:`ADR#${req.user.address}`,
                        SK:`ART#${req.body.id}`,
                    }
                }
                let results=await Database.prototype.getItem(params)
        if(results===undefined){
            res.status(200).json({status:false,message:"Files with given artwork id doesn't exist"})
        }
        else{
            var count=0
            fs.readdirSync(parentDirectory).forEach((file)=>{
                const filepath=path.join(parentDirectory,file)
                if(path.extname(file)===".json"){
                    try{
                        const data=fs.readFileSync(filepath,'utf8')
                        const jsonData=JSON.parse(data)
                        jsonData.image=`https://${results.cid}.ipfs.dweb.link/${results.filenames[count]}`
                        count+=1;
                        const modifiedData = JSON.stringify(jsonData, null, 2);
                        // Write the modified data back to the file synchronously
                        fs.writeFileSync(filepath, modifiedData, 'utf8');
                        
                    }catch(err){
                        console.log(err)
                    }
                }
            })
            let files=await IPFS.prototype.uploadFiles(req.body.id)
            const updatedParams={
                TableName:'puffles',
                Key:{PK:`ADR#${req.user.address}`,SK:`ART#${req.body.artwork_id}`},
                UpdateExpression:"set #metadata=:metadata",
                ExpressionAttributeNames:{"#metadata":"metadata"},
                ExpressionAttributeValues:{":metadata":files.cid}
            }
            await DatabaseHelper.prototype.updateItems(updatedParams)
            fsextra.removeSync(parentDirectory)
            res.status(200).json({status:true,message:"Metadata uploaded successfully"})

        }

            }
        }
    }catch(err){
        console.log(err)
        res.status(500).json({status:false,message:"Server Error"})
    }
}
exports.get_nfts=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            const params = {
                TableName: 'puffles',
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': `ADR#${req.user.address}`
                }
            };
            let nfts=await Database.prototype.getItems(params)
            console.log("metadata: ",nfts)
            if(nfts===undefined){
                res.status(200).json({status:true,artwork:[]})
            }
            else{
                nfts.Items.sort((a,b)=>new Date(a.timestamp) - new Date(b.timestamp))
                res.status(200).json({status:true,artwork:nfts.Items})
            }
        }
        catch(err){
            error(err,req);
            console.log("Err: ",err)
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
            else{
            const params = {
                TableName: 'puffles', // Replace with your table name
                FilterExpression: 'title = :title',
                ExpressionAttributeValues: {
                    ':title': req.body.title
                }
            };
            let address=await Database.prototype.matchItem(params)
            if(address===undefined){
                res.status(200).json({status:false,message:"Artwork with given id does not exist"})
            }
            else{
                res.status(200).json({status:true,message:address.Items[0].whitelist})
            }
        }
        }
        catch(err){
            console.log(err)
            res.status(500).json({status:false,message:"Server Error"})
        }
    })
}
