const express=require('express');
const router=express.Router();
const passport=require('passport');
const Update=require('../controllers/update.controller');
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });
router.post('/nft',passport.authenticate('jwt',{session:false}),upload.single('file'),Update.prototype.NFT);
router.post('/page',passport.authenticate('jwt',{session:false}),Update.prototype.Page);
router.post('/smartcontract',passport.authenticate('jwt',{session:false}),Update.prototype.SmartContract);
router.post('/address_saledate',passport.authenticate('jwt',{session:false}),Update.prototype.Address_Saledate);
router.post('/whitelist',passport.authenticate('jwt',{session:false}),Update.prototype.Whitelist)
router.post('/active_phase',passport.authenticate('jwt',{session:false},Update.prototype.activePhase))
module.exports=router;