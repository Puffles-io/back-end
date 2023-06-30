const AWS = require('aws-sdk');
const fs=require('fs');
const path=require('path')
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
    region: process.env.REGION
  });
class S3Methods
{
    async getJson(address,id){
        return new Promise(async (resolve,reject)=>{
            try{
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
                        resolve(jsonData.find(obj=>obj.id==id))
                    }
                })
            }
            catch(err){
                reject(err)
            }
        })
    }
    async getJsonArray(address)
    {
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
                resolve(data);
              }
          })
        } catch (error) 
        {
          reject(error);
        }
      })
    }
    async updateJsonArray(address,jsonArray)
    {
      return new Promise(async (resolve,reject)=>
      {
          try 
          {
            const updatedparams = {
              Bucket: process.env.BUCKET,
              Key: `${address.slice(0,10)}.json`,
              Body: JSON.stringify(jsonArray),
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
                    s3.putObjectAcl({
                        Bucket: process.env.BUCKET,
                        Key: `${address.slice(0,10)}.json`,
                        ACL: 'public-read'
                      }, function(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`Object ACL set to public-read`);
                        }
                      });
                    resolve({status:true});
                }
            })
          } 
          catch (error) 
          {
            reject(error);
          }
      })
    }
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
                        s3.putObjectAcl({
                            Bucket: process.env.BUCKET,
                            Key: filename,
                            ACL: 'public-read'
                          }, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(`Object ACL set to public-read`);
                            }
                          });
                          fs.unlinkSync(tempPath)
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
    async updateJson(address,value){
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
                                s3.putObjectAcl({
                                    Bucket: process.env.BUCKET,
                                    Key: `${address.slice(0,10)}.json`,
                                    ACL: 'public-read'
                                  }, function(err, data) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(`Object ACL set to public-read`);
                                    }
                                  });
                                resolve({status:true});
                            }
                        })
                        
                    }
                })  
            } catch (error) {
                console.log("Error: ",error)
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
                      console.log("filename: ",filename)
                      s3.deleteObject(deleteParams,(err,data)=>
                      {
                        if(err)
                        {
                            console.log("err: ",err)
                            reject(err);
                        }
                        else
                        {
                            resolve(data);
                        }
                      })
                } catch (error) 
                {
                    console.log("error: ",error)
                    reject(error);
                }
            })
    }
    async uploadJson(address,data){

        const tempFilePath = path.join(__dirname,`${address.slice(0,10)}.json`);
        
        
        const jsonparams = {
          Bucket: process.env.BUCKET,
          Key: `${address.slice(0,10)}.json`,
          Body: fs.createReadStream(tempFilePath),
          ContentType: "application/json",
        };
      
       
        const jsonuploadPromise = () => {
          return new Promise((resolve, reject) => {
            s3.upload(jsonparams, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        };
       // Use await to wait for the promise to resolve
       
      fs.writeFileSync(tempFilePath, JSON.stringify([data]));
      const jsondata=await jsonuploadPromise();
      s3.putObjectAcl({
        Bucket: process.env.BUCKET,
        Key: `${address.slice(0,10)}.json`,
        ACL: 'public-read'
      }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Object ACL set to public-read`);
        }
      });
      s3.putObjectAcl({
        Bucket: process.env.BUCKET,
        Key: `${address.slice(0,10)}.json`,
        ACL: 'public-read'
      }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Object ACL set to public-read`);
        }
      });
        console.log(`File uploaded successfully to ${jsondata.Location}`);
        fs.unlinkSync(tempFilePath)
        return {status:true,url:jsondata.Location}
      }

      async pushtoJson(address, data) {
        const jsonparams = {
          Bucket: process.env.BUCKET,
          Key: `${address.slice(0, 10)}.json`,
        };
      
        // Wrap s3.getObject() function with a promise
        const getObjectPromise = () => {
          return new Promise((resolve, reject) => {
            s3.getObject(jsonparams, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        };
      
        // Use await to wait for the promise to resolve
        const fileData = await getObjectPromise();
        const jsonData = JSON.parse(fileData.Body.toString());
      
        jsonData.push(data)
        const updatedparams = {
          Bucket: process.env.BUCKET,
          Key: `${address.slice(0,10)}.json`,
          Body: JSON.stringify(jsonData),
          ContentType: "application/json",
        };
        const jsonuploadPromise = () => {
          return new Promise((resolve, reject) => {
            s3.upload(updatedparams, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        };
       // Use await to wait for the promise to resolve
      
      const jsondata=await jsonuploadPromise();
      s3.putObjectAcl({
        Bucket: process.env.BUCKET,
        Key: `${address.slice(0,10)}.json`,
        ACL: 'public-read'
      }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Object ACL set to public-read`);
        }
      });
        console.log(`File uploaded successfully to ${jsondata.Location}`);
      
        return true
      }
}
module.exports=S3Methods;