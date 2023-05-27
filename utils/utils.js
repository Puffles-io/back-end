const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const moment=require('moment')
const AWS = require('aws-sdk');
const path=require("path")

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET,
  region: process.env.REGION
});

// Upload a file to S3

function validPassword(password,hash) {
    return bcrypt.compareSync(password,hash);
}

function genPassword(password) {
    let hash=bcrypt.hashSync(password,parseInt(process.env.SALT_ROUNDS))
    return hash
    
}

async function uploadImage(base64string){
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
    region: process.env.REGION
  });
  const bufferImage = Buffer.from(base64string.split(";base64,")[1], "base64");
  const tempPath = path.join(__dirname, "temp.png");
  const filename=`${Date.now().toString()}.png`
  fs.writeFileSync(tempPath, bufferImage);
  const params = {
    Bucket: process.env.BUCKET,
    Key: filename,
    Body: fs.createReadStream(tempPath),
    ContentType: "image/png",
  };

  // Wrap s3.upload() function with a promise
  const uploadPromise = () => {
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  // Use await to wait for the promise to resolve
  const data = await uploadPromise();
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
  console.log(`File uploaded successfully to ${data.Location}`);
  fs.unlinkSync(tempPath);
  return data.Location
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

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.uploadImage=uploadImage;