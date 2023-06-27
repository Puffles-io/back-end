const DataRefine=require('../services/DataRefine.service');
const S3=require('../utils/s3');
const NFT=require('../models/nft.model');
const error=require('../services/errorFormater');
 class Update
{
    async NFT(req,res){
            try 
            {
                //* Refining the data
                const data=DataRefine.prototype.removeNullData(req.body);
                //* update the data
                let Filekey,PlaceHolderKey;
                if(data.file_url)
                {
                    Filekey=await S3.prototype.uploadImage(data.file_url);
                    await S3.prototype.deleteImage(data.filename);
                    data.filename=Filekey.filename;
                    data.file=Filekey.location;
                }
                if(data.placeholder_image)
                {
                    PlaceHolderKey=await S3.prototype.uploadImage(data.placeholder_image);
                    await S3.prototype.deleteImage(data.placeholdername);
                    data.placeholdername=PlaceHolderKey.filename;
                    data.placeholder=PlaceHolderKey.location;
                }
                await S3.prototype.upadateJson(req.user.address,data);
                if(data.title)
                {
                    NFT.findOne({_id:data.id}).then(async (userData)=>
                    {
                        userData.title=data.title;
                        userData.timestamp=new Date();
                        await userData.save();
                    }).catch((err)=>
                    {
                        throw err;
                    })
                }
                res.json(
                    {
                        status:true,
                        message: "collection is updated succesfully"
                    })
            } 
            catch (err) 
            {
                error(err,req);
                res.status(500).send("Server error");
            }
    }
}
module.exports=Update;