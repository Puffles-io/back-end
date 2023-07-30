const utils=require('../utils/utils')
const error=require('../services/errorFormater');
const web3=require('web3')
exports.register=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.address)){
                res.status(200).json({message:"Please login with your address"})
            }
            else{
            const tempToken=req.headers["authorization"]
            if(tempToken==null) return res.status(403)
            else{
                let userData=utils.verifyTempToken(tempToken);
                const nonce=userData.nonce
                const address=userData.nonce
                const signature=userData.signature
                const verifiedAddress= await web3.eth.accounts.recover(`Please sign this message for address: ${address} and nonce: ${nonce}`,signature)
                if(verifiedAddress.toLowerCase() ===address.toLowerCase()){
                    let jwt=utils.issueJWT(address)
                    res.status(200).json({jwt:jwt})
                }
            }
            }
            }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Error: "+err})  
        }
    })
}
exports.nonce=async (req,res)=>{
    try{
        const nonce=new Date().getTime()
        const address=req.query.address
        let tempToken=utils.issueTempToken(address,nonce)
        res.json({status:true,tempToken:tempToken,message:`Please sign this message for address: ${address} and nonce: ${nonce}`})
    }
    catch(err){
        res.status(500).json({status:false,message:"Internal Server Error"})
    }
}
exports.verify=async (req,res)=>{

}