const {NFT}=require('../models/nft.model');
const error=require('../services/errorFormater');
class DataExistence
{
    async isContractExistByName(req,res)
    {
        try 
        {
            const {name}=req.params;
            const data=await NFT.find({title:name});
            res.json(data.length>0);
        } 
        catch (err) 
        {
            error(err,req);
            res.status(500).send("server error!");
        }
    }
}
module.exports=DataExistence;