const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const moment=require('moment')



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


function issueTempToken(address,nonce){
  return jsonwebtoken.sign({address,nonce},process.env.JWT_SECRET,{expiresIn:'60s'})
}
function verifyTempToken(tempToken){
  return jsonwebtoken.verify(tempToken,process.env.JWT_SECRET)
}
function issueJWT(address) {

  const payload = {
    address: address,
    iat: Date.now(),
    expiresIn:moment().add('2','w')
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.JWT_SECRET);
  
  return signedToken
}
function updatedata(newOne,oldOne)
{
    for(let i of Object.entries(newOne))
    {
        oldOne[i[0]]=i[1];
    }
    return oldOne;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.updatedata=updatedata
module.exports.issueTempToken=issueTempToken;
module.exports.verifyTempToken=verifyTempToken