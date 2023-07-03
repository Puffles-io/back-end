const S3=require('../utils/s3');
class DeleteNft
{
    async removeNft(req,res)
    {
        try
        {
            let jsonArray=await S3.prototype.getJsonArray(req.user.address);
            jsonArray=jsonArray.Body.toString()
            let index=0;
            for(let i of jsonArray)
            {
                if(i.id==req.body.id)
                {
                    if(i.placeholder_file.length) //* It is not empty
                    {
                        await S3.prototype.deleteImage(i.placeholder_file);
                    }
                    await S3.prototype.deleteImage(i.filename);
                    delete jsonArray[index];
                }
                index++;
            }
            const result=await S3.prototype.updateJsonArray(req.user.address,jsonArray);
            res.send(result.status);
        }
        catch(err)
        {
            if(err.code=='NoSuchKey')
            {
                return res.status(404).send('NoSuchKey');
            }
            res.status(500).send("internal server error");
        }
    }
}
module.exports=DeleteNft;