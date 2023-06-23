const {Pages}=require("../models/pages.model")
const error=require('../services/errorFormater');
exports.pages=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.address||req.body.sale_date||req.body.supply||req.body.limit_per_wallet||req.body.price||req.body.Url_string)){
                res.status(200).json({status:false,message:"Missing details"})
            }
            else{
                let page=new Pages(req.body)
                await page.save()
                res.status(200).json({status:true,message:"Page saved successfully"})    
            }
            }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}