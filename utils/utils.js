const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const moment=require('moment')
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET,
  region: process.env.REGION
});

// Upload a file to S3
const upload = multer({
    storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: process.env.BUCKET,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      }
    })
    
  })
function validPassword(password,hash) {
    return bcrypt.compareSync(password,hash);
}

function genPassword(password) {
    let hash=bcrypt.hashSync(password,parseInt(process.env.SALT_ROUNDS))
    return hash
    
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