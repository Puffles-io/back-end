const DataRefine=require('../services/DataRefine.service');
const S3=require('../utils/s3');
const {updatedata}=require('../utils/utils')
const {NFT,UserCid}=require('../models/nft.model');
const IPFS=require('../utils/ipfs')
const {Pages}=require('../models/pages.model')
const {SmartContract}=require('../models/smartcontroller.model')
const error=require('../services/errorFormater');
 class Update
{
    async NFT(req,res){
            try 
            {
                if(!Boolean(req.body.artwork_id)){
                    res.status(200).json({status:false,message:"missing data"})
                }
                else{
                    if(await NFT.find({artwork_id:req.body.artwork_id}).length==0){
                        res.staus(200).json({status:false,message:"Artwork doesn't exist"})
                    }
                    else{
                        let data=await NFT.find({artwork_id:req.body.artwork_id})[0]
                        let filedata=await S3.prototype.uploadImage(req.file)
                        let nft=new NFT({title:data.title,filename:filedata.filename,url:filedata.location,artwork_id:data.artwork_id,address:req.user.address,random_value:req.body.random,ip:req.socket.remoteAddress})
                        await nft.save()
                        res.status(200).json({status:true,message:"Artwork updated successfully"})
                    }
                }
                
            } 
            catch (err) 
            {
                console.log("Error: ",err)
                error(err,req);
                res.status(500).send("Server error");
            }
    }

    async Page(req,res){
        try{
            const data=DataRefine.prototype.removeNullData(req.body);
            Pages.findOne({_id:data.id}).then(async (page)=>{
                if(data.bg_image){
                    await S3.prototype.deleteImage(page.filename)
                    let result=await S3.prototype.uploadImage(data.bg_image)
                    data.filename=result.filename
                    data.bg_image=result.location
                }
                for(let i of Object.entries(data))
                {
                    console.log(i)
                    page[i[0]]=i[1];
                }
                await page.save()
            })

            res.status(200).json({status:true,message:"Page updated successfuly"})
        }
        catch(err){
            error(err,req)
            res.status(200).json({message:"Server Error"})
    }
    }

    async SmartContract(req,res){
        try{
            const data=DataRefine.prototype.removeNullData(req.body);
            SmartContract.findOne({_id:data.id}).then(async (contract)=>{
                for(let i of Object.entries(data))
                {
                    contract[i[0]]=i[1];
                }
                await contract.save()
            })
            res.status(200).json({status:true,message:"Smart Contract Updated Successfully"})
        }
        catch(err){
            error(err,req)
            res.status(500).json({message:"Server Error"})
        }
    }
}
module.exports=Update;