const {SmartContract}=require("../models/smartcontroller.model")
exports.smartcontract=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            req.body.ip=req.connection.remoteAddress    
            let contract=new SmartContract(req.body)
            await contract.save()
            res.status(200).json({status:true,message:"Contract saved successfully"})

        }catch(err){
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}