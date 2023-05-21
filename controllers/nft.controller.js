const {NFT}=require("../models/nft.model")
exports.upload_v1=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            let nft=new NFT(req.body)
            await nft.save()
            res.status(200).json({status:true,message:"NFT saved successfully"})
        }
        catch(err){
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}