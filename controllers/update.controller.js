const DataRefine=require('../services/DataRefine.service');
const S3=require('../utils/s3');
const {NFT}=require('../models/nft.model');
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
                let json=await S3.prototype.getJson(req.user.address,data.id)
                if(data.file_url)
                {
                    Filekey=await S3.prototype.uploadImage(data.file_url);
                    await S3.prototype.deleteImage(json.filename);
                    data.filename=Filekey.filename;
                    data.file_url=Filekey.location;
                }
                if(data.placeholder_image)
                {
                    PlaceHolderKey=await S3.prototype.uploadImage(data.placeholder_image);
                    if(data.placeholder_image.length){
                        await S3.prototype.deleteImage(json.placeholder_file);
                    }
                    delete data.placeholder_image
                    data.placeholder_file=PlaceHolderKey.filename;
                    data.placeholder_url=PlaceHolderKey.location;
                }
                console.log("data: ",data)
                await S3.prototype.updateJson(req.user.address,data);
                console.log("updated json file")
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