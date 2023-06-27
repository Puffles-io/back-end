const express=require('express');
const router=express.Router();
const passport=require('passport');
const Update=require('../controllers/update.controller');
router.post('/nft',passport.authenticate('jwt',{session:false}),Update.prototype.NFT);
module.exports=router;