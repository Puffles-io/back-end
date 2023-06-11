const fs = require('fs');
const moment=require('moment')
const path = require('path');
const knex = require("./database");
const JwtStrategy=require('passport-jwt').Strategy
const ExtractJwt=require('passport-jwt').ExtractJwt;
require('dotenv').config()
const cookieExtractor = function (req) {
    let token = req.cookies["web3-details"];
    return token;
};
const options = {
    jwtFromRequest:cookieExtractor,
    secretOrKey:process.env.JWT_SECRET,
};
const strategy=new JwtStrategy(options,(payload,done)=>
{

    if(moment().isBefore(payload.expiresIn)){
        done(null,payload)   
    }
    else{
        done(null,false)
    }

})
module.exports = (passport) => {
    
    passport.use(strategy)
}