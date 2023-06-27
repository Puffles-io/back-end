const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const moment=require('moment')

const { Readable } = require('stream');
const os=require('os')
const {Web3Storage,getFilesFromPath}=require('web3.storage')


// Upload a file to S3

function validPassword(password,hash) {
    return bcrypt.compareSync(password,hash);
}

function genPassword(password) {
    let hash=bcrypt.hashSync(password,parseInt(process.env.SALT_ROUNDS))
    return hash
    
}


    // Delete the file by its CID
  //   const deleteResponse = await client.delete(file.cid);
  //   console.log('File deleted successfully:', deleteResponse);
  // const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'temp-json-'));
  // const tempFilePath = path.join(tempDir, 'temp.json');

  // fs.writeFileSync(tempFilePath, JSON.stringify(data));
  // const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
  // const file=await getFilesFromPath(tempFilePath)
  // const cid=await storage.put(file)
  // fs.unlinkSync(tempFilePath);
  // return cid



function issueJWT(address) {

  const payload = {
    address: address,
    iat: Date.now(),
    expiresIn:moment().add('2','w')
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.JWT_SECRET);
  
  return signedToken
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;