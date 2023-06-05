const {NFT}=require("../models/nft.model")
const {uploadImage,uploadJSON}=require('../utils/utils')
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
                let file_url= await uploadImage(req.body.file_url);
                let metadata={title:req.body.title,description:req.body.description,file_url:file_url,placeholder_image:file_url,detailed_reveal:req.body.detailed_reveal}
                let metadata_url=await uploadJSON(metadata)
                let nft=new NFT({cid:metadata_url,address:req.user.address})
                await nft.save()
                res.status(200).json({status:true,message:"NFT saved successfully"})
            }
        }
        catch(err){
            console.log("err: ",err)
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}