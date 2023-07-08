const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs');
const { UserCid } = require('../models/nft.model');
class DeleteNft
{
    async removeNft(req,res)
    {
        try
        {
            let cid=await UserCid.find({address:req.user.address})
            let dataFromS3=await IPFS.prototype.getJsonArray(cid[0].cid);
            let bufferData=dataFromS3.Body.toJSON();
            const buffer=Buffer.from(bufferData.data);
            let value=buffer.toLocaleString().replace(/\\/g, '');
            let first=0,last=0;
            for(let i of value)
            {
                if(i=='{')
                {
                    break;
                }
                first++;
            }
            first--;
            for(let i=value.length-1;i>=0;i--)
            {
                if(value[i]=='}')
                {
                   break; 
                }
                last++;
            }
            let value2=value.substring(first,value.length-last)+"]";
           const jsonArray=JSON.parse(value2);
            let index=0;
            for(let i of jsonArray)
            {
                if(i.id==req.body.id)
                {
                
                    if(i.placeholder_file.length) //* It is not empty
                    {
                        if(i.detailed_reveal){
                            await IPFS.prototype.deleteImage(i.placeholder_url)
                           
                        }
                    }
                    await S3.prototype.deleteImage(i.filename);
                    delete jsonArray[index];
                }
                index++;
            }
            const result=await IPFS.prototype.updateJsonArray(cid[0].cid,jsonArray);
            UserCid.findOne({address:req.user.address}).then(async (user)=>{
                
                    user.cid=result
                    await user.save()
            })

            res.send(result.status);
        }
        catch(err)
        {
            console.log(err)
            if(err.code=='NoSuchKey')
            {
                return res.status(404).send('NoSuchKey');
            }
            res.status(500).send("internal server error");
        }
    }
}
module.exports=DeleteNft;