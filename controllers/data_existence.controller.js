const {NFT}=require('../models/nft.model');
const {Pages}=require('../models/pages.model')
const error=require('../services/errorFormater');
class DataExistence
{
    async isCollectionExistByName(req,res)
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

    async isCollectionEXistByURL(req,res)
    {
        try
        {
            const {urlString}=req.params;
            const data=await Pages.find({Url_string:urlString});
            res.json(data.length>0);
        }
        catch(err)
        {
            error(err,req);
            res.status(500).send("server error!");
        }
    }
}
module.exports=DataExistence;