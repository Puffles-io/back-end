const express = require('express');
const cors = require('cors');

const passport = require('passport');

require('dotenv').config();


var app = express();

require('./config/database');

require('./config/passport')(passport);
app.use(cors())
app.use(passport.initialize());

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({extended: true}));


require('./routes/login.routes.js')(app);
require('./routes/nft.routes.js')(app);
require('./routes/pages.routes.js')(app);
require('./routes/smartcontract.routes.js')(app)
/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(5000,()=>console.log("server listening on port 5000"));