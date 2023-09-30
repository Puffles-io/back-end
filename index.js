const express = require('express');
const cors = require('cors');
const passport = require('passport');
const fs = require('fs');
const morgan=require('morgan');
require('dotenv').config();


var app = express();
const dynamodb=require('./config/database');
const params = {
    TableName: 'puffles', // Replace with your table name
    Limit: 1 // Retrieve only one item
  };
  
  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Successfully connected to DynamoDB.');
      console.log('Scanned items:', data.Items);
    }
  });

require('./config/passport')(passport);
app.use(cors())
app.use(passport.initialize());

app.use(express.json());
app.use(morgan(':method , :url , :status , :res[content-length] bytes , :response-time ms , :remote-addr ',
{
    stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));

require('./routes/login.routes.js')(app);
require('./routes/nft.routes.js')(app);
require('./routes/pages.routes.js')(app);
require('./routes/smartcontract.routes.js')(app)
app.use('/existence',require('./routes/data_existence.routes'))
app.use('/delete',require('./routes/delete.routes'));
app.use('/update',require('./routes/update.routes'));
/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(5000,()=>console.log("server listening on port 5000"));