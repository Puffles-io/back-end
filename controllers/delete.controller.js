const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs');
const { NFT } = require('../models/nft.model');
class DeleteNft
{
    async removeNft(req,res)
    {
        try
        {
           let artworks=await NFT.find({artwork_id:req.body.id})
           await IPFS.prototype.deleteImage(artworks[0].cid)
           artworks.forEach(async artwork=>{
            await artwork.remove()
           })
            
            res.status(200).json({status:true,message:"files deleted successfully"});
        }
        catch(err)
        {
            
            res.status(500).send("internal server error");
        }
    }

    async removePlaceHolderImage(req,res)
    {
        try
        {
           await S3.prototype.deleteImage(req.body.placeholder_filename)
            
            res.status(200).json({status:true,message:"placeholder image deleted successfully"});
        }
        catch(err)
        {
            
            res.status(500).send("internal server error");
        }
    }
}
module.exports=DeleteNft;