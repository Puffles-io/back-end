const {Pages}=require("../models/pages.model")
const error=require('../services/errorFormater');
const S3=require('../utils/s3');
exports.pages=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.artwork_id || req.body.Url_string || req.body.theme ||req.body.bg_image)){
                res.status(200).json({status:false,message:"Missing details"})
            }
            else{
                req.body.ip=req.connection.remoteAddress
                let result=await S3.prototype.uploadImage(req.body.bg_image)
                req.body.bg_image=result.location
                req.body.filename=result.filename
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

exports.get_page=async (req,res)=>{
    return new Promise(async function(resolve,reject){
        try{
            if(!Boolean(req.body.id)){
                res.json(200).json({status:false,message:"Missing id value"})
            }
            let page=await Pages.find({artwork_id:req.body.id})
            if(page.length){
                res.status(200).json({status:true,page:page[0]})
            }
            else{
                res.status(200).json({status:false,page:null})
            }
        }
        catch(err){
            console.log(err)
            error(err,req)
            res.status(500).json({message:"Server Error"})
        }
    })
}