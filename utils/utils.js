const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const moment=require('moment')
const AWS = require('aws-sdk');
const path=require("path")
const { Readable } = require('stream');
const os=require('os')
const {Web3Storage,getFilesFromPath}=require('web3.storage')

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

async function uploaddata(address,data){

  const bufferImage = Buffer.from(data.base64string.split(";base64,")[1], "base64");
  const filename=`${Date.now().toString()}.png`

  const tempPath = path.join(__dirname, filename);
  const tempFilePath = path.join(__dirname,`${address.slice(0,10)}.json`);
  
   fs.writeFileSync(tempPath, bufferImage);
  const params = {
    Bucket: process.env.BUCKET,
    Key: filename,
    Body: fs.createReadStream(tempPath),
    ContentType: "image/png",
  };
  const jsonparams = {
    Bucket: process.env.BUCKET,
    Key: `${address.slice(0,10)}.json`,
    Body: fs.createReadStream(tempFilePath),
    ContentType: "application/json",
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
  const filedata = await uploadPromise();
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
fs.writeFileSync(tempFilePath, JSON.stringify([{id:data.id,title:data.title,description:data.description,detailed_reveal:data.detailed_reveal,file:filedata.Location}]));
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
  fs.unlinkSync(tempPath);
  fs.unlinkSync(tempFilePath)
  return true
}

async function updatedata(address, data) {
  const bufferImage = Buffer.from(data.base64string.split(";base64,")[1], "base64");
  const filename=`${Date.now().toString()}.png`

  const tempPath = path.join(__dirname, filename);
  
   fs.writeFileSync(tempPath, bufferImage);
  // const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
  // const file=await getFilesFromPath(tempDir)
  // //const metadata=await getFilesFromPath(tempFilePath)
  // const cid=await storage.put(file)
  // console.log("checking 4")
  // fs.unlinkSync(tempPath);
  // fs.unlinkSync(tempFilePath);
  // console.log("uploaddata function called")
  // console.log("cid: ",cid)
  // return cid
  
  const params = {
    Bucket: process.env.BUCKET,
    Key: filename,
    Body: fs.createReadStream(tempPath),
    ContentType: "image/png",
  };
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

  const filedata = await uploadPromise();
  jsonData.push({id:data.id,title:data.title,description:data.description,detailed_reveal:data.detailed_reveal,file:filedata.Location})
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
  fs.unlinkSync(tempPath);
  return true
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
module.exports.uploaddata=uploaddata;
module.exports.updatedata=updatedata;