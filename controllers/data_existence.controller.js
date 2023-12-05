const DatabaseHelper = require('../models/nft.model');
const error=require('../services/errorFormater');
class DataExistence
{
    async isCollectionExistByURI(req,res)
    {
        try 
        {
            const {URI}=req.params;
           const params={
                TableName:'puffles',
                KeyConditionExpression:"#PK=:PK and #URI=:URI and begins_with(#SK,:SK)",
                ExpressionAttributeNames:{"#PK":"PK","#SK":":SK","#URI":":URI"},
                ExpressionAttributeValues:{":PK":`ADR#${req.user.address}`,":SK":"ART#",":URI":URI}

            }
            const data=await DatabaseHelper.prototype.getItems(params)
            res.json(data.Items.length>0);
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