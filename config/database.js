const mongoose = require("mongoose");
class MongooseConnection
{
    async connect()
    {
        return new Promise(async(resolve,reject)=>{
            try {
                await mongoose.connect(String(process.env.MONGODB_URL));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        })
    }
}
module.exports=MongooseConnection;