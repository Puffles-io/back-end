const express = require('express');
const cors = require('cors');
const passport = require('passport');
const fs = require('fs');
const morgan=require('morgan');
require('dotenv').config();


var app = express();
const MongooseConnection=require('./config/database');
const dbConnect=new MongooseConnection();
dbConnect.connect().then(()=>{console.log('database connected')}).catch((err)=>{console.log(err)});
require('./config/database');

require('./config/passport')(passport);
app.use(cors())
app.use(passport.initialize());

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({extended: true}));
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