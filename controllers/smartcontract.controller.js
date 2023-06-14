const {SmartContract}=require("../models/smartcontroller.model")
const error=require('../services/errorFormater');
exports.smartcontract=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            req.body.ip=req.connection.remoteAddress    
            let contract=new SmartContract(req.body)
            await contract.save()
            res.status(200).json({status:true,message:"Contract saved successfully"})

        }catch(err){
            error(err,req);
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}