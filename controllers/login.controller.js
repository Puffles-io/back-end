const utils=require('../utils/utils')
exports.register=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.address)){
                res.status(200).json({message:"Please login with your address"})
            }
            else{
            let jwt=utils.issueJWT(req.body.address)
            res.status(200).json({jwt:jwt})
        
            }
            }
        catch(err){
            console.log(err)
            res.status(500).json({message:"Error: "+err})
            
        }
    })
}