const mongoose = require('mongoose')
require('dotenv').config();
console.log("MongoDB URL: ",process.env.MONGODB_URL)
const mainDBConnection = mongoose.createConnection(process.env.MONGODB_URL);

module.exports = { mainDBConnection};
