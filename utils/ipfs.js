const {Web3Storage,getFilesFromPath}=require('web3.storage')
class IPFS{
    storage=new Web3Storage({token:process.env.WEB3_TOKEN})
    async uploadImage(base64string){
        return new Promise(async (resolve,reject)=>{
            try{
                const bufferImage = Buffer.from(base64string.split(";base64,")[1], "base64");
                const tempPath = path.join(__dirname, "temp.png");
                fs.writeFileSync(tempPath, bufferImage);
                const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
                const file=await getFilesFromPath(tempPath)
                const cid=await this.storage.put(file)
                fs.unlinkSync(tempPath);
                resolve({filename:"temp.png",location:cid})
            }
            catch(err){
                reject(err)
            }
        })
    }
    
    async deleteImage(cid){
        return new Promise(async(resolve,reject)=>{
            try{

            await this.storage.delete(cid);
            resolve()
            }
            catch(err)
            {
                reject(err)
            }
        })
    }

}
module.exports=IPFS
