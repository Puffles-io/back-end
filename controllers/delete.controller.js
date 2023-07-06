const S3=require('../utils/s3');
const IPFS=require('../utils/ipfs')
class DeleteNft
{
    async removeNft(req,res)
    {
        try
        {
            
            let dataFromS3=await S3.prototype.getJsonArray(req.user.address);
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
                            await IPFS.prototype.deleteImage(i.file_url)
                        }
                        else{
                            await S3.prototype.deleteImage(i.placeholder_file);
                            await S3.prototype.deleteImage(i.filename);
                        }
                    }
                    
                    delete jsonArray[index];
                }
                index++;
            }
            const result=await S3.prototype.updateJsonArray(req.user.address,jsonArray);
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