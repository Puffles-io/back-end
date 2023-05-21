const {Pages}=require("../models/pages.model")
exports.pages=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            let page=new Pages(req.body)
            await page.save()
            res.status(200).json({status:true,message:"Page saved successfully"})
        }
        catch(err){
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}