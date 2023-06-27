const AWS = require('aws-sdk');
const fs=require('fs');
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
    region: process.env.REGION
  });
class S3Methods
{
    async uploadImage(base64)
    {
        return new Promise(async(resolve,reject)=>
        {
            try
            {
                const bufferImage = Buffer.from(base64.split(";base64,")[1], "base64");
                const filename=`${Date.now().toString()}.png`
                const tempPath = path.join(__dirname, filename);
                fs.writeFileSync(tempPath, bufferImage);
                const params = {
                    Bucket: process.env.BUCKET,
                    Key: filename,
                    Body: fs.createReadStream(tempPath),
                    ContentType: "image/png",
                  };
                s3.upload(params,(err,data)=>
                {
                    if(err)
                    {
                        reject(err);
                    }
                    else
                    {
                        resolve({filename:filename,location:data.Location});
                    }
                })
            }
            catch(err)
            {
                reject(err);
            }
        })
    }
    async upadateJson(address,value){
        return new Promise(async (resolve,reject)=>
        {
            try 
            {
                const jsonparams = {
                    Bucket: process.env.BUCKET,
                    Key: `${address.slice(0, 10)}.json`,
                  };
                s3.getObject(jsonparams,(err,data)=>
                {
                    if(err)
                    {
                        reject(err);
                    }
                    else
                    {
                        let jsonData=JSON.parse(data.Body.toString());
                        for(let i of jsonData)
                        {
                            if(value.id==i.id) 
                            {
                               i=this.updatedata(value,i);
                               break;
                            }
                        }
                        const updatedparams = {
                            Bucket: process.env.BUCKET,
                            Key: `${address.slice(0,10)}.json`,
                            Body: JSON.stringify(jsonData),
                            ContentType: "application/json",
                          };
                        s3.upload(updatedparams,(err,data)=>
                        {
                            if(err)
                            {
                                reject(err);
                            }
                            else
                            {
                                resolve({status:true});
                            }
                        })
                    }
                })  
            } catch (error) {
                reject(error);
            }
        })
    }
    
    updatedata(newOne,oldOne)
    {
        for(let i of Object.entries(newOne))
        {
            oldOne[i[0]]=i[1];
        }
        return oldOne;
    }
    async deleteImage(filename){
            return new Promise(async (resolve,reject)=>
            {
                try 
                {
                    const deleteParams = {
                        Bucket: process.env.BUCKET,
                        Key: filename,
                      };  
                      s3.deleteObject(deleteParams,(err,data)=>
                      {
                        if(err)
                        {
                            reject(err);
                        }
                        else
                        {
                            resolve(data);
                        }
                      })
                } catch (error) 
                {
                    reject(error);
                }
            })
    }
}
module.exports=S3Methods;