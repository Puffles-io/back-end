const {SmartContract}=require('../models/smartcontroller.model');
const error=require('../services/errorFormater');
class DataExistence
{
    async isContractExistByName(req,res)
    {
        try 
        {
            const {name}=req.params;
            const data=await SmartContract.find({name:name});
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