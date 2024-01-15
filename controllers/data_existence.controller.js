const DatabaseHelper = require('../models/nft.model');
const error=require('../services/errorFormater');
const IPFS = require('../utils/ipfs');

class DataExistence
{
    async getJsonFiles(req,res){
        try{
            if(!Boolean(req.body.cid)){
                res.status(200).json({status:false,message:"Missing data"})
            }
            else{
               let files=await IPFS.prototype.getJSON(req.body.cid)
               res.status(200).json({status:200,metadata:files.array,urls:files.urls})

            }

        }catch(err){
            console.log(err)
            error(err,req);
            res.status(500).send("server error!");
        }
    }
    async isCollectionExistByURI(req,res)
    {
        try 
        {
            const {URI}=req.params;
           const params={
                TableName:'puffles',
                KeyConditionExpression:"#URI=:URI",
                ExpressionAttributeNames:{"#URI":":URI"},
                ExpressionAttributeValues:{":URI":URI}

            }
            const data=await DatabaseHelper.prototype.getItems(params)
            if(data===undefined){
                res.json({status:false})
            } 
            else{
            res.json(data.Items[0].URI_status);
    }}
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
            const params={
                TableName:'puffles',
                KeyConditionExpression:"#PK=:PK and #url=:url and begins_with(#SK,:SK)",
                ExpressionAttributeNames:{"#PK":"PK","#SK":":SK","#url":":url"},
                ExpressionAttributeValues:{":PK":`ADR#${req.user.address}`,":SK":"PGE#",":url":urlString}

            }
            const data=await DatabaseHelper.prototype.getItems(params)
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