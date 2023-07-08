const {Web3Storage,getFilesFromPath}=require('web3.storage')
const path=require('path')
const fs=require('fs')
require('dotenv').config()
class IPFS{
    
    async uploadImage(base64string){
        return new Promise(async (resolve,reject)=>{
            try{
                const bufferImage = Buffer.from(base64string.split(";base64,")[1], "base64");
                const tempPath = path.join(__dirname, "temp.png");
                fs.writeFileSync(tempPath, bufferImage);
                const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
                const file=await getFilesFromPath(tempPath)
                const cid=await storage.put(file,{wrapWithDirectory:false})
                fs.unlinkSync(tempPath);
                resolve(cid)
            }
            catch(err){
                reject(err)
            }
        })
    }
    
    async deleteImage(cid){
        return new Promise(async(resolve,reject)=>{
            try{
            const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
            await storage.delete(cid);
            resolve()
            }
            catch(err)
            {
                reject(err)
            }
        })
    }
    async uploadJson(data){
        return new Promise(async (resolve,reject)=>{
            try{
            let jsonArray=[data]
            const tempPath = path.join(__dirname, "json.json");
            fs.writeFileSync(tempPath, JSON.stringify(jsonArray));
            const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
            const file=await getFilesFromPath(tempPath)
            const cid=await storage.put(file,{wrapWithDirectory:false})
            fs.unlinkSync(tempPath);
            resolve(cid)
            }
            catch(err){
                reject(err)
            }
        })
    }
    async getJson(cid,id){
        return new Promise(async (resolve,reject)=>{
            try{
                const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
                const jsonArray=await storage.get(cid)
                let blobs=await jsonArray.files()
                const blob = blobs[0];
                const arrayBuffer = await blob.arrayBuffer();

                // Convert the ArrayBuffer to a string
                const jsonString = Buffer.from(arrayBuffer).toString('utf8');
                console.log("jsonString: ",jsonString)
                 let jsonData=JSON.parse(jsonString.toString());
                        resolve(jsonData.find(obj=>obj.id==id))
                    
                }
                catch(err){
                    reject(err)
                }
            })
    }
    async getJsonArray(cid)
    {
      return new Promise(async (resolve,reject)=>
      {
        try 
        {
            const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
            const jsonArray=await storage.get(cid)
            let blobs=await jsonArray.files()
            const blob = blobs[0];
            const arrayBuffer = await blob.arrayBuffer();

            // Convert the ArrayBuffer to a string
            const jsonString = Buffer.from(arrayBuffer).toString('utf8');
            console.log("jsonString: ",jsonString)
                resolve(JSON.parse(jsonString.toString()));
        }catch(err){
            reject(err)
        }
        })
    }
    async updateJsonArray(cid,jsonArray)
    {
      return new Promise(async (resolve,reject)=>
      {
          try 
          {
            const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
            await storage.delete(cid);
            const tempPath = path.join(__dirname, "json.json");
            fs.writeFileSync(tempPath, JSON.stringify(jsonArray));
            const file=await getFilesFromPath(tempPath)
            const newCid=await storage.put(file,{wrapWithDirectory:false})
            fs.unlinkSync(tempPath);
            resolve(newCid)
          } 
          catch (error) 
          {
            reject(error);
          }
      })
    }

    async pushtoJson(cid, data) {
        try{
        const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
        const jsonArray=await storage.get(cid)
        let blobs=await jsonArray.files()
        const blob = blobs[0];
        const arrayBuffer = await blob.arrayBuffer();

        // Convert the ArrayBuffer to a string
        const jsonString = Buffer.from(arrayBuffer).toString('utf8');
        console.log("jsonString: ",jsonString)
        let jsonData=JSON.parse(jsonString)
        await storage.delete(cid)
        jsonData.push(data)
        const tempPath = path.join(__dirname, "json.json");
        fs.writeFileSync(tempPath, JSON.stringify(jsonData));
        const file=await getFilesFromPath(tempPath)
        const newCid=await storage.put(file,{wrapWithDirectory:false})
        fs.unlinkSync(tempPath);
        resolve(newCid)
        }
        catch(err){
            reject(err)
        }
      }

}
module.exports=IPFS
