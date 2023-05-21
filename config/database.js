const mongoose = require('mongoose')
require('dotenv').config();
const mainDBConnection = mongoose.createConnection(process.env.MONGODB_URL);

module.exports = { mainDBConnection};
