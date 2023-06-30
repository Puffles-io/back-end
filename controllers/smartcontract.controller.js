const {SmartContract}=require("../models/smartcontroller.model")
const error=require('../services/errorFormater');
exports.smartcontract=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.name || req.body.token_symbol || req.body.total_supply || req.body.price || req.body.max_token_per_wallet || req.body.recipient_address || req.body.artwork_id)){
                res.status(200).json({status:false,message:"Missing Credentials"})
            }
            req.body.ip=req.connection.remoteAddress
            req.body.wallet_address=req.user.address    
            let contract=new SmartContract(req.body)
            let result=await contract.save()
            res.status(200).json({status:true,id:result._id})

        }catch(err){
            error(err,req);
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}
exports.get_contract=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.id)){
                res.status(200).json({status:false,message:"Missing id"})
            }
            let contract=await SmartContract.find({_id:req.body.id})
            if(contract.length){
                res.status(200).json({status:true,contract:contract[0]})
            }
            else{
                res.status(200).json({status:false,contract:null})
            }
            
        }
        catch(err){
            error(err,req)
            res.status(500).json({message:"Server Error"})
        }
    })
}