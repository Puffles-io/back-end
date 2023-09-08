const AWS = require('aws-sdk');
require('dotenv').config()
// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET,
  region: process.env.REGION
});

// Create a DynamoDB Document Client instance
const dynamoDB = new AWS.DynamoDB.DocumentClient();
module.exports=dynamoDB;