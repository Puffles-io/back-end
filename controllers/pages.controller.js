const {Pages}=require("../models/pages.model")
const error=require('../services/errorFormater');
exports.pages=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.address||req.body.sale_date||req.body.supply||req.body.limit_per_wallet||req.body.price||req.body.Url_string)){
                res.status(200).json({status:false,message:"Missing details"})
            }
            else{
                req.body.ip=req.connection.remoteAddress
                let page=new Pages(req.body)
                await page.save()
                res.status(200).json({status:true,id:page._id})    
            }
            }
        catch(err){
            error(err,req);
            res.status(500).json({message:"Error: "+err.toString()})
        }
    })
}

exports.get_page=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.id)){
                res.json(200).json({status:false,message:"Missing id value"})
            }
            let page=await page.find({_id:req.body.id})
            if(page.length){
                res.status(200).json({status:true,page:page[0]})
            }
            else{
                res.status(200).json({status:false,page:null})
            }
        }
        catch(err){
            error(err,req)
            res.status(500).json({message:"Server Error"})
        }
    })
}